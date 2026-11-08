import axios from 'axios';
import { Certificado } from './Certificado.js';
import { Assinador } from './Assinador.js';
import { create } from 'xmlbuilder2';
import type { DadosNFe, RetornoSefaz } from './types.js';
import { DOMParser } from '@xmldom/xmldom';
import {
  obterAutorizadorPorUF,
  obterCodigoUF,
  obterUrlSefaz,
  type AmbienteSefaz,
  type AutorizadorSefaz,
  type ServicoSefaz,
  type SiglaUF,
} from './webservices.js';
import { validarChaveAcesso } from './chaveAcesso.js';

export type { AmbienteSefaz } from './webservices.js';

export interface ConfiguracaoNFe {
  uf: SiglaUF | (string & {});
  ambiente: AmbienteSefaz;
  certificado: Certificado;
  contingencia?: boolean | undefined;
}

export class NFe {
  private config: ConfiguracaoNFe;
  private assinador: Assinador;

  constructor(config: ConfiguracaoNFe) {
    this.config = config;
    this.assinador = new Assinador(config.certificado);
  }

  public getAutorizador(): AutorizadorSefaz {
    return obterAutorizadorPorUF(this.config.uf, this.config.contingencia ?? false);
  }

  public getUrl(servico: ServicoSefaz): string {
    return obterUrlSefaz(
      this.config.uf,
      this.config.ambiente,
      servico,
      this.config.contingencia ?? false
    );
  }

  public getCodigoUF(): string {
    return obterCodigoUF(this.config.uf);
  }

  public async consultarStatus(): Promise<RetornoSefaz> {
    const url = this.getUrl('status');
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"><consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${tpAmb}</tpAmb><cUF>${this.getCodigoUF()}</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    return this.enviarSoap(url, xmlBody);
  }

  public async consultarProtocolo(chaveOuId: string): Promise<RetornoSefaz> {
    const chave = chaveOuId.trim().replace(/^NFe/i, '');
    if (!validarChaveAcesso(chave)) {
      throw new Error(`Chave de acesso inválida: "${chaveOuId}". Informe uma chave de 44 dígitos com dígito verificador válido.`);
    }

    const url = this.getUrl('consultaProtocolo');
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4"><consSitNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${tpAmb}</tpAmb><xServ>CONSULTAR</xServ><chNFe>${chave}</chNFe></consSitNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

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
