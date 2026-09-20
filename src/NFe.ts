import axios from 'axios';
import { Certificado } from './Certificado';

export type AmbienteSefaz = 'producao' | 'homologacao';

export interface ConfiguracaoNFe {
  uf: string;
  ambiente: AmbienteSefaz;
  certificado: Certificado;
}

export class NFe {
  private config: ConfiguracaoNFe;

  constructor(config: ConfiguracaoNFe) {
    this.config = config;
  }

  /**
   * Obtém a URL base do WebService da SEFAZ dependendo do estado (UF) e ambiente.
   * Obs: Esta é uma simplificação inicial apontando para SVRS (atende DF, etc).
   * Em uma versão completa, haveria um mapeador complexo de UFs para URLs.
   */
  private getStatusServicoUrl(): string {
    if (this.config.ambiente === 'homologacao') {
      // SVRS Homologação (Atende DF, RS, etc)
      return 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx';
    }
    // SVRS Produção
    return 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx';
  }

  /**
   * Obtém o código do IBGE referente à UF.
   */
  private getCodigoUF(): string {
    const ufs: Record<string, string> = {
      'DF': '53',
      // Adicionar outras futuramente...
    };
    return ufs[this.config.uf.toUpperCase()] || '53';
  }

  /**
   * Consulta o Status de Serviço na SEFAZ para verificar disponibilidade.
   */
  public async consultarStatus(): Promise<any> {
    const codigoUf = this.getCodigoUF();
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';
    const url = this.getStatusServicoUrl();

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">
      <consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
        <tpAmb>${tpAmb}</tpAmb>
        <cUF>${codigoUf}</cUF>
        <xServ>STATUS</xServ>
      </consStatServ>
    </nfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;

    const agent = this.config.certificado.getHttpsAgent();

    try {
      const response = await axios.post(url, xmlBody, {
        httpsAgent: agent,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
        },
      });

      return {
        sucesso: true,
        xml: response.data
      };
    } catch (error: any) {
      if (error.response) {
         throw new Error(`Erro na SEFAZ: ${error.response.status} - ${error.response.data}`);
      }
      throw error;
    }
  }
}
