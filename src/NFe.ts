import axios from 'axios';
import { gunzipSync } from 'zlib';
import { Certificado } from './Certificado.js';
import { Assinador } from './Assinador.js';
import { create } from 'xmlbuilder2';
import type {
  DadosNFe,
  DocumentoDistribuicaoDFe,
  RetornoDistribuicaoDFe,
  RetornoSefaz,
} from './types.js';
import { DOMParser } from '@xmldom/xmldom';
import {
  CODIGO_ORGAO_AMBIENTE_NACIONAL,
  getAutorizadorPorUF,
  getCodigoUF,
  getUrlAmbienteNacional,
  getUrlSefaz,
  type AmbienteSefaz,
  type AutorizadorSefaz,
  type ServicoSefaz,
  type SiglaUF,
} from './webservices.js';
import {
  gerarChaveAcesso,
  getDadosChaveAcesso,
  validarChaveAcesso,
} from './chaveAcesso.js';

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
  nSeqEvento?: number | undefined | string;
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

export interface ParametrosInutilizacaoNFe {
  /** CNPJ do emitente (14 dígitos) */
  cnpj: string;
  /** Série da numeração a ser inutilizada (0 a 999) */
  serie: number | string;
  /** Número inicial da faixa de NF-e a ser inutilizada */
  numeroInicial: number | string;
  /** Número final da faixa de NF-e a ser inutilizada (opcional; padrão igual a numeroInicial) */
  numeroFinal?: number | string | undefined;
  /** Justificativa do pedido de inutilização (mínimo de 15 caracteres) */
  justificativa: string;
  /** Ano de inutilização com 2 ou 4 dígitos (opcional; padrão: ano atual) */
  ano?: number | string | undefined;
  /** Modelo do documento fiscal ('55' para NF-e, '65' para NFC-e; padrão: '55') */
  modelo?: '55' | '65' | number | string | undefined;
}

export type TipoManifestacao =
  | 'confirmacao'
  | 'ciencia'
  | 'desconhecimento'
  | 'nao_realizada'
  | '210200'
  | '210210'
  | '210220'
  | '210240';

export interface ParametrosManifestacaoNFe {
  /** Chave de acesso de 44 dígitos da NF-e (com ou sem o prefixo 'NFe') */
  chave: string;
  /** Tipo de manifestação ('ciencia' | 'confirmacao' | 'desconhecimento' | 'nao_realizada' ou '210200' | '210210' | '210220' | '210240') */
  tipo: TipoManifestacao;
  /** Justificativa da manifestação (obrigatória apenas para 'nao_realizada' / '210240', entre 15 e 255 caracteres) */
  justificativa?: string | undefined;
  /** CNPJ ou CPF do destinatário autor do evento (opcional; padrão: extraído do Certificado A1) */
  cnpjOuCpf?: string | undefined;
  /** Data e hora do evento (opcional; padrão: data/hora atual no formato ISO com timezone) */
  dhEvento?: string | Date | undefined;
  /** Número sequencial do evento (opcional; padrão: 1) */
  nSeqEvento?: number | string | undefined;
}

export interface ParametrosDistribuicaoDFe {
  /** Último NSU recebido para consultar novos documentos a partir dele (ex: '0' ou '000000000000000'; padrão: '000000000000000') */
  ultimoNSU?: number | string | undefined;
  /** NSU específico de 15 dígitos para consulta pontual (consNSU) */
  nsu?: number | string | undefined;
  /** Chave de acesso de 44 dígitos para consulta pontual de NF-e (consChNFe) */
  chave?: string | undefined;
  /** CNPJ (14 dígitos) ou CPF (11 dígitos) do interessado (opcional; padrão: extraído do Certificado A1) */
  cnpjOuCpf?: string | undefined;
  /** UF do autor da consulta (opcional; padrão: UF configurada na instância da classe NFe) */
  ufAutor?: SiglaUF | (string & {}) | undefined;
}

const MAPA_MANIFESTACAO: Record<
  TipoManifestacao,
  { tpEvento: '210200' | '210210' | '210220' | '210240'; descEvento: string }
