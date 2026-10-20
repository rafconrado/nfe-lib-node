import axios from 'axios';
import { Certificado } from './Certificado.js';
import { Assinador } from './Assinador.js';
import { create } from 'xmlbuilder2';
import type { DadosNFe, RetornoSefaz } from './types.js';
import { DOMParser } from '@xmldom/xmldom';

export type AmbienteSefaz = 'producao' | 'homologacao';

export interface ConfiguracaoNFe {
  uf: string;
  ambiente: AmbienteSefaz;
  certificado: Certificado;
}

export class NFe {
  private config: ConfiguracaoNFe;
  private assinador: Assinador;

  constructor(config: ConfiguracaoNFe) {
    this.config = config;
    this.assinador = new Assinador(config.certificado);
  }

  private getUrl(servico: 'status' | 'autorizacao'): string {
    // SVRS (Atende DF, RS, etc)
    const baseUrl = this.config.ambiente === 'homologacao'
      ? 'https://nfe-homologacao.svrs.rs.gov.br/ws'
      : 'https://nfe.svrs.rs.gov.br/ws';

    if (servico === 'status') {
      return `${baseUrl}/NfeStatusServico/NfeStatusServico4.asmx`;
    }
    if (servico === 'autorizacao') {
      return `${baseUrl}/NfeAutorizacao/NFeAutorizacao4.asmx`;
    }
    throw new Error('Serviço desconhecido');
  }

  private getCodigoUF(): string {
    const ufs: Record<string, string> = {
      AC: '12', AL: '27', AM: '13', AP: '16', BA: '29', CE: '23', DF: '53', ES: '32',
      GO: '52', MA: '21', MG: '31', MS: '50', MT: '51', PA: '15', PB: '25', PE: '26',
      PI: '22', PR: '41', RJ: '33', RN: '24', RO: '11', RR: '14', RS: '43', SC: '42',
      SE: '28', SP: '35', TO: '17',
    };
    return ufs[this.config.uf.toUpperCase()] || '53';
  }

  public async consultarStatus(): Promise<RetornoSefaz> {
    const url = this.getUrl('status');
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"><consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${tpAmb}</tpAmb><cUF>${this.getCodigoUF()}</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    return this.enviarSoap(url, xmlBody);
  }

  /**
   * Recebe os dados da NFe em formato JS/JSON, converte para XML, assina e envia.
   */
  public async emitir(dadosNFe: DadosNFe): Promise<RetornoSefaz> {
    const idLote = Math.floor(Math.random() * 1000000).toString();

    // 1. Gera o XML da nota a partir do objeto passado pelo usuário
    const xmlNFeStr = create({ NFe: { '@xmlns': 'http://www.portalfiscal.inf.br/nfe', ...dadosNFe } }).end({ prettyPrint: false });

    // 2. Assina o XML
    console.log('Assinando o XML...');
    const xmlAssinado = xmlCruFormatado(
      this.assinador.assinarXmlNFe(xmlCruFormatado(xmlNFeStr))
    );

    // 3. Monta o Lote (SOAP)
    // A SEFAZ rejeita espaços em branco, quebras de linha ou comentários dentro da tag enviNFe (Erro 588)
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"><enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><idLote>${idLote}</idLote><indSinc>1</indSinc>${xmlAssinado}</enviNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    // 4. Envia
    console.log('Enviando para a SEFAZ...');
    const retorno = await this.enviarSoap(this.getUrl('autorizacao'), xmlBody);
    const docRetorno = new DOMParser().parseFromString(retorno.xml, 'text/xml');
    const protNFeNode = docRetorno.getElementsByTagName('protNFe')[0];
    const xmlNfeProc = protNFeNode
      ? `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">${xmlAssinado}${protNFeNode.toString()}</nfeProc>`
      : undefined;

    return {
      ...retorno,
      xmlAssinado,
      xmlNfeProc,
    };
  }

  private async enviarSoap(url: string, xmlBody: string): Promise<RetornoSefaz> {
    const agent = this.config.certificado.getHttpsAgent();
    try {
      const response = await axios.post(url, xmlBody, {
        httpsAgent: agent,
        headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      });

      const xmlStr = response.data;
      const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');

      // Tenta pegar o cStat do protocolo primeiro (resultado da nota individual)
      let cStatNode = doc.getElementsByTagName('infProt')[0]?.getElementsByTagName('cStat')[0];
      let xMotivoNode = doc.getElementsByTagName('infProt')[0]?.getElementsByTagName('xMotivo')[0];

      // Se não tiver protocolo, pega o cStat geral do lote ou do status de serviço
      if (!cStatNode) {
        cStatNode = doc.getElementsByTagName('cStat')[0];
        xMotivoNode = doc.getElementsByTagName('xMotivo')[0];
      }

      const status = cStatNode && cStatNode.textContent ? parseInt(cStatNode.textContent, 10) : 0;
      const motivo = xMotivoNode && xMotivoNode.textContent ? xMotivoNode.textContent : 'Retorno não identificado';

      // 100 = Autorizado, 104 = Lote Processado, 107 = Serviço em Operação
      const sucesso = status === 100 || status === 104 || status === 107;

      return { sucesso, status, motivo, xml: xmlStr };
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Erro na SEFAZ: HTTP ${error.response.status} - ${error.response.data}`);
      }
      throw error;
    }
  }
}

function xmlCruFormatado(xml: string) {
  // Evita declarações duplicadas do xmlbuilder2 se houver
  return xml.replace(/^<\?xml[^?]*\?>\s*/i, '').trim();
}
