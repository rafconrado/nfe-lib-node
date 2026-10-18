import { DOMParser } from '@xmldom/xmldom';

const CODE128_PATTERNS: readonly string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

interface ItemDanfe {
  cProd: string;
  xProd: string;
  ncm: string;
  origCsosnCst: string;
  cfop: string;
  uCom: string;
  qCom: string;
  vUnCom: string;
  vProd: string;
  vBC: string;
  vICMS: string;
  vIPI: string;
  pICMS: string;
  pIPI: string;
}

interface ColunaTabela {
  x: number;
  w: number;
  label: string;
}

const COLUNAS_ITENS: readonly ColunaTabela[] = [
  { x: 20, w: 42, label: 'COD. PROD' },
  { x: 62, w: 155, label: 'DESCRICAO DO PRODUTO / SERVICO' },
  { x: 217, w: 36, label: 'NCM/SH' },
  { x: 253, w: 28, label: 'O/CSOSN' },
  { x: 281, w: 24, label: 'CFOP' },
  { x: 305, w: 18, label: 'UN' },
  { x: 323, w: 34, label: 'QUANT.' },
  { x: 357, w: 36, label: 'V. UNIT.' },
  { x: 393, w: 36, label: 'V. TOTAL' },
  { x: 429, w: 34, label: 'B.C. ICMS' },
  { x: 463, w: 32, label: 'V. ICMS' },
  { x: 495, w: 28, label: 'V. IPI' },
  { x: 523, w: 26, label: 'AL. ICMS' },
  { x: 549, w: 26, label: 'AL. IPI' },
];