> = {
  confirmacao: { tpEvento: '210200', descEvento: 'Confirmacao da Operacao' },
  '210200': { tpEvento: '210200', descEvento: 'Confirmacao da Operacao' },
  ciencia: { tpEvento: '210210', descEvento: 'Ciencia da Operacao' },
  '210210': { tpEvento: '210210', descEvento: 'Ciencia da Operacao' },
  desconhecimento: { tpEvento: '210220', descEvento: 'Desconhecimento da Operacao' },
  '210220': { tpEvento: '210220', descEvento: 'Desconhecimento da Operacao' },
  nao_realizada: { tpEvento: '210240', descEvento: 'Operacao nao Realizada' },
  '210240': { tpEvento: '210240', descEvento: 'Operacao nao Realizada' },
};

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
   * Recebe os dados da NFe em formato JS/JSON, preenche automaticamente Chave de Acesso / cDV / cNF se omitidos,
   * converte para XML, assina e envia para a SEFAZ.
   */
  public async emitir(dadosNFe: DadosNFe): Promise<RetornoSefaz> {
    const idLote = Math.floor(Math.random() * 1000000).toString();
    const { dadosNormalizados, chave } = this.normalizarDadosNFe(dadosNFe);

    // 1. Gera o XML da nota a partir do objeto normalizado
    const xmlNFeStr = create({
      NFe: { '@xmlns': 'http://www.portalfiscal.inf.br/nfe', ...dadosNormalizados },
    }).end({ prettyPrint: false });

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
      chave,
      xmlAssinado,
      xmlNfeProc,
    };
  }

  private normalizarDadosNFe(dadosNFe: DadosNFe): { dadosNormalizados: DadosNFe; chave: string } {
    const { infNFe } = dadosNFe;
    const { ide, emit, ['@Id']: idInformado, ['@versao']: versaoInformada, ...restoInfNFe } = infNFe;

    const cUF = ide.cUF ?? this.getCodigoUF();
    const mod = ide.mod ?? '55';
    const tpAmb = ide.tpAmb ?? (this.config.ambiente === 'producao' ? '1' : '2');
    const dhEmi = ide.dhEmi ?? formatarDataHoraEvento();

    const chaveInformadaLimpa = idInformado?.trim().replace(/^NFe/i, '');
    const cNF =
      ide.cNF ??
      (chaveInformadaLimpa && /^\d{44}$/.test(chaveInformadaLimpa)
        ? chaveInformadaLimpa.slice(35, 43)
        : String(Math.floor(10000000 + Math.random() * 90000000)));

    const docEmitente = emit.CNPJ ?? emit.CPF ?? '';
    const calculada = gerarChaveAcesso({
      uf: cUF,
      dataEmissao: dhEmi,
      cnpjOuCpf: docEmitente,
      modelo: mod,
      serie: ide.serie,
      numero: ide.nNF,
      tpEmis: ide.tpEmis,
      cNF,
    });

    if (idInformado !== undefined && !validarChaveAcesso(idInformado)) {
      throw new Error(
        `Chave de acesso inválida em infNFe["@Id"]: "${idInformado}". O dígito verificador correto seria "${calculada.cDV}" (${calculada.id}).`
      );
    }

    if (ide.cDV !== undefined && ide.cDV.trim() !== calculada.cDV && idInformado === undefined) {
      throw new Error(
        `Dígito verificador (ide.cDV = "${ide.cDV}") inválido. O valor calculado em Módulo 11 é "${calculada.cDV}".`
      );
    }

    const chaveFinal = chaveInformadaLimpa ?? calculada.chave;
    const cDVFinal = ide.cDV ?? chaveFinal.slice(43, 44);

    const ideComDefaults: Record<string, unknown> = {
      ...ide,
      cUF,
      cNF: String(cNF).replace(/\D/g, '').padStart(8, '0'),
      mod,
      dhEmi,
      cDV: cDVFinal,
      tpAmb,
    };

    const ideOrdenado: Record<string, unknown> = {};
    for (const campo of ORDEM_CAMPOS_IDE) {
      if (ideComDefaults[campo] !== undefined) {
        ideOrdenado[campo] = ideComDefaults[campo];
      }
    }
    for (const [k, v] of Object.entries(ideComDefaults)) {
      if (!(k in ideOrdenado) && v !== undefined) {
        ideOrdenado[k] = v;
      }
    }

    const dadosNormalizados: DadosNFe = {
      infNFe: {
        '@Id': `NFe${chaveFinal}`,
        '@versao': versaoInformada ?? '4.00',
        ide: ideOrdenado as unknown as DadosNFe['infNFe']['ide'],
        emit,
        ...restoInfNFe,
      },
    };

    return { dadosNormalizados, chave: chaveFinal };
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

  /**
   * Solicita a inutilização de uma faixa de numeração de NF-e/NFC-e na SEFAZ (NFeInutilizacao4).
   */
  public async inutilizar(params: ParametrosInutilizacaoNFe): Promise<RetornoSefaz> {
    const cnpj = params.cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      throw new Error('O CNPJ para inutilização deve conter 14 dígitos numéricos.');
    }

    const justificativa = params.justificativa.trim();
    if (justificativa.length < 15) {
      throw new Error('A justificativa de inutilização deve conter no mínimo 15 caracteres.');
    }

    const anoRaw =
      params.ano !== undefined ? String(params.ano).replace(/\D/g, '') : String(new Date().getFullYear());
    if (anoRaw.length !== 2 && anoRaw.length !== 4) {
      throw new Error('O ano para inutilização deve conter 2 ou 4 dígitos.');
    }
    const ano = anoRaw.slice(-2);

    const mod = String(params.modelo ?? '55').trim();
    if (mod !== '55' && mod !== '65') {
      throw new Error('O modelo do documento fiscal deve ser "55" (NF-e) ou "65" (NFC-e).');
    }

    const serieLimpa = String(params.serie).replace(/\D/g, '');
    const serieNum = Number(serieLimpa);
    if (!serieLimpa || !Number.isInteger(serieNum) || serieNum < 0 || serieNum > 999) {
      throw new Error('A série para inutilização deve ser um número inteiro entre 0 e 999.');
    }

    const nNFIniLimpo = String(params.numeroInicial).replace(/\D/g, '');
    const nNFFinLimpo = String(params.numeroFinal ?? params.numeroInicial).replace(/\D/g, '');
    const nNFIniNum = Number(nNFIniLimpo);
    const nNFFinNum = Number(nNFFinLimpo);

    if (
      !nNFIniLimpo ||
      !nNFFinLimpo ||
      !Number.isInteger(nNFIniNum) ||
      !Number.isInteger(nNFFinNum) ||
      nNFIniNum < 1 ||
      nNFFinNum < nNFIniNum ||
      nNFFinLimpo.length > 9
    ) {
      throw new Error('A faixa de numeração (numeroInicial e numeroFinal) para inutilização é inválida.');
    }

    const cUF = this.getCodigoUF();
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';
    const idInut = `ID${cUF}${ano}${cnpj}${mod}${String(serieNum).padStart(3, '0')}${String(nNFIniNum).padStart(9, '0')}${String(nNFFinNum).padStart(9, '0')}`;

    const xmlInutStr = create({
      inutNFe: {
        '@xmlns': 'http://www.portalfiscal.inf.br/nfe',
        '@versao': '4.00',
        infInut: {
          '@Id': idInut,
          tpAmb,
          xServ: 'INUTILIZAR',
          cUF,
          ano,
          CNPJ: cnpj,
          mod,
          serie: String(serieNum),
          nNFIni: String(nNFIniNum),
          nNFFin: String(nNFFinNum),
          xJust: justificativa,
        },
      },
    }).end({ prettyPrint: false });

    const xmlAssinado = xmlCruFormatado(
      this.assinador.assinarXmlInutilizacao(xmlCruFormatado(xmlInutStr))
    );

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeInutilizacao4">${xmlAssinado}</nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    const retorno = await this.enviarSoap(this.getUrl('inutilizacao'), xmlBody);
    const docRetorno = new DOMParser().parseFromString(retorno.xml, 'text/xml');
    const retInutNode = docRetorno.getElementsByTagName('retInutNFe')[0];
    const xmlProcInut = retInutNode
      ? `<?xml version="1.0" encoding="UTF-8"?><ProcInutNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">${xmlAssinado}${retInutNode.toString()}</ProcInutNFe>`
      : undefined;

    return {
      ...retorno,
      xmlAssinado,
      xmlProcInut,
    };
  }

  /**
   * Consulta o resultado do processamento de um lote de NF-e pelo número do recibo de 15 dígitos (NFeRetAutorizacao4).
   */
  public async consultarRecibo(recibo: string): Promise<RetornoSefaz> {
    const reciboLimpo = recibo.trim().replace(/\D/g, '');
    if (!/^\d{15}$/.test(reciboLimpo)) {
      throw new Error(`Número de recibo inválido: "${recibo}". O recibo deve conter exatamente 15 dígitos numéricos.`);
    }

    const url = this.getUrl('retAutorizacao');
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4"><consReciNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><tpAmb>${tpAmb}</tpAmb><nRec>${reciboLimpo}</nRec></consReciNFe></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

    return this.enviarSoap(url, xmlBody);
  }

  /**
   * Registra um evento de Manifestação do Destinatário no Ambiente Nacional (AN - cOrgao 91).
   * Suporta Ciência da Operação (210210), Confirmação da Operação (210200),
   * Desconhecimento da Operação (210220) e Operação não Realizada (210240).
   */
  public async manifestar(params: ParametrosManifestacaoNFe): Promise<RetornoSefaz> {
    const configEvento = MAPA_MANIFESTACAO[params.tipo];
    if (!configEvento) {
      throw new Error(
        `Tipo de manifestação inválido: "${String(params.tipo)}". Utilize "ciencia" (210210), "confirmacao" (210200), "desconhecimento" (210220) ou "nao_realizada" (210240).`
      );
    }

    let docAutor = params.cnpjOuCpf?.replace(/\D/g, '');
    if (!docAutor) {
      try {
        docAutor = this.config.certificado.getDados().cnpjOuCpf?.replace(/\D/g, '');
      } catch {
        // Ignora erro caso o certificado não permita extração automática do documento
      }
    }

    if (!docAutor || (docAutor.length !== 11 && docAutor.length !== 14)) {
      throw new Error(
        'Não foi possível identificar o CNPJ/CPF do destinatário automaticamente pelo certificado. Informe um "cnpjOuCpf" válido (11 ou 14 dígitos) nos parâmetros da manifestação.'
      );
    }

    const detEvento: Record<string, string> = {
      descEvento: configEvento.descEvento,
    };

    if (configEvento.tpEvento === '210240') {
      const justificativa = params.justificativa?.trim() ?? '';
      if (justificativa.length < 15 || justificativa.length > 255) {
        throw new Error(
          'A justificativa é obrigatória para o evento de Operação não Realizada (210240) e deve conter entre 15 e 255 caracteres.'
        );
      }
      detEvento.xJust = justificativa;
    }

    return this.enviarEvento({
      chaveOuId: params.chave,
      tpEvento: configEvento.tpEvento,
      nSeqEvento: params.nSeqEvento ?? 1,
      cnpjOuCpf: docAutor,
      dhEvento: params.dhEvento,
      cOrgao: CODIGO_ORGAO_AMBIENTE_NACIONAL,
      url: getUrlAmbienteNacional(this.config.ambiente, 'recepcaoEvento'),
      detEvento,
    });
  }

  /**
   * Consulta documentos fiscais eletrônicos (NF-e e Eventos) destinados ao CNPJ/CPF no Ambiente Nacional (NFeDistribuicaoDFe).
   * Descompacta automaticamente todos os arquivos GZip retornados em `<docZip>`.
   */
  public async distribuicaoDFe(params: ParametrosDistribuicaoDFe = {}): Promise<RetornoDistribuicaoDFe> {
    const modosInformados = [
      params.ultimoNSU !== undefined,
      params.nsu !== undefined,
      params.chave !== undefined,
    ].filter(Boolean).length;

    if (modosInformados > 1) {
      throw new Error(
        'Informe apenas um modo de consulta por chamada em distribuicaoDFe: "ultimoNSU", "nsu" ou "chave".'
      );
    }

    let docAutor = params.cnpjOuCpf?.replace(/\D/g, '');
    if (!docAutor) {
      try {
        docAutor = this.config.certificado.getDados().cnpjOuCpf?.replace(/\D/g, '');
      } catch {
        // Ignora erro caso o certificado não permita extração automática do documento
      }
    }

    if (!docAutor || (docAutor.length !== 11 && docAutor.length !== 14)) {
      throw new Error(
        'Não foi possível identificar o CNPJ/CPF do interessado automaticamente pelo certificado. Informe um "cnpjOuCpf" válido (11 ou 14 dígitos) nos parâmetros de distribuicaoDFe.'
      );
    }

    const cUFAutor = params.ufAutor ? getCodigoUF(params.ufAutor) : this.getCodigoUF();
    const tpAmb = this.config.ambiente === 'producao' ? '1' : '2';

    const distDFeInt: Record<string, unknown> = {
      '@versao': '1.01',
      '@xmlns': 'http://www.portalfiscal.inf.br/nfe',
      tpAmb,
      cUFAutor,
      ...(docAutor.length === 11 ? { CPF: docAutor } : { CNPJ: docAutor }),
    };

    if (params.chave !== undefined) {
      const chaveLimpa = params.chave.trim().replace(/^NFe/i, '');
      if (!validarChaveAcesso(chaveLimpa)) {
        throw new Error(
          `Chave de acesso inválida: "${params.chave}". Informe uma chave de 44 dígitos com dígito verificador válido.`
        );
      }
      distDFeInt.consChNFe = { chNFe: chaveLimpa };
    } else if (params.nsu !== undefined) {
      const nsuLimpo = String(params.nsu).trim().replace(/\D/g, '');
      if (!nsuLimpo || nsuLimpo.length > 15) {
        throw new Error('O NSU para consulta deve conter entre 1 e 15 dígitos numéricos.');
      }
      distDFeInt.consNSU = { NSU: nsuLimpo.padStart(15, '0') };
    } else {
      const ultNsuRaw =
        params.ultimoNSU !== undefined ? String(params.ultimoNSU).trim().replace(/\D/g, '') : '0';
      if (!ultNsuRaw || ultNsuRaw.length > 15) {
        throw new Error('O ultimoNSU para consulta deve conter entre 1 e 15 dígitos numéricos.');
      }
      distDFeInt.distNSU = { ultNSU: ultNsuRaw.padStart(15, '0') };
    }

    const xmlDistStr = xmlCruFormatado(
      create({ distDFeInt }).end({ prettyPrint: false })
    );

    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe"><nfeDadosMsg>${xmlDistStr}</nfeDadosMsg></nfeDistDFeInteresse></soap12:Body></soap12:Envelope>`;

    const retorno = await this.enviarSoap(
      getUrlAmbienteNacional(this.config.ambiente, 'distribuicaoDFe'),
      xmlBody
    );

    const docRetorno = new DOMParser().parseFromString(retorno.xml, 'text/xml');
    const ultNSU = docRetorno.getElementsByTagName('ultNSU')[0]?.textContent?.trim() || undefined;
    const maxNSU = docRetorno.getElementsByTagName('maxNSU')[0]?.textContent?.trim() || undefined;

    const docZipNodes = docRetorno.getElementsByTagName('docZip');
    const documentos: DocumentoDistribuicaoDFe[] = [];

    for (let i = 0; i < docZipNodes.length; i++) {
      const node = docZipNodes[i];
      if (!node) continue;
      const nsu = node.getAttribute('NSU') ?? '';
      const schema = node.getAttribute('schema') ?? '';
      const conteudoBase64 = (node.textContent ?? '').trim();
      const xml = conteudoBase64 ? descompactarDocZip(conteudoBase64) : '';
      documentos.push({ nsu, schema, xml, conteudoBase64 });
    }

    return {
      ...retorno,
      ultNSU,
      maxNSU,
      documentos,
    };
  }

  private async enviarEvento(opcoes: {
    chaveOuId: string;
    tpEvento: '110111' | '110110' | '210200' | '210210' | '210220' | '210240';
    nSeqEvento: number | string;
    cnpjOuCpf?: string | undefined;
    dhEvento?: string | Date | undefined;
    cOrgao?: string | undefined;
    url?: string | undefined;
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
      cOrgao: opcoes.cOrgao ?? dadosChave.cUF,
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

    const urlDestino = opcoes.url ?? this.getUrl('recepcaoEvento');
    const retorno = await this.enviarSoap(urlDestino, xmlBody);
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

      // Tenta pegar o cStat do protocolo, evento ou inutilização primeiro (resultado individual)
      const infProt = doc.getElementsByTagName('infProt')[0];
      const infEventoRet = doc.getElementsByTagName('retEvento')[0]?.getElementsByTagName('infEvento')[0];
      const infInutRet = doc.getElementsByTagName('retInutNFe')[0]?.getElementsByTagName('infInut')[0];

      // Se não tiver protocolo, evento ou inutilização, pega o cStat geral do lote ou do status de serviço
      const cStatNode =
        infProt?.getElementsByTagName('cStat')[0] ??
        infEventoRet?.getElementsByTagName('cStat')[0] ??
        infInutRet?.getElementsByTagName('cStat')[0] ??
        doc.getElementsByTagName('cStat')[0];

      const xMotivoNode =
        infProt?.getElementsByTagName('xMotivo')[0] ??
        infEventoRet?.getElementsByTagName('xMotivo')[0] ??
        infInutRet?.getElementsByTagName('xMotivo')[0] ??
        doc.getElementsByTagName('xMotivo')[0];

      const status = cStatNode?.textContent ? parseInt(cStatNode.textContent, 10) : 0;
      const motivo = xMotivoNode?.textContent ? xMotivoNode.textContent : 'Retorno não identificado';

      // 100 = Autorizado, 101 = Cancelamento Homologado, 102 = Inutilização Homologada, 104 = Lote Processado, 107 = Serviço em Operação, 135/136 = Evento Registrado, 137/138 = Distribuição DF-e
      const sucesso =
        status === 100 ||
        status === 101 ||
        status === 102 ||
        status === 104 ||
        status === 107 ||
        status === 135 ||
        status === 136 ||
        status === 137 ||
        status === 138;

      return { sucesso, status, motivo, xml: xmlStr };
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Erro na SEFAZ: HTTP ${error.response.status} - ${String(error.response.data)}`);
      }
      throw error;
    }
  }
}

/**
 * Descompacta o conteúdo Base64 + GZip de uma tag `<docZip>` retornada pelo serviço NFeDistribuicaoDFe.
 */
export function descompactarDocZip(conteudoBase64: string): string {
  const bufferCompactado = Buffer.from(conteudoBase64.trim(), 'base64');
  return gunzipSync(bufferCompactado).toString('utf-8');
}

const ORDEM_CAMPOS_IDE: readonly string[] = [
  'cUF',
  'cNF',
  'natOp',
  'mod',
  'serie',
  'nNF',
  'dhEmi',
  'dhSaiEnt',
  'dPrevEntrega',
  'tpNF',
  'idDest',
  'cMunFG',
  'cMunFGIBS',
  'tpImp',
  'tpEmis',
  'cDV',
  'tpAmb',
  'finNFe',
  'tpNFDebito',
  'tpNFCredito',
  'indFinal',
  'indPres',
  'indIntermed',
  'cIndOp',
  'procEmi',
  'verProc',
  'dhCont',
  'xJust',
  'NFref',
  'gCompraGov',
  'gPagAntecipado',
];

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
