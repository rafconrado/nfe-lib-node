import axios from 'axios';
import { Certificado } from './Certificado.js';
import { Assinador } from './Assinador.js';
import { create } from 'xmlbuilder2';
import type { DadosNFe, RetornoSefaz } from './types.js';
import { DOMParser } from '@xmldom/xmldom';
import {
  getAutorizadorPorUF,
  getCodigoUF,
  getUrlSefaz,
  type AmbienteSefaz,
  type AutorizadorSefaz,
  type ServicoSefaz,
  type SiglaUF,
} from './webservices.js';
import { getDadosChaveAcesso, validarChaveAcesso } from './chaveAcesso.js';

export type { AmbienteSefaz } from './webservices.js';

export interface ConfiguracaoNFe {
  uf: SiglaUF | (string & {});
  ambiente: AmbienteSefaz;
  certificado: Certificado;
  contingencia?: boolean | undefined;
}

export interface ParametrosCancelamentoNFe {
  /** Chave de acesso de 44 dígitos da NF-e (com ou sem o prefixo 'NFe') */
  chave: string;
  /** Número do protocolo de autorização da NF-e (15 dígitos) */
  protocolo: string;
  /** Justificativa do cancelamento (mínimo de 15 caracteres) */
  justificativa: string;
  /** CNPJ ou CPF do autor do evento (opcional; padrão: CNPJ extraído da chave de acesso) */
  cnpjOuCpf?: string | undefined;
  /** Data e hora do evento (opcional; padrão: data/hora atual no formato ISO com timezone) */
  dhEvento?: string | Date | undefined;
  /** Número sequencial do evento (opcional; padrão: 1) */
  nSeqEvento?: number | string | undefined;
}

export interface ParametrosCartaCorrecaoNFe {
  /** Chave de acesso de 44 dígitos da NF-e (com ou sem o prefixo 'NFe') */
  chave: string;
  /** Texto da correção a ser registrada (mínimo de 15 caracteres) */
  correcao: string;
  /** Número sequencial do evento de Carta de Correção (1 a 20; padrão: 1) */
  nSeqEvento?: number | string | undefined;
  /** CNPJ ou CPF do autor do evento (opcional; padrão: CNPJ extraído da chave de acesso) */
  cnpjOuCpf?: string | undefined;
  /** Data e hora do evento (opcional; padrão: data/hora atual no formato ISO com timezone) */
  dhEvento?: string | Date | undefined;
}

export class NFe {
  private config: ConfiguracaoNFe;
  private assinador: Assinador;

  constructor(config: ConfiguracaoNFe) {
    this.config = config;
    this.assinador = new Assinador(config.certificado);
  }

  public getAutorizador(): AutorizadorSefaz {
    return getAutorizadorPorUF(this.config.uf, this.config.contingencia ?? false);
  }

  public getUrl(servico: ServicoSefaz): string {
    return getUrlSefaz(
      this.config.uf,
      this.config.ambiente,
      servico,
      this.config.contingencia ?? false
    );
  }

  public getCodigoUF(): string {
    return getCodigoUF(this.config.uf);
  }

  /**
   * Consulta o status de operação do serviço da SEFAZ para a UF configurada.
   */
  public async consultarStatus(): Promise<RetornoSefaz> {
    const url = this.getUrl('status');
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"><consStatServ versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${tpAmb}</tpAmb><cUF>${this.getCodigoUF()}</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    return this.enviarSoap(url, xmlBody);
  }

  /**
   * Consulta a situação atual e o protocolo de uma NF-e na SEFAZ pela chave de acesso de 44 dígitos.
   */
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
    const xmlAssinado = xmlCruFormatado(
      this.assinador.assinarXmlNFe(xmlCruFormatado(xmlNFeStr))
    );

    // 3. Monta o Lote (SOAP)
    // A SEFAZ rejeita espaços em branco, quebras de linha ou comentários dentro da tag enviNFe (Erro 588)
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"><enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><idLote>${idLote}</idLote><indSinc>1</indSinc>${xmlAssinado}</enviNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    // 4. Envia
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