export class Danfe {
  public static fromXml(xmlNFe: string, xmlRetornoSefaz?: string): Buffer {
    const doc = new DOMParser().parseFromString(xmlNFe, 'text/xml');
    const docRetorno = xmlRetornoSefaz
      ? new DOMParser().parseFromString(xmlRetornoSefaz, 'text/xml')
      : doc;

    const infNFe = doc.getElementsByTagName('infNFe')[0];
    const ide = doc.getElementsByTagName('ide')[0];
    const emit = doc.getElementsByTagName('emit')[0];
    const enderEmit = emit?.getElementsByTagName('enderEmit')[0];
    const dest = doc.getElementsByTagName('dest')[0];
    const enderDest = dest?.getElementsByTagName('enderDest')[0];
    const icmsTot = doc.getElementsByTagName('ICMSTot')[0];
    const transp = doc.getElementsByTagName('transp')[0];
    const transporta = transp?.getElementsByTagName('transporta')[0];
    const vol = transp?.getElementsByTagName('vol')[0];
    const detPag = doc.getElementsByTagName('detPag')[0];
    const infAdic = doc.getElementsByTagName('infAdic')[0];
    const infProt =
      docRetorno.getElementsByTagName('infProt')[0] ??
      doc.getElementsByTagName('infProt')[0];

    const rawId = infNFe?.getAttribute('Id') ?? '';
    const chave = rawId.replace(/^NFe/, '').padStart(44, '0');
    const chaveFormatada = chave.replace(/(\d{4})(?=\d)/g, '$1 ');

    const tpAmb = this.getTag(ide, 'tpAmb', '2');
    const natOp = this.getTag(ide, 'natOp', '');
    const nNF = this.getTag(ide, 'nNF', '1');
    const serie = this.getTag(ide, 'serie', '1');
    const tpNF = this.getTag(ide, 'tpNF', '1');
    const dhEmi = this.formatDateTime(this.getTag(ide, 'dhEmi', ''));
    const dhSaiEnt = this.formatDateTime(this.getTag(ide, 'dhSaiEnt', this.getTag(ide, 'dhEmi', '')));

    const emitNome = this.getTag(emit, 'xNome', '');
    const emitCnpj = this.formatDoc(this.getTag(emit, 'CNPJ', this.getTag(emit, 'CPF', '')));
    const emitIe = this.getTag(emit, 'IE', '');
    const emitIeSt = this.getTag(emit, 'IEST', '');
    const emitEnd = `${this.getTag(enderEmit, 'xLgr', '')}, ${this.getTag(enderEmit, 'nro', '')} - ${this.getTag(enderEmit, 'xBairro', '')}`;
    const emitMunUfCep = `${this.getTag(enderEmit, 'xMun', '')}/${this.getTag(enderEmit, 'UF', '')} - CEP ${this.getTag(enderEmit, 'CEP', '')} - Fone ${this.getTag(enderEmit, 'fone', '')}`;

    const destNome = this.getTag(dest, 'xNome', '');
    const destDoc = this.formatDoc(this.getTag(dest, 'CNPJ', this.getTag(dest, 'CPF', '')));
    const destEnd = `${this.getTag(enderDest, 'xLgr', '')}, ${this.getTag(enderDest, 'nro', '')}`;
    const destBairro = this.getTag(enderDest, 'xBairro', '');
    const destCep = this.getTag(enderDest, 'CEP', '');
    const destMun = this.getTag(enderDest, 'xMun', '');
    const destUf = this.getTag(enderDest, 'UF', '');
    const destFone = this.getTag(enderDest, 'fone', '');
    const destIe = this.getTag(dest, 'IE', '');

    const cStat = this.getTag(infProt, 'cStat', this.getTag(docRetorno, 'cStat', ''));
    const xMotivo = this.getTag(infProt, 'xMotivo', this.getTag(docRetorno, 'xMotivo', ''));
    const nProt = this.getTag(infProt, 'nProt', '');
    const dhRecbto = this.formatDateTime(this.getTag(infProt, 'dhRecbto', this.getTag(docRetorno, 'dhRecbto', '')));
    const protocoloTexto = nProt
      ? `${nProt} - ${dhRecbto}`
      : `cStat ${cStat} - ${xMotivo.slice(0, 38)} (${dhRecbto})`;

    const detNodes = doc.getElementsByTagName('det');
    const itens: ItemDanfe[] = [];
    for (let i = 0; i < detNodes.length; i++) {
      const det = detNodes[i];
      if (!det) continue;
      const prod = det.getElementsByTagName('prod')[0];
      const icms = det.getElementsByTagName('ICMS')[0];
      const ipi = det.getElementsByTagName('IPI')[0];
      const orig = this.getTag(icms, 'orig', '0');
      const csosnOrCst = this.getTag(icms, 'CSOSN', this.getTag(icms, 'CST', '00'));
      itens.push({
        cProd: this.getTag(prod, 'cProd', ''),
        xProd: this.getTag(prod, 'xProd', ''),
        ncm: this.getTag(prod, 'NCM', ''),
        origCsosnCst: `${orig}/${csosnOrCst}`,
        cfop: this.getTag(prod, 'CFOP', ''),
        uCom: this.getTag(prod, 'uCom', ''),
        qCom: this.formatDecimal(this.getTag(prod, 'qCom', '0.00')),
        vUnCom: this.formatDecimal(this.getTag(prod, 'vUnCom', '0.00')),
        vProd: this.formatDecimal(this.getTag(prod, 'vProd', '0.00')),
        vBC: this.formatDecimal(this.getTag(icms, 'vBC', '0.00')),
        vICMS: this.formatDecimal(this.getTag(icms, 'vICMS', '0.00')),
        vIPI: this.formatDecimal(this.getTag(ipi, 'vIPI', '0.00')),
        pICMS: this.formatDecimal(this.getTag(icms, 'pICMS', '0.00')),
        pIPI: this.formatDecimal(this.getTag(ipi, 'pIPI', '0.00')),
      });
    }

    const cmds: string[] = [];
    cmds.push('0.5 w');

    this.drawBox(cmds, 20, 782, 450, 38, 'RECEBEMOS DE ' + emitNome.slice(0, 65) + ' OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO');
    this.drawBox(cmds, 20, 782, 110, 20, 'DATA DE RECEBIMENTO');
    this.drawBox(cmds, 130, 782, 340, 20, 'IDENTIFICACAO E ASSINATURA DO RECEBEDOR');
    this.drawBox(cmds, 470, 782, 105, 38, 'NF-e', `No. ${nNF.padStart(9, '0')} / Serie ${serie}`, 7.5, true);

    cmds.push('[2 2] 0 d 0.4 w 20 776 m 575 776 l S [] 0 d 0.5 w');

    this.drawBox(cmds, 20, 688, 220, 82, 'IDENTIFICACAO DO EMITENTE');
    this.drawText(cmds, 24, 752, emitNome.slice(0, 38), 7.5, true);
    this.drawText(cmds, 24, 739, emitEnd.slice(0, 45), 6.5, false);
    this.drawText(cmds, 24, 728, emitMunUfCep.slice(0, 47), 6.5, false);
    if (tpAmb === '2') {
      this.drawText(cmds, 24, 695, 'AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL', 6.5, true);
    }

    this.drawBox(cmds, 240, 688, 95, 82, '');
    this.drawText(cmds, 268, 756, 'DANFE', 11, true);
    this.drawText(cmds, 246, 746, 'Documento Auxiliar da', 6, false);
    this.drawText(cmds, 245, 738, 'Nota Fiscal Eletronica', 6, false);
    this.drawText(cmds, 246, 725, '0 - ENTRADA', 6, false);
    this.drawText(cmds, 246, 717, '1 - SAIDA', 6, false);
    this.drawBox(cmds, 312, 716, 15, 15, '');
    this.drawText(cmds, 317, 720, tpNF, 8.5, true);
    this.drawText(cmds, 246, 703, `No. ${nNF.padStart(9, '0')}`, 7.5, true);
    this.drawText(cmds, 246, 693, `SERIE: ${serie.padStart(3, '0')}   FL 1/1`, 6.5, true);

    this.drawBox(cmds, 335, 729, 240, 41, 'CONTROLE DO FISCO');
    this.drawCode128C(cmds, chave, 348, 733, 214, 26);
    this.drawBox(cmds, 335, 688, 240, 41, 'CHAVE DE ACESSO', chaveFormatada, 7, true);

    this.drawBox(cmds, 20, 666, 315, 22, 'NATUREZA DA OPERACAO', natOp, 7.5, false);
    this.drawBox(cmds, 335, 666, 240, 22, 'PROTOCOLO DE AUTORIZACAO DE USO', protocoloTexto, 6.5, true);

    this.drawBox(cmds, 20, 644, 185, 22, 'INSCRICAO ESTADUAL', emitIe, 7.5, false);
    this.drawBox(cmds, 205, 644, 185, 22, 'INSC. ESTADUAL DO SUBST. TRIBUTARIO', emitIeSt, 7.5, false);
    this.drawBox(cmds, 390, 644, 185, 22, 'CNPJ / CPF', emitCnpj, 7.5, true);

    this.drawSectionHeader(cmds, 20, 633, 'DESTINATARIO / REMETENTE');
    this.drawBox(cmds, 20, 609, 340, 22, 'NOME / RAZAO SOCIAL', destNome.slice(0, 64), 7.5, false);
    this.drawBox(cmds, 360, 609, 130, 22, 'CNPJ / CPF', destDoc, 7.5, true);
    this.drawBox(cmds, 490, 609, 85, 22, 'DATA DA EMISSAO', dhEmi.slice(0, 10), 7.5, false);

    this.drawBox(cmds, 20, 587, 270, 22, 'ENDERECO', destEnd.slice(0, 48), 7.5, false);
    this.drawBox(cmds, 290, 587, 120, 22, 'BAIRRO / DISTRITO', destBairro.slice(0, 24), 7.5, false);
    this.drawBox(cmds, 410, 587, 80, 22, 'CEP', destCep, 7.5, false);
    this.drawBox(cmds, 490, 587, 85, 22, 'DATA SAIDA/ENTRADA', dhSaiEnt.slice(0, 10), 7.5, false);

    this.drawBox(cmds, 20, 565, 220, 22, 'MUNICIPIO', destMun, 7.5, false);
    this.drawBox(cmds, 240, 565, 95, 22, 'FONE / FAX', destFone, 7.5, false);
    this.drawBox(cmds, 335, 565, 30, 22, 'UF', destUf, 7.5, false);
    this.drawBox(cmds, 365, 565, 125, 22, 'INSCRICAO ESTADUAL', destIe, 7.5, false);
    this.drawBox(cmds, 490, 565, 85, 22, 'HORA DA SAIDA', dhSaiEnt.slice(11, 19), 7.5, false);

    this.drawSectionHeader(cmds, 20, 554, 'FATURA / PAGAMENTO');
    const tPag = this.getTag(detPag, 'tPag', '01');
    const vPag = this.formatDecimal(this.getTag(detPag, 'vPag', '0.00'));
    this.drawBox(cmds, 20, 530, 185, 22, 'FORMA DE PAGAMENTO', this.getDescricaoPagamento(tPag), 7.5, false);
    this.drawBox(cmds, 205, 530, 185, 22, 'VALOR DO PAGAMENTO (R$)', vPag, 7.5, true);
    this.drawBox(cmds, 390, 530, 185, 22, 'TROCO (R$)', this.formatDecimal(this.getTag( doc.getElementsByTagName('pag')[0], 'vTroco', '0.00')), 7.5, false);

    this.drawSectionHeader(cmds, 20, 519, 'CALCULO DO IMPOSTO');
    this.drawBox(cmds, 20, 495, 70, 22, 'BASE CALC. ICMS', this.formatDecimal(this.getTag(icmsTot, 'vBC', '0.00')), 7.5, false);
    this.drawBox(cmds, 90, 495, 68, 22, 'VALOR DO ICMS', this.formatDecimal(this.getTag(icmsTot, 'vICMS', '0.00')), 7.5, false);
    this.drawBox(cmds, 158, 495, 68, 22, 'BASE CALC. ICMS ST', this.formatDecimal(this.getTag(icmsTot, 'vBCST', '0.00')), 7.5, false);
    this.drawBox(cmds, 226, 495, 68, 22, 'VALOR ICMS SUBST.', this.formatDecimal(this.getTag(icmsTot, 'vST', '0.00')), 7.5, false);
    this.drawBox(cmds, 294, 495, 65, 22, 'V. IMP. IMPORTACAO', this.formatDecimal(this.getTag(icmsTot, 'vII', '0.00')), 7.5, false);
    this.drawBox(cmds, 359, 495, 65, 22, 'VALOR DO FCP', this.formatDecimal(this.getTag(icmsTot, 'vFCP', '0.00')), 7.5, false);
    this.drawBox(cmds, 424, 495, 65, 22, 'VALOR DO PIS', this.formatDecimal(this.getTag(icmsTot, 'vPIS', '0.00')), 7.5, false);
    this.drawBox(cmds, 489, 495, 86, 22, 'V. TOTAL PRODUTOS', this.formatDecimal(this.getTag(icmsTot, 'vProd', '0.00')), 7.5, true);

    this.drawBox(cmds, 20, 473, 70, 22, 'VALOR DO FRETE', this.formatDecimal(this.getTag(icmsTot, 'vFrete', '0.00')), 7.5, false);
    this.drawBox(cmds, 90, 473, 68, 22, 'VALOR DO SEGURO', this.formatDecimal(this.getTag(icmsTot, 'vSeg', '0.00')), 7.5, false);
    this.drawBox(cmds, 158, 473, 68, 22, 'DESCONTO', this.formatDecimal(this.getTag(icmsTot, 'vDesc', '0.00')), 7.5, false);
    this.drawBox(cmds, 226, 473, 68, 22, 'OUTRAS DESPESAS', this.formatDecimal(this.getTag(icmsTot, 'vOutro', '0.00')), 7.5, false);
    this.drawBox(cmds, 294, 473, 65, 22, 'VALOR TOTAL IPI', this.formatDecimal(this.getTag(icmsTot, 'vIPI', '0.00')), 7.5, false);
    this.drawBox(cmds, 359, 473, 65, 22, 'V. APROX. TRIBUTOS', this.formatDecimal(this.getTag(icmsTot, 'vTotTrib', '0.00')), 7.5, false);
    this.drawBox(cmds, 424, 473, 65, 22, 'VALOR DA COFINS', this.formatDecimal(this.getTag(icmsTot, 'vCOFINS', '0.00')), 7.5, false);
    this.drawBox(cmds, 489, 473, 86, 22, 'V. TOTAL DA NOTA', this.formatDecimal(this.getTag(icmsTot, 'vNF', '0.00')), 8.5, true);

    this.drawSectionHeader(cmds, 20, 462, 'TRANSPORTADOR / VOLUMES TRANSPORTADOS');
    const modFrete = this.getTag(transp, 'modFrete', '9');
    this.drawBox(cmds, 20, 438, 210, 22, 'NOME / RAZAO SOCIAL', this.getTag(transporta, 'xNome', ''), 7.5, false);
    this.drawBox(cmds, 230, 438, 95, 22, 'FRETE POR CONTA', this.getDescricaoFrete(modFrete), 7, false);
    this.drawBox(cmds, 325, 438, 65, 22, 'CODIGO ANTT', '', 7.5, false);
    this.drawBox(cmds, 390, 438, 65, 22, 'PLACA DO VEICULO', '', 7.5, false);
    this.drawBox(cmds, 455, 438, 25, 22, 'UF', '', 7.5, false);
    this.drawBox(cmds, 480, 438, 95, 22, 'CNPJ / CPF', this.formatDoc(this.getTag(transporta, 'CNPJ', '')), 7.5, false);

    this.drawBox(cmds, 20, 416, 85, 22, 'QUANTIDADE', this.getTag(vol, 'qVol', ''), 7.5, false);
    this.drawBox(cmds, 105, 416, 110, 22, 'ESPECIE', this.getTag(vol, 'esp', ''), 7.5, false);
    this.drawBox(cmds, 215, 416, 100, 22, 'MARCA', this.getTag(vol, 'marca', ''), 7.5, false);
    this.drawBox(cmds, 315, 416, 90, 22, 'NUMERACAO', this.getTag(vol, 'nVol', ''), 7.5, false);
    this.drawBox(cmds, 405, 416, 85, 22, 'PESO BRUTO', this.getTag(vol, 'pesoB', ''), 7.5, false);
    this.drawBox(cmds, 490, 416, 85, 22, 'PESO LIQUIDO', this.getTag(vol, 'pesoL', ''), 7.5, false);

    this.drawSectionHeader(cmds, 20, 405, 'DADOS DOS PRODUTOS / SERVICOS');
    const headerY = 388;
    const headerH = 14;
    const tableBottomY = 112;
    const tableBodyH = headerY - tableBottomY;

    for (const col of COLUNAS_ITENS) {
      cmds.push(`${col.x} ${headerY} ${col.w} ${headerH} re S`);
      this.drawText(cmds, col.x + 2, headerY + 4, col.label, 5, true);
      cmds.push(`${col.x} ${tableBottomY} ${col.w} ${tableBodyH} re S`);
    }

    let rowY = headerY - 11;
    for (const item of itens) {
      if (rowY < tableBottomY + 8) break;
      this.drawText(cmds, 22, rowY, item.cProd.slice(0, 9), 6, false);
      this.drawText(cmds, 64, rowY, item.xProd.slice(0, 36), 6, false);
      this.drawText(cmds, 219, rowY, item.ncm, 6, false);
      this.drawText(cmds, 255, rowY, item.origCsosnCst, 6, false);
      this.drawText(cmds, 283, rowY, item.cfop, 6, false);
      this.drawText(cmds, 307, rowY, item.uCom.slice(0, 4), 6, false);
      this.drawText(cmds, 325, rowY, item.qCom, 6, false);
      this.drawText(cmds, 359, rowY, item.vUnCom, 6, false);
      this.drawText(cmds, 395, rowY, item.vProd, 6, false);
      this.drawText(cmds, 431, rowY, item.vBC, 6, false);
      this.drawText(cmds, 465, rowY, item.vICMS, 6, false);
      this.drawText(cmds, 497, rowY, item.vIPI, 6, false);
      this.drawText(cmds, 525, rowY, item.pICMS, 6, false);
      this.drawText(cmds, 551, rowY, item.pIPI, 6, false);

      cmds.push(`[1 2] 0 d 0.25 w 20 ${rowY - 4} m 575 ${rowY - 4} l S [] 0 d 0.5 w`);
      rowY -= 13;
    }

    if (tpAmb === '2') {
      cmds.push('0.78 g');
      this.drawText(cmds, 115, 245, 'SEM VALOR FISCAL - HOMOLOGACAO', 18, true);
      cmds.push('0 g');
    }

    this.drawSectionHeader(cmds, 20, 100, 'DADOS ADICIONAIS');
    const infCpl = this.getTag(infAdic, 'infCpl', '');
    const textoAdicional = infCpl
      ? `${infCpl} | Status SEFAZ: ${cStat} - ${xMotivo}`
      : `Ambiente: ${tpAmb === '2' ? '2 - Homologacao (Sem Valor Fiscal)' : '1 - Producao'} | Status SEFAZ: ${cStat} - ${xMotivo}`;
    this.drawBox(cmds, 20, 40, 370, 57, 'INFORMACOES COMPLEMENTARES', textoAdicional.slice(0, 82), 6.5, false);
    this.drawBox(cmds, 390, 40, 185, 57, 'RESERVADO AO FISCO', '', 6.5, false);

    this.drawText(cmds, 543, 33, 'nfe-lib-node', 5.5, false);

    return this.buildPdfBuffer(cmds.join('\n'));
  }

