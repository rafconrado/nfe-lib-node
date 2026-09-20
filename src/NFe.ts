import axios from 'axios';
import { Certificado } from './Certificado';
import { Assinador } from './Assinador';
import { create } from 'xmlbuilder2';
import { DadosNFe, RetornoSefaz } from './types';

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
    this.assinador = new Assinador(config.certificado.pfxBuffer, config.certificado.password);
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
    const ufs: Record<string, string> = { 'DF': '53' };
    return ufs[this.config.uf.toUpperCase()] || '53';
  }

  public async consultarStatus(): Promise<RetornoSefaz> {
    const url = this.getUrl('status');
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';
    
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">
      <consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
        <tpAmb>${tpAmb}</tpAmb>
        <cUF>${this.getCodigoUF()}</cUF>
        <xServ>STATUS</xServ>
      </consStatServ>
    </nfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;

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
    const xmlAssinado = this.assinador.assinarXmlNFe(xmlCruFormatado(xmlNFeStr));

    // 3. Monta o Lote (SOAP)
    // A SEFAZ rejeita espaços em branco, quebras de linha ou comentários dentro da tag enviNFe (Erro 588)
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"><enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><idLote>${idLote}</idLote><indSinc>1</indSinc>${xmlAssinado.replace('<?xml version="1.0"?>', '').trim()}</enviNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    // 4. Envia
    console.log('Enviando para a SEFAZ...');
    return this.enviarSoap(this.getUrl('autorizacao'), xmlBody);
  }

  private async enviarSoap(url: string, xmlBody: string) {
    const agent = this.config.certificado.getHttpsAgent();
    try {
      const response = await axios.post(url, xmlBody, {
        httpsAgent: agent,
        headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      });
      return { sucesso: true, xml: response.data };
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
    return xml.replace('<?xml version="1.0"?>', '').trim();
}