  /**
   * Envia o evento de Cancelamento (tpEvento 110111) de uma NF-e autorizada para a SEFAZ.
   */
  public async cancelar(params: ParametrosCancelamentoNFe): Promise<RetornoSefaz> {
    const protocolo = params.protocolo.trim();
    if (!protocolo) {
      throw new Error('O número do protocolo de autorização é obrigatório para o cancelamento.');
    }

    const justificativa = params.justificativa.trim();
    if (justificativa.length < 15) {
      throw new Error('A justificativa de cancelamento deve conter no mínimo 15 caracteres.');
    }

    return this.enviarEvento({
      chaveOuId: params.chave,
      tpEvento: '110111',
      nSeqEvento: params.nSeqEvento ?? 1,
      cnpjOuCpf: params.cnpjOuCpf,
      dhEvento: params.dhEvento,
      detEvento: {
        descEvento: 'Cancelamento',
        nProt: protocolo,
        xJust: justificativa,
      },
    });
  }

  /**
   * Envia o evento de Carta de Correção Eletrônica - CC-e (tpEvento 110110) para a SEFAZ.
   */
  public async cartaCorrecao(params: ParametrosCartaCorrecaoNFe): Promise<RetornoSefaz> {
    const correcao = params.correcao.trim();
    if (correcao.length < 15) {
      throw new Error('O texto da Carta de Correção deve conter no mínimo 15 caracteres.');
    }

    const condicaoUso =
      'A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.';

    return this.enviarEvento({
      chaveOuId: params.chave,
      tpEvento: '110110',
      nSeqEvento: params.nSeqEvento ?? 1,
      cnpjOuCpf: params.cnpjOuCpf,
      dhEvento: params.dhEvento,
      detEvento: {
        descEvento: 'Carta de Correcao',
        xCorrecao: correcao,
        xCondUso: condicaoUso,
      },
    });
  }

  private async enviarEvento(opcoes: {
    chaveOuId: string;
    tpEvento: '110111' | '110110';
    nSeqEvento: number | string;
    cnpjOuCpf?: string | undefined;
    dhEvento?: string | Date | undefined;
    detEvento: Record<string, string>;
  }): Promise<RetornoSefaz> {
    const chaveLimpa = opcoes.chaveOuId.trim().replace(/^NFe/i, '');
    if (!validarChaveAcesso(chaveLimpa)) {
      throw new Error(`Chave de acesso inválida: "${opcoes.chaveOuId}". Informe uma chave de 44 dígitos com dígito verificador válido.`);
    }

    const dadosChave = getDadosChaveAcesso(chaveLimpa);
    const nSeq = Number(String(opcoes.nSeqEvento).trim());
    if (!Number.isInteger(nSeq) || nSeq < 1 || nSeq > 20) {
      throw new Error('O número sequencial do evento (nSeqEvento) deve ser um inteiro entre 1 e 20.');
    }

    const docAutor = opcoes.cnpjOuCpf ? opcoes.cnpjOuCpf.replace(/\D/g, '') : dadosChave.cnpj;
    if (docAutor.length !== 11 && docAutor.length !== 14) {
      throw new Error('O CNPJ/CPF do autor do evento deve conter 11 (CPF) ou 14 (CNPJ) dígitos.');
    }

    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';
    const seqId = String(nSeq).padStart(2, '0');
    const idEvento = `ID${opcoes.tpEvento}${dadosChave.chave}${seqId}`;

    const infEvento: Record<string, unknown> = {
      '@Id': idEvento,
      cOrgao: dadosChave.cUF,
      tpAmb,
      ...(docAutor.length === 11 ? { CPF: docAutor } : { CNPJ: docAutor }),
      chNFe: dadosChave.chave,
      dhEvento: formatarDataHoraEvento(opcoes.dhEvento),
      tpEvento: opcoes.tpEvento,
      nSeqEvento: String(nSeq),
      verEvento: '1.00',
      detEvento: {
        '@versao': '1.00',
        ...opcoes.detEvento,
      },
    };

    const xmlEventoStr = create({
      evento: {
        '@xmlns': 'http://www.portalfiscal.inf.br/nfe',
        '@versao': '1.00',
        infEvento,
      },
    }).end({ prettyPrint: false });

    const xmlAssinado = xmlCruFormatado(
      this.assinador.assinarXmlEvento(xmlCruFormatado(xmlEventoStr))
    );

    const idLote = Math.floor(Math.random() * 1000000).toString();
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4"><envEvento versao="1.00" xmlns="http://www.portalfiscal.inf.br/nfe"><idLote>${idLote}</idLote>${xmlAssinado}</envEvento></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    const retorno = await this.enviarSoap(this.getUrl('recepcaoEvento'), xmlBody);
    const docRetorno = new DOMParser().parseFromString(retorno.xml, 'text/xml');
    const retEventoNode = docRetorno.getElementsByTagName('retEvento')[0];
    const xmlProcEvento = retEventoNode
      ? `<?xml version="1.0" encoding="UTF-8"?><procEventoNFe versao="1.00" xmlns="http://www.portalfiscal.inf.br/nfe">${xmlAssinado}${retEventoNode.toString()}</procEventoNFe>`
      : undefined;

    return {
      ...retorno,
      xmlAssinado,
      xmlProcEvento,
    };
  }

