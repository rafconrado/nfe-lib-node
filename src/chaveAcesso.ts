import { obterCodigoUF, type SiglaUF } from './webservices.js';

export interface ParametrosChaveAcesso {
  /** Sigla da UF (ex: 'SP', 'DF') ou código IBGE de 2 dígitos (ex: '35', '53') */
  uf: SiglaUF | (string & {});
  /** Data de emissão (Date, string ISO 'YYYY-MM-DD...' ou 'AAMM') */
  dataEmissao: Date | string;
  /** CNPJ (14 dígitos) ou CPF (11 dígitos) do emitente */
  cnpjOuCpf: string;
  /** Modelo do documento fiscal ('55' para NF-e, '65' para NFC-e). Padrão: '55' */
  modelo?: '55' | '65' | number | string | undefined;
  /** Série do documento fiscal (1 a 3 dígitos) */
  serie: number | string;
  /** Número da NF-e (1 a 9 dígitos) */
  numero: number | string;
  /** Tipo de emissão (1 = Normal, 6 = SVC-AN, 7 = SVC-RS, 9 = Offline, etc.) */
  tpEmis: number | string;
  /** Código numérico aleatório de 8 dígitos que compõe a chave (cNF) */
  cNF: number | string;
}

export interface ResultadoChaveAcesso {
  /** Chave de acesso completa com 44 dígitos numéricos */
  chave: string;
  /** Dígito verificador calculado em Módulo 11 (1 dígito) */
  cDV: string;
  /** Identificador para a tag `<infNFe Id="NFe...">` */
  id: `NFe${string}`;
}

export interface DadosChaveAcesso {
  /** Chave de acesso limpa com 44 dígitos */
  chave: string;
  /** Código IBGE da UF (2 dígitos) */
  cUF: string;
  /** Ano e mês de emissão no formato AAMM */
  aamm: string;
  /** Ano de emissão com 4 dígitos (ex: '2026') */
  ano: string;
  /** Mês de emissão com 2 dígitos (ex: '11') */
  mes: string;
  /** CNPJ (ou CPF com zeros à esquerda) de 14 dígitos */
  cnpj: string;
  /** Modelo do documento fiscal ('55' ou '65') */
  modelo: string;
  /** Série do documento com 3 dígitos */
  serie: string;
  /** Número da nota fiscal com 9 dígitos */
  numero: string;
  /** Tipo de emissão (1 dígito) */
  tpEmis: string;
  /** Código numérico aleatório (8 dígitos) */
  cNF: string;
  /** Dígito verificador (1 dígito) */
  cDV: string;
  /** Indica se o dígito verificador (Módulo 11) é válido */
  valida: boolean;
}

/**
 * Calcula o dígito verificador (cDV) em Módulo 11 a partir dos 43 primeiros dígitos da chave.
 */
export function calcularDigitoVerificador(chave43: string): string {
  const limpa = chave43.replace(/\D/g, '');
  if (limpa.length !== 43) {
    throw new Error(`A base da chave de acesso deve conter exatamente 43 dígitos (recebido: ${limpa.length}).`);
  }

  let peso = 2;
  let soma = 0;

  for (let i = 42; i >= 0; i--) {
    const digito = Number(limpa[i]);
    soma += digito * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }

  const resto = soma % 11;
  const dv = resto === 0 || resto === 1 ? 0 : 11 - resto;
  return String(dv);
}

/**
 * Gera a chave de acesso de 44 dígitos da NF-e/NFC-e e seu dígito verificador (cDV).
 */
export function gerarChaveAcesso(params: ParametrosChaveAcesso): ResultadoChaveAcesso {
  const ufTrim = params.uf.trim();
  const cUF = /^\d{2}$/.test(ufTrim) ? ufTrim : obterCodigoUF(ufTrim);
  const aamm = extrairAnoMes(params.dataEmissao);

  const docLimpo = params.cnpjOuCpf.replace(/\D/g, '');
  if (docLimpo.length !== 11 && docLimpo.length !== 14) {
    throw new Error('O CNPJ/CPF do emitente deve conter 11 (CPF) ou 14 (CNPJ) dígitos.');
  }
  const cnpj = docLimpo.padStart(14, '0');

  const mod = String(params.modelo ?? '55').padStart(2, '0');
  const serie = String(params.serie).replace(/\D/g, '').padStart(3, '0');
  const nNF = String(params.numero).replace(/\D/g, '').padStart(9, '0');
  const tpEmis = String(params.tpEmis).replace(/\D/g, '');
  const cNF = String(params.cNF).replace(/\D/g, '').padStart(8, '0');

  if (tpEmis.length !== 1) {
    throw new Error('O tipo de emissão (tpEmis) deve conter exatamente 1 dígito.');
  }

  const base43 = `${cUF}${aamm}${cnpj}${mod}${serie}${nNF}${tpEmis}${cNF}`;
  const cDV = calcularDigitoVerificador(base43);
  const chave = `${base43}${cDV}`;

  return {
    chave,
    cDV,
    id: `NFe${chave}`,
  };
}

/**
 * Valida se uma chave de acesso (com ou sem o prefixo 'NFe') possui 44 dígitos e cDV válido.
 */
export function validarChaveAcesso(chaveOuId: string): boolean {
  const limpa = chaveOuId.trim().replace(/^NFe/i, '');
  if (!/^\d{44}$/.test(limpa)) {
    return false;
  }
  const dvEsperado = calcularDigitoVerificador(limpa.slice(0, 43));
  return limpa[43] === dvEsperado;
}

/**
 * Extrai e decompõe os campos que formam uma chave de acesso de 44 dígitos da NF-e/NFC-e.
 */
export function extrairDadosChaveAcesso(chaveOuId: string): DadosChaveAcesso {
  const limpa = chaveOuId.trim().replace(/^NFe/i, '').replace(/\D/g, '');
  if (limpa.length !== 44) {
    throw new Error(`A chave de acesso deve conter 44 dígitos (recebido: ${limpa.length}).`);
  }

  const cUF = limpa.slice(0, 2);
  const aamm = limpa.slice(2, 6);
  const ano = `20${aamm.slice(0, 2)}`;
  const mes = aamm.slice(2, 4);
  const cnpj = limpa.slice(6, 20);
  const modelo = limpa.slice(20, 22);
  const serie = limpa.slice(22, 25);
  const numero = limpa.slice(25, 34);
  const tpEmis = limpa.slice(34, 35);
  const cNF = limpa.slice(35, 43);
  const cDV = limpa.slice(43, 44);
  const valida = calcularDigitoVerificador(limpa.slice(0, 43)) === cDV;

  return {
    chave: limpa,
    cUF,
    aamm,
    ano,
    mes,
    cnpj,
    modelo,
    serie,
    numero,
    tpEmis,
    cNF,
    cDV,
    valida,
  };
}

function extrairAnoMes(data: Date | string): string {
  if (data instanceof Date) {
    const ano = String(data.getFullYear()).slice(-2);
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}${mes}`;
  }
  const str = data.trim();
  if (/^\d{4}$/.test(str)) {
    return str;
  }
  const matchIso = str.match(/^(\d{4})-(\d{2})/);
  if (matchIso?.[1] && matchIso[2]) {
    return `${matchIso[1].slice(-2)}${matchIso[2]}`;
  }
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    const ano = String(parsed.getFullYear()).slice(-2);
    const mes = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${ano}${mes}`;
  }
  throw new Error(`Formato de dataEmissao inválido: "${data}". Use Date, string ISO ou 'AAMM'.`);
}
