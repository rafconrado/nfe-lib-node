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