  private static getDescricaoFrete(modFrete: string): string {
    const mapa: Record<string, string> = {
      '0': '0-Remetente (CIF)',
      '1': '1-Destinatario (FOB)',
      '2': '2-Terceiros',
      '3': '3-Proprio Remet.',
      '4': '4-Proprio Dest.',
      '9': '9-Sem Transporte',
    };
    return mapa[modFrete] ?? modFrete;
  }

  private static getDescricaoPagamento(tPag: string): string {
    const mapa: Record<string, string> = {
      '01': '01 - Dinheiro',
      '02': '02 - Cheque',
      '03': '03 - Cartao de Credito',
      '04': '04 - Cartao de Debito',
      '15': '15 - Boleto Bancario',
      '17': '17 - PIX',
      '90': '90 - Sem Pagamento',
      '99': '99 - Outros',
    };
    return mapa[tPag] ?? `Codigo ${tPag}`;
  }

  private static formatDecimal(val: string): string {
    const num = Number(val.replace(',', '.'));
    if (Number.isNaN(num)) return val;
    return num.toFixed(2).replace('.', ',');
  }

  private static getTag(
    parent: { getElementsByTagName?: (name: string) => ArrayLike<{ textContent?: string | null }> } | undefined,
    tagName: string,
    fallback: string
  ): string {
    if (!parent || typeof parent.getElementsByTagName !== 'function') {
      return fallback;
    }
    const node = parent.getElementsByTagName(tagName)[0];
    return node?.textContent?.trim() || fallback;
  }