  private async enviarSoap(url: string, xmlBody: string): Promise<RetornoSefaz> {
    const agent = this.config.certificado.getHttpsAgent();
    try {
      const response = await axios.post<string>(url, xmlBody, {
        httpsAgent: agent,
        headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
      });

      const xmlStr = response.data;
      const doc = new DOMParser().parseFromString(xmlStr, 'text/xml');

      // Tenta pegar o cStat do protocolo ou do evento primeiro (resultado individual)
      const infProt = doc.getElementsByTagName('infProt')[0];
      const infEventoRet = doc.getElementsByTagName('retEvento')[0]?.getElementsByTagName('infEvento')[0];

      // Se não tiver protocolo nem evento, pega o cStat geral do lote ou do status de serviço
      const cStatNode =
        infProt?.getElementsByTagName('cStat')[0] ??
        infEventoRet?.getElementsByTagName('cStat')[0] ??
        doc.getElementsByTagName('cStat')[0];

      const xMotivoNode =
        infProt?.getElementsByTagName('xMotivo')[0] ??
        infEventoRet?.getElementsByTagName('xMotivo')[0] ??
        doc.getElementsByTagName('xMotivo')[0];

      const status = cStatNode?.textContent ? parseInt(cStatNode.textContent, 10) : 0;
      const motivo = xMotivoNode?.textContent ? xMotivoNode.textContent : 'Retorno não identificado';

      // 100 = Autorizado, 101 = Cancelamento Homologado, 104 = Lote Processado, 107 = Serviço em Operação, 135/136 = Evento Registrado
      const sucesso =
        status === 100 ||
        status === 101 ||
        status === 104 ||
        status === 107 ||
        status === 135 ||
        status === 136;

      return { sucesso, status, motivo, xml: xmlStr };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Erro na SEFAZ: HTTP ${error.response.status} - ${String(error.response.data)}`);
      }
      throw error;
    }
  }
}

function xmlCruFormatado(xml: string) {
  // Evita declarações duplicadas do xmlbuilder2 se houver
  return xml.replace(/^<\?xml[^?]*\?>\s*/i, '').trim();
}

function formatarDataHoraEvento(data?: string | Date | undefined): string {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data.trim();
  }
  const d = data instanceof Date ? data : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const offsetMin = -d.getTimezoneOffset();
  const sinal = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const offsetHoras = pad(Math.floor(absMin / 60));
  const offsetResto = pad(absMin % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sinal}${offsetHoras}:${offsetResto}`;
}