  private static formatDoc(doc: string): string {
    const digits = doc.replace(/\D/g, '');
    if (digits.length === 14) {
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    if (digits.length === 11) {
      return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    return doc;
  }

  private static formatDateTime(iso: string): string {
    if (!iso || iso.length < 19) return iso;
    const datePart = `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
    const timePart = iso.slice(11, 19);
    return `${datePart} ${timePart}`;
  }

  private static drawSectionHeader(cmds: string[], x: number, y: number, title: string): void {
    this.drawText(cmds, x, y, title, 6, true);
  }

  private static drawBox(
    cmds: string[],
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value = '',
    valueSize = 7.5,
    boldValue = false
  ): void {
    cmds.push(`${x} ${y} ${w} ${h} re S`);
    if (label) {
      this.drawText(cmds, x + 2.5, y + h - 6.5, label, 5, false);
    }
    if (value) {
      this.drawText(cmds, x + 2.5, y + 4.5, value, valueSize, boldValue);
    }
  }

  private static drawText(cmds: string[], x: number, y: number, text: string, size: number, bold: boolean): void {
    const font = bold ? '/F2' : '/F1';
    const escaped = this.escapePdfText(text);
    cmds.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escaped}) Tj ET`);
  }

  private static escapePdfText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  private static drawCode128C(cmds: string[], digits: string, x: number, y: number, width: number, height: number): void {
    const clean = digits.replace(/\D/g, '').padStart(44, '0').slice(0, 44);
    const codes: number[] = [105];
    let checksum = 105;
    for (let i = 0; i < clean.length; i += 2) {
      const pairVal = parseInt(clean.slice(i, i + 2), 10);
      codes.push(pairVal);
      checksum += pairVal * (i / 2 + 1);
    }
    codes.push(checksum % 103);
    codes.push(106);

    const patterns = codes.map((c) => CODE128_PATTERNS[c] ?? '212222');
    const totalModules = patterns.reduce(
      (acc, p) => acc + p.split('').reduce((s, d) => s + Number(d), 0),
      0
    );
    const moduleWidth = width / totalModules;

    let cursorX = x;
    for (const pattern of patterns) {
      for (let i = 0; i < pattern.length; i++) {
        const modCount = Number(pattern[i] ?? '1');
        const barW = modCount * moduleWidth;
        if (i % 2 === 0) {
          cmds.push(`${cursorX.toFixed(2)} ${y.toFixed(2)} ${barW.toFixed(2)} ${height.toFixed(2)} re f`);
        }
        cursorX += barW;
      }
    }
  }

  private static buildPdfBuffer(contentStream: string): Buffer {
    const streamBytes = Buffer.byteLength(contentStream, 'latin1');
    const objects: string[] = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
      '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
      `6 0 obj\n<< /Length ${streamBytes} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(Buffer.byteLength(pdf, 'latin1'));
      pdf += obj;
    }

    const xrefStart = Buffer.byteLength(pdf, 'latin1');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
      const offset = offsets[i] ?? 0;
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

    return Buffer.from(pdf, 'latin1');
  }
}
