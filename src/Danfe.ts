import { inflateSync, deflateSync } from 'node:zlib';
import { DOMParser } from '@xmldom/xmldom';

export interface OpcoesDanfe {
  /**
   * Logomarca da empresa emitente em formato PNG ou JPEG (`Buffer`, base64 ou Data URI `data:image/...;base64,...`).
   * Quando informada, é renderizada no quadro "IDENTIFICAÇÃO DO EMITENTE" seguindo o padrão NFePHP (`sped-da`).
   */
  logo?: Buffer | string | undefined;
}

interface ImagemPdfEmbed {
  width: number;
  height: number;
  colorSpace: '/DeviceRGB' | '/DeviceGray' | '/DeviceCMYK';
  bitsPerComponent: number;
  filter: string;
  hexStream: string;
}

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
  align?: 'left' | 'center' | 'right';
}

const COLUNAS_ITENS: readonly ColunaTabela[] = [
  { x: 20, w: 44, label: 'CÓDIGO PROD.', align: 'left' },
  { x: 64, w: 153, label: 'DESCRIÇÃO DO PRODUTO / SERVIÇO', align: 'left' },
  { x: 217, w: 36, label: 'NCM/SH', align: 'center' },
  { x: 253, w: 28, label: 'O/CSOSN', align: 'center' },
  { x: 281, w: 24, label: 'CFOP', align: 'center' },
  { x: 305, w: 18, label: 'UN', align: 'center' },
  { x: 323, w: 34, label: 'QUANT.', align: 'right' },
  { x: 357, w: 36, label: 'VALOR UNIT.', align: 'right' },
  { x: 393, w: 36, label: 'VALOR TOTAL', align: 'right' },
  { x: 429, w: 34, label: 'B.CÁLC ICMS', align: 'right' },
  { x: 463, w: 32, label: 'VALOR ICMS', align: 'right' },
  { x: 495, w: 28, label: 'VALOR IPI', align: 'right' },
  { x: 523, w: 26, label: 'ALÍQ. ICMS', align: 'right' },
  { x: 549, w: 26, label: 'ALÍQ. IPI', align: 'right' },
];

export class Danfe {
  public static fromXml(
    xmlNFe: string,
    xmlRetornoSefazOuOpcoes?: string | OpcoesDanfe,
    opcoes?: OpcoesDanfe
  ): Buffer {
    const xmlRetornoSefaz =
      typeof xmlRetornoSefazOuOpcoes === 'string' ? xmlRetornoSefazOuOpcoes : undefined;
    const opcoesResolvidas =
      typeof xmlRetornoSefazOuOpcoes === 'object' && xmlRetornoSefazOuOpcoes !== null
        ? xmlRetornoSefazOuOpcoes
        : opcoes;
    const logoEmbed = opcoesResolvidas?.logo
      ? this.parseLogoImage(opcoesResolvidas.logo)
      : undefined;

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
    const veicTransp = transp?.getElementsByTagName('veicTransp')[0];
    const vol = transp?.getElementsByTagName('vol')[0];
    const cobr = doc.getElementsByTagName('cobr')[0];
    const fat = cobr?.getElementsByTagName('fat')[0];
    const dupNodes = cobr?.getElementsByTagName('dup');
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
    const emitFant = this.getTag(emit, 'xFant', '');
    const emitCnpj = this.formatDoc(this.getTag(emit, 'CNPJ', this.getTag(emit, 'CPF', '')));
    const emitIe = this.getTag(emit, 'IE', '');
    const emitIeSt = this.getTag(emit, 'IEST', '');
    const emitEnd = `${this.getTag(enderEmit, 'xLgr', '')}, ${this.getTag(enderEmit, 'nro', '')} - ${this.getTag(enderEmit, 'xBairro', '')}`;
    const emitMunUfCep = `${this.getTag(enderEmit, 'xMun', '')}/${this.getTag(enderEmit, 'UF', '')} - CEP ${this.formatCep(this.getTag(enderEmit, 'CEP', ''))}${this.getTag(enderEmit, 'fone', '') ? ' - Fone: ' + this.getTag(enderEmit, 'fone', '') : ''}`;

    const destNome = this.getTag(dest, 'xNome', '');
    const destDoc = this.formatDoc(this.getTag(dest, 'CNPJ', this.getTag(dest, 'CPF', '')));
    const destEnd = `${this.getTag(enderDest, 'xLgr', '')}, ${this.getTag(enderDest, 'nro', '')}`;
    const destBairro = this.getTag(enderDest, 'xBairro', '');
    const destCep = this.formatCep(this.getTag(enderDest, 'CEP', ''));
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
      : cStat
        ? `Status ${cStat}: ${xMotivo.slice(0, 36)}`
        : 'NFe sem Autorização de Uso da SEFAZ';

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

    const itensPagina1 = 20;
    const itensPorPaginaExtra = 40;
    const paginasItens: ItemDanfe[][] = [];

    if (itens.length <= itensPagina1) {
      paginasItens.push(itens);
    } else {
      paginasItens.push(itens.slice(0, itensPagina1));
      for (let idx = itensPagina1; idx < itens.length; idx += itensPorPaginaExtra) {
        paginasItens.push(itens.slice(idx, idx + itensPorPaginaExtra));
      }
    }

    const totalPaginas = paginasItens.length;
    const duplicatasResumo: string[] = [];
    if (dupNodes) {
      for (let i = 0; i < Math.min(dupNodes.length, 4); i++) {
        const dup = dupNodes[i];
        if (!dup) continue;
        const nDup = this.getTag(dup, 'nDup', String(i + 1).padStart(3, '0'));
        const dVencRaw = this.getTag(dup, 'dVenc', '');
        const dVenc =
          dVencRaw.length >= 10
            ? `${dVencRaw.slice(8, 10)}/${dVencRaw.slice(5, 7)}/${dVencRaw.slice(0, 4)}`
            : dVencRaw;
        const vDup = this.formatDecimal(this.getTag(dup, 'vDup', '0.00'));
        duplicatasResumo.push(`${nDup}  ${dVenc}  R$ ${vDup}`);
      }
    }

    const numeroFormatado = this.formatNumeroNF(nNF);
    const now = new Date();
    const pad2 = (n: number) => String(n).padStart(2, '0');
    const agoraStr = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    const streamsPaginas: string[] = [];

    for (let numPag = 1; numPag <= totalPaginas; numPag++) {
      const cmds: string[] = [];
      const itensDaPagina = paginasItens[numPag - 1] ?? [];

      // Estilo NFePHP (sped-da): 100% monocromático (preto/branco), traço fino 0.4pt e cantos suavizados
      cmds.push('1 j 1 J 0.4 w 0 G 0 g');

      // =========================================================================
      // 1. CANHOTO DESTACÁVEL (Apenas na 1ª página)
      // =========================================================================
      if (numPag === 1) {
        this.drawFieldBox(cmds, 20, 801, 450, 19, `RECEBEMOS DE ${emitNome.slice(0, 62)} OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA ABAIXO`);
        this.drawFieldBox(cmds, 20, 782, 110, 19, 'DATA DE RECEBIMENTO');
        this.drawFieldBox(cmds, 130, 782, 340, 19, 'IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR');
        this.drawFieldBox(cmds, 470, 782, 105, 38, '');
        this.drawTextCentered(cmds, 470, 105, 808, 'NF-e', 9, true);
        this.drawTextCentered(cmds, 470, 105, 796, `Nº. ${numeroFormatado}`, 7.5, true);
        this.drawTextCentered(cmds, 470, 105, 786, `Série ${serie.padStart(3, '0')}`, 6.8, true);

        // Linha pontilhada de destaque do canhoto
        cmds.push('[2 2] 0 d 0.35 w 20 776 m 575 776 l S [] 0 d 0.4 w');
      }

      // =========================================================================
      // 2. CABEÇALHO PRINCIPAL (Emitente + DANFE + Código de Barras / Chave)
      // =========================================================================
      this.drawFieldBox(cmds, 20, 688, 220, 82, 'IDENTIFICAÇÃO DO EMITENTE');
      if (logoEmbed) {
        const slotX = 25;
        const slotY = 703;
        const slotW = 54;
        const slotH = 54;
        const scale = Math.min(slotW / logoEmbed.width, slotH / logoEmbed.height);
        const drawW = logoEmbed.width * scale;
        const drawH = logoEmbed.height * scale;
        const imgX = slotX + (slotW - drawW) / 2;
        const imgY = slotY + (slotH - drawH) / 2;
        cmds.push(`q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${imgX.toFixed(2)} ${imgY.toFixed(2)} cm /Im1 Do Q`);

        const textBoxX = 83;
        const textBoxW = 154;
        const linhasNomeEmit = this.wrapText(emitNome, 26);
        this.drawTextCentered(cmds, textBoxX, textBoxW, 749, linhasNomeEmit[0] ?? '', 7.4, true);
        if (linhasNomeEmit[1]) {
          this.drawTextCentered(cmds, textBoxX, textBoxW, 739, linhasNomeEmit[1].slice(0, 28), 7, true);
        } else if (emitFant) {
          this.drawTextCentered(cmds, textBoxX, textBoxW, 739, emitFant.slice(0, 28), 6.6, false);
        }
        const linhasEndEmit = this.wrapText(emitEnd, 34);
        this.drawTextCentered(cmds, textBoxX, textBoxW, 726, linhasEndEmit[0] ?? '', 5.8, false);
        if (linhasEndEmit[1]) {
          this.drawTextCentered(cmds, textBoxX, textBoxW, 718, linhasEndEmit[1].slice(0, 36), 5.8, false);
          this.drawTextCentered(cmds, textBoxX, textBoxW, 709, emitMunUfCep.slice(0, 50), 5.2, false);
        } else {
          this.drawTextCentered(cmds, textBoxX, textBoxW, 716, emitMunUfCep.slice(0, 50), 5.3, false);
        }
      } else {
        const linhasNomeEmit = this.wrapText(emitNome, 33);
        this.drawTextCentered(cmds, 20, 220, 747, linhasNomeEmit[0] ?? '', 8, true);
        if (linhasNomeEmit[1]) {
          this.drawTextCentered(cmds, 20, 220, 737, linhasNomeEmit[1], 7.5, true);
        } else if (emitFant) {
          this.drawTextCentered(cmds, 20, 220, 737, emitFant.slice(0, 36), 7, false);
        }
        this.drawTextCentered(cmds, 20, 220, 722, emitEnd.slice(0, 44), 6.3, false);
        this.drawTextCentered(cmds, 20, 220, 712, emitMunUfCep.slice(0, 46), 6.2, false);
      }
      if (tpAmb === '2') {
        this.drawTextCentered(cmds, 20, 220, 693, 'EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL', 5.8, true);
      }

      // Quadro Central DANFE (estilo sped-da)
      this.drawFieldBox(cmds, 240, 688, 95, 82, '');
      this.drawTextCentered(cmds, 240, 95, 755, 'DANFE', 12, true);
      this.drawTextCentered(cmds, 240, 95, 745, 'Documento Auxiliar da', 6, false);
      this.drawTextCentered(cmds, 240, 95, 737, 'Nota Fiscal Eletrônica', 6, false);

      this.drawText(cmds, 246, 724, '0 - ENTRADA', 6, false);
      this.drawText(cmds, 246, 715, '1 - SAÍDA', 6, false);
      this.drawFieldBox(cmds, 310, 714, 16, 16, '');
      this.drawTextCentered(cmds, 310, 16, 719, tpNF, 8.5, true);

      this.drawTextCentered(cmds, 240, 95, 702, `Nº. ${numeroFormatado}`, 7.5, true);
      this.drawTextCentered(cmds, 240, 95, 692, `Série ${serie.padStart(3, '0')}   Folha ${numPag}/${totalPaginas}`, 6.5, true);

      // Código de Barras e Chave de Acesso
      this.drawFieldBox(cmds, 335, 688, 240, 82, '');
      this.drawCode128C(cmds, chave, 348, 738, 214, 25);
      this.drawHLine(cmds, 335, 575, 732);
      this.drawLabel(cmds, 339, 725, 'CHAVE DE ACESSO');
      this.drawTextCentered(cmds, 335, 240, 714, chaveFormatada, 6.8, true);
      this.drawHLine(cmds, 335, 575, 709);
      this.drawTextCentered(cmds, 335, 240, 699, 'Consulta de autenticidade no portal nacional da NF-e', 6, false);
      this.drawTextCentered(cmds, 335, 240, 691, 'www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora', 5.5, false);

      // Natureza da Operação e Protocolo
      this.drawFieldBox(cmds, 20, 666, 315, 22, 'NATUREZA DA OPERAÇÃO', natOp.slice(0, 56), 7.5, false);
      this.drawFieldBox(cmds, 335, 666, 240, 22, 'PROTOCOLO DE AUTORIZAÇÃO DE USO', protocoloTexto, 6.5, true, 'center');

      // IE / IE ST / CNPJ
      this.drawFieldBox(cmds, 20, 644, 185, 22, 'INSCRIÇÃO ESTADUAL', emitIe, 7.5, false);
      this.drawFieldBox(cmds, 205, 644, 185, 22, 'INSCRIÇÃO ESTADUAL DO SUBST. TRIBUT.', emitIeSt, 7.5, false);
      this.drawFieldBox(cmds, 390, 644, 185, 22, 'CNPJ / CPF', emitCnpj, 7.5, false);

      let headerY = 385;
      let tableBottomY = 108;

      if (numPag === 1) {
        // =========================================================================
        // 3. DESTINATÁRIO / REMETENTE
        // =========================================================================
        this.drawSectionTitle(cmds, 20, 634, 'DESTINATÁRIO / REMETENTE');
        this.drawFieldBox(cmds, 20, 610, 340, 22, 'NOME / RAZÃO SOCIAL', destNome.slice(0, 64), 7.5, false);
        this.drawFieldBox(cmds, 360, 610, 130, 22, 'CNPJ / CPF', destDoc, 7.5, true);
        this.drawFieldBox(cmds, 490, 610, 85, 22, 'DATA DA EMISSÃO', dhEmi.slice(0, 10), 7.5, false, 'center');

        this.drawFieldBox(cmds, 20, 588, 270, 22, 'ENDEREÇO', destEnd.slice(0, 48), 7.5, false);
        this.drawFieldBox(cmds, 290, 588, 120, 22, 'BAIRRO / DISTRITO', destBairro.slice(0, 24), 7.5, false);
        this.drawFieldBox(cmds, 410, 588, 80, 22, 'CEP', destCep, 7.5, false, 'center');
        this.drawFieldBox(cmds, 490, 588, 85, 22, 'DATA DA SAÍDA/ENTRADA', dhSaiEnt.slice(0, 10), 7.5, false, 'center');

        this.drawFieldBox(cmds, 20, 566, 220, 22, 'MUNICÍPIO', destMun, 7.5, false);
        this.drawFieldBox(cmds, 240, 566, 95, 22, 'FONE / FAX', destFone, 7.5, false);
        this.drawFieldBox(cmds, 335, 566, 30, 22, 'UF', destUf, 7.5, false, 'center');
        this.drawFieldBox(cmds, 365, 566, 125, 22, 'INSCRIÇÃO ESTADUAL', destIe, 7.5, false);
        this.drawFieldBox(cmds, 490, 566, 85, 22, 'HORA DA SAÍDA/ENTRADA', dhSaiEnt.slice(11, 19), 7.5, false, 'center');

        // =========================================================================
        // 4. FATURA / DUPLICATAS / PAGAMENTO
        // =========================================================================
        this.drawSectionTitle(cmds, 20, 556, 'FATURA / DUPLICATAS');
        const tPag = this.getTag(detPag, 'tPag', '01');
        const vPag = this.formatDecimal(this.getTag(detPag, 'vPag', '0.00'));
        if (duplicatasResumo.length > 0 || fat) {
          const nFat = this.getTag(fat, 'nFat', '');
          const vLiq = this.getTag(fat, 'vLiq', '');
          const textoFatura = nFat ? `Nº ${nFat} - Líq: R$ ${this.formatDecimal(vLiq)}` : this.getDescricaoPagamento(tPag);
          this.drawFieldBox(cmds, 20, 532, 145, 22, 'FATURA / FORMA PAGTO', textoFatura.slice(0, 28), 6.8, false);
          this.drawFieldBox(cmds, 165, 532, 295, 22, 'DUPLICATAS (NÚMERO / VENCIMENTO / VALOR)', duplicatasResumo.join('   |   ').slice(0, 64), 6.3, false);
          this.drawFieldBox(cmds, 460, 532, 115, 22, 'VALOR DO PAGAMENTO', vPag, 7.5, true, 'right');
        } else {
          this.drawFieldBox(cmds, 20, 532, 185, 22, 'FORMA DE PAGAMENTO', this.getDescricaoPagamento(tPag), 7.5, false);
          this.drawFieldBox(cmds, 205, 532, 185, 22, 'VALOR DO PAGAMENTO', vPag, 7.5, true, 'right');
          this.drawFieldBox(cmds, 390, 532, 185, 22, 'TROCO', this.formatDecimal(this.getTag(doc.getElementsByTagName('pag')[0], 'vTroco', '0.00')), 7.5, false, 'right');
        }

        // =========================================================================
        // 5. CÁLCULO DO IMPOSTO
        // =========================================================================
        this.drawSectionTitle(cmds, 20, 522, 'CÁLCULO DO IMPOSTO');
        this.drawFieldBox(cmds, 20, 498, 70, 22, 'BASE DE CÁLC. DO ICMS', this.formatDecimal(this.getTag(icmsTot, 'vBC', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 90, 498, 68, 22, 'VALOR DO ICMS', this.formatDecimal(this.getTag(icmsTot, 'vICMS', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 158, 498, 68, 22, 'BASE DE CÁLC. ICMS S.T.', this.formatDecimal(this.getTag(icmsTot, 'vBCST', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 226, 498, 68, 22, 'VALOR DO ICMS SUBST.', this.formatDecimal(this.getTag(icmsTot, 'vST', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 294, 498, 65, 22, 'V. IMP. IMPORTAÇÃO', this.formatDecimal(this.getTag(icmsTot, 'vII', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 359, 498, 65, 22, 'VALOR DO FCP', this.formatDecimal(this.getTag(icmsTot, 'vFCP', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 424, 498, 65, 22, 'VALOR DO PIS', this.formatDecimal(this.getTag(icmsTot, 'vPIS', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 489, 498, 86, 22, 'V. TOTAL PRODUTOS', this.formatDecimal(this.getTag(icmsTot, 'vProd', '0.00')), 7.5, true, 'right');

        this.drawFieldBox(cmds, 20, 476, 70, 22, 'VALOR DO FRETE', this.formatDecimal(this.getTag(icmsTot, 'vFrete', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 90, 476, 68, 22, 'VALOR DO SEGURO', this.formatDecimal(this.getTag(icmsTot, 'vSeg', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 158, 476, 68, 22, 'DESCONTO', this.formatDecimal(this.getTag(icmsTot, 'vDesc', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 226, 476, 68, 22, 'OUTRAS DESPESAS', this.formatDecimal(this.getTag(icmsTot, 'vOutro', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 294, 476, 65, 22, 'VALOR TOTAL IPI', this.formatDecimal(this.getTag(icmsTot, 'vIPI', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 359, 476, 65, 22, 'V. APROX. TRIBUTOS', this.formatDecimal(this.getTag(icmsTot, 'vTotTrib', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 424, 476, 65, 22, 'VALOR DA COFINS', this.formatDecimal(this.getTag(icmsTot, 'vCOFINS', '0.00')), 7.2, false, 'right');
        this.drawFieldBox(cmds, 489, 476, 86, 22, 'V. TOTAL DA NOTA', this.formatDecimal(this.getTag(icmsTot, 'vNF', '0.00')), 8.2, true, 'right');

        // =========================================================================
        // 6. TRANSPORTADOR / VOLUMES TRANSPORTADOS
        // =========================================================================
        this.drawSectionTitle(cmds, 20, 466, 'TRANSPORTADOR / VOLUMES TRANSPORTADOS');
        const modFrete = this.getTag(transp, 'modFrete', '9');
        const rntc = this.getTag(veicTransp, 'RNTC', '');
        const placa = this.getTag(veicTransp, 'placa', '');
        const ufVeic = this.getTag(veicTransp, 'UF', this.getTag(transporta, 'UF', ''));
        const docTransp = this.formatDoc(this.getTag(transporta, 'CNPJ', this.getTag(transporta, 'CPF', '')));
        this.drawFieldBox(cmds, 20, 442, 210, 22, 'NOME / RAZÃO SOCIAL', this.getTag(transporta, 'xNome', ''), 7.2, false);
        this.drawFieldBox(cmds, 230, 442, 95, 22, 'FRETE POR CONTA', this.getDescricaoFrete(modFrete), 6.8, false);
        this.drawFieldBox(cmds, 325, 442, 65, 22, 'CÓDIGO ANTT', rntc, 7.2, false, 'center');
        this.drawFieldBox(cmds, 390, 442, 65, 22, 'PLACA DO VEÍCULO', placa, 7.2, false, 'center');
        this.drawFieldBox(cmds, 455, 442, 25, 22, 'UF', ufVeic, 7.2, false, 'center');
        this.drawFieldBox(cmds, 480, 442, 95, 22, 'CNPJ / CPF', docTransp, 7.2, false);

        this.drawFieldBox(cmds, 20, 420, 85, 22, 'QUANTIDADE', this.getTag(vol, 'qVol', ''), 7.2, false, 'right');
        this.drawFieldBox(cmds, 105, 420, 110, 22, 'ESPÉCIE', this.getTag(vol, 'esp', ''), 7.2, false);
        this.drawFieldBox(cmds, 215, 420, 100, 22, 'MARCA', this.getTag(vol, 'marca', ''), 7.2, false);
        this.drawFieldBox(cmds, 315, 420, 90, 22, 'NUMERAÇÃO', this.getTag(vol, 'nVol', ''), 7.2, false);
        this.drawFieldBox(cmds, 405, 420, 85, 22, 'PESO BRUTO', this.getTag(vol, 'pesoB', ''), 7.2, false, 'right');
        this.drawFieldBox(cmds, 490, 420, 85, 22, 'PESO LÍQUIDO', this.getTag(vol, 'pesoL', ''), 7.2, false, 'right');

        this.drawSectionTitle(cmds, 20, 410, 'DADOS DOS PRODUTOS / SERVIÇOS');
        headerY = 407;
      } else {
        this.drawSectionTitle(cmds, 20, 634, `DADOS DOS PRODUTOS / SERVIÇOS (CONTINUAÇÃO - FOLHA ${numPag}/${totalPaginas})`);
        headerY = 631;
        tableBottomY = 42;
      }

      // =========================================================================
      // 7. TABELA DE ITENS E MARCA D'ÁGUA "SEM VALOR FISCAL" ESTILO NFEPHP
      // =========================================================================
      const headerH = 13;
      const topTableY = headerY - headerH;

      // Marca d'água em grande evidência no centro da tabela (exatamente como no NFePHP sped-da)
      if (tpAmb === '2' || !nProt) {
        const centerY = (topTableY + tableBottomY) / 2;
        cmds.push('0.68 g');
        this.drawTextCentered(cmds, 20, 555, centerY + 6, 'SEM VALOR FISCAL', 34, true);
        if (tpAmb === '2') {
          this.drawTextCentered(cmds, 20, 555, centerY - 14, 'EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO', 13, true);
        }
        if (!nProt) {
          this.drawTextCentered(cmds, 20, 555, centerY - 28, 'FALTA PROTOCOLO DE AUTORIZAÇÃO DA SEFAZ', 10, true);
        }
        cmds.push('0 g');
      }

      // Contorno arredondado da tabela e divisórias de colunas
      this.drawRoundedRect(cmds, 20, tableBottomY, 555, headerY - tableBottomY, 2.5, 'S');
      this.drawHLine(cmds, 20, 575, topTableY);
      for (let i = 1; i < COLUNAS_ITENS.length; i++) {
        const col = COLUNAS_ITENS[i]!;
        this.drawVLine(cmds, col.x, tableBottomY, headerY);
      }

      // Títulos das colunas da tabela
      for (const col of COLUNAS_ITENS) {
        if (col.align === 'left') {
          this.drawText(cmds, col.x + 2.5, topTableY + 4, col.label, 4.4, true);
        } else {
          this.drawTextCentered(cmds, col.x, col.w, topTableY + 4, col.label, 4.3, true);
        }
      }

      // Linhas de itens
      let rowY = topTableY - 10;
      for (let idxItem = 0; idxItem < itensDaPagina.length; idxItem++) {
        const item = itensDaPagina[idxItem];
        if (!item || rowY < tableBottomY + 6) break;

        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[0]!, rowY, item.cProd.slice(0, 10));
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[1]!, rowY, item.xProd.slice(0, 37));
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[2]!, rowY, item.ncm);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[3]!, rowY, item.origCsosnCst);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[4]!, rowY, item.cfop);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[5]!, rowY, item.uCom.slice(0, 4));
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[6]!, rowY, item.qCom);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[7]!, rowY, item.vUnCom);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[8]!, rowY, item.vProd);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[9]!, rowY, item.vBC);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[10]!, rowY, item.vICMS);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[11]!, rowY, item.vIPI);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[12]!, rowY, item.pICMS);
        this.drawAlignedItemCell(cmds, COLUNAS_ITENS[13]!, rowY, item.pIPI);

        cmds.push(`[1 2] 0 d 0.25 w 20 ${(rowY - 3.5).toFixed(2)} m 575 ${(rowY - 3.5).toFixed(2)} l S [] 0 d 0.4 w`);
        rowY -= 13;
      }

      // =========================================================================
      // 8. DADOS ADICIONAIS (Apenas na 1ª página)
      // =========================================================================
      if (numPag === 1) {
        this.drawSectionTitle(cmds, 20, 98, 'DADOS ADICIONAIS');
        this.drawFieldBox(cmds, 20, 42, 370, 53, 'INFORMAÇÕES COMPLEMENTARES');
        this.drawFieldBox(cmds, 390, 42, 185, 53, 'RESERVADO AO FISCO');

        const infCpl = this.getTag(infAdic, 'infCpl', '');
        const linhaStatus = `Ambiente: ${tpAmb === '2' ? '2 - Homologação (Sem Valor Fiscal)' : '1 - Produção'}${cStat ? ` | Status SEFAZ: ${cStat} - ${xMotivo}` : ''}`;
        const linhasCompl = infCpl
          ? [...this.wrapText(infCpl, 74).slice(0, 2), linhaStatus.slice(0, 78)]
          : [linhaStatus.slice(0, 78)];

        let yCompl = 76;
        for (const linha of linhasCompl) {
          this.drawText(cmds, 24, yCompl, linha, 6.3, false);
          yCompl -= 10;
        }
      }

      // =========================================================================
      // 9. RODAPÉ ESTILO NFEPHP (Monocromático e nítido)
      // =========================================================================
      this.drawText(cmds, 20, 30, `Impresso em ${agoraStr.slice(0, 10)} às ${agoraStr.slice(11, 19)}`, 6.2, false);
      this.drawTextRight(cmds, 575, 30, 'Powered by nfe-lib-node', 7.2, true);

      streamsPaginas.push(cmds.join('\n'));
    }

    return this.buildPdfBuffer(streamsPaginas, logoEmbed);
  }

  private static drawSectionTitle(cmds: string[], x: number, y: number, title: string): void {
    this.drawText(cmds, x + 1, y, title, 5.8, true);
  }

  private static drawFieldBox(
    cmds: string[],
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value = '',
    valueSize = 7.5,
    boldValue = false,
    align: 'left' | 'center' | 'right' = 'left'
  ): void {
    this.drawRoundedRect(cmds, x, y, w, h, 2, 'S');
    if (label) {
      this.drawLabel(cmds, x + 3, y + h - 6.2, label);
    }
    if (value) {
      if (align === 'right') {
        this.drawTextRight(cmds, x + w - 3.5, y + 4.2, value, valueSize, boldValue);
      } else if (align === 'center') {
        this.drawTextCentered(cmds, x, w, y + 4.2, value, valueSize, boldValue);
      } else {
        this.drawText(cmds, x + 3.5, y + 4.2, value, valueSize, boldValue);
      }
    }
  }

  private static drawRoundedRect(
    cmds: string[],
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    style: 'S' | 'f' | 'B'
  ): void {
    const radius = Math.min(r, w / 2, h / 2);
    const k = 0.55228475 * radius;
    cmds.push(
      `${(x + radius).toFixed(2)} ${y.toFixed(2)} m`,
      `${(x + w - radius).toFixed(2)} ${y.toFixed(2)} l`,
      `${(x + w - radius + k).toFixed(2)} ${y.toFixed(2)} ${(x + w).toFixed(2)} ${(y + radius - k).toFixed(2)} ${(x + w).toFixed(2)} ${(y + radius).toFixed(2)} c`,
      `${(x + w).toFixed(2)} ${(y + h - radius).toFixed(2)} l`,
      `${(x + w).toFixed(2)} ${(y + h - radius + k).toFixed(2)} ${(x + w - radius + k).toFixed(2)} ${(y + h).toFixed(2)} ${(x + w - radius).toFixed(2)} ${(y + h).toFixed(2)} c`,
      `${(x + radius).toFixed(2)} ${(y + h).toFixed(2)} l`,
      `${(x + radius - k).toFixed(2)} ${(y + h).toFixed(2)} ${x.toFixed(2)} ${(y + h - radius + k).toFixed(2)} ${x.toFixed(2)} ${(y + h - radius).toFixed(2)} c`,
      `${x.toFixed(2)} ${(y + radius).toFixed(2)} l`,
      `${x.toFixed(2)} ${(y + radius - k).toFixed(2)} ${(x + radius - k).toFixed(2)} ${y.toFixed(2)} ${(x + radius).toFixed(2)} ${y.toFixed(2)} c`,
      `h ${style}`
    );
  }

  private static drawHLine(cmds: string[], x1: number, x2: number, y: number): void {
    cmds.push(`${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`);
  }

  private static drawVLine(cmds: string[], x: number, y1: number, y2: number): void {
    cmds.push(`${x.toFixed(2)} ${y1.toFixed(2)} m ${x.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  private static drawLabel(cmds: string[], x: number, y: number, label: string): void {
    this.drawText(cmds, x, y, label, 4.8, false);
  }

  private static drawAlignedItemCell(cmds: string[], col: ColunaTabela, y: number, text: string): void {
    if (!text) return;
    if (col.align === 'right') {
      this.drawTextRight(cmds, col.x + col.w - 2.5, y, text, 5.8, false);
    } else if (col.align === 'center') {
      this.drawTextCentered(cmds, col.x, col.w, y, text, 5.8, false);
    } else {
      this.drawText(cmds, col.x + 2.5, y, text, 5.8, false);
    }
  }

  private static estimateTextWidth(text: string, size: number, bold: boolean): number {
    const factor = bold ? 0.54 : 0.50;
    return text.length * size * factor;
  }

  private static drawText(cmds: string[], x: number, y: number, text: string, size: number, bold: boolean): void {
    const font = bold ? '/F2' : '/F1';
    const escaped = this.escapePdfText(text);
    cmds.push(`BT ${font} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escaped}) Tj ET`);
  }

  private static drawTextRight(cmds: string[], rightX: number, y: number, text: string, size: number, bold: boolean): void {
    const w = this.estimateTextWidth(text, size, bold);
    this.drawText(cmds, rightX - w, y, text, size, bold);
  }

  private static drawTextCentered(cmds: string[], boxX: number, boxW: number, y: number, text: string, size: number, bold: boolean): void {
    const w = this.estimateTextWidth(text, size, bold);
    const x = boxX + Math.max(2, (boxW - w) / 2);
    this.drawText(cmds, x, y, text, size, bold);
  }

  private static wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.trim().split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (!current) {
        current = word;
      } else if (current.length + 1 + word.length <= maxCharsPerLine) {
        current += ' ' + word;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  private static escapePdfText(text: string): string {
    return text
      .replace(/•/g, '-')
      .replace(/—/g, '-')
      .replace(/[^\x20-\xFF]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  private static getDescricaoFrete(modFrete: string): string {
    const mapa: Record<string, string> = {
      '0': '0 - Remetente (CIF)',
      '1': '1 - Destinatário (FOB)',
      '2': '2 - Terceiros',
      '3': '3 - Próprio Remet.',
      '4': '4 - Próprio Dest.',
      '9': '9 - Sem Transporte',
    };
    return mapa[modFrete] ?? modFrete;
  }

  private static getDescricaoPagamento(tPag: string): string {
    const mapa: Record<string, string> = {
      '01': '01 - Dinheiro',
      '02': '02 - Cheque',
      '03': '03 - Cartão de Crédito',
      '04': '04 - Cartão de Débito',
      '15': '15 - Boleto Bancário',
      '17': '17 - PIX',
      '90': '90 - Sem Pagamento',
      '99': '99 - Outros',
    };
    return mapa[tPag] ?? `Código ${tPag}`;
  }

  private static formatDecimal(val: string): string {
    const num = Number(val.replace(',', '.'));
    if (Number.isNaN(num)) return val;
    return num.toFixed(2).replace('.', ',');
  }

  private static formatNumeroNF(nNF: string): string {
    const padded = nNF.replace(/\D/g, '').padStart(9, '0');
    return `${padded.slice(0, 3)}.${padded.slice(3, 6)}.${padded.slice(6, 9)}`;
  }

  private static formatCep(cep: string): string {
    const digits = cep.replace(/\D/g, '');
    if (digits.length === 8) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return cep;
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

  private static parseLogoImage(logo: Buffer | string): ImagemPdfEmbed | undefined {
    const buf = Buffer.isBuffer(logo)
      ? logo
      : Buffer.from(logo.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim(), 'base64');

    if (buf.length < 16) return undefined;

    // 1. JPEG (FF D8)
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) {
          offset++;
          continue;
        }
        let marker = buf[offset + 1] ?? 0;
        while (marker === 0xff && offset + 2 < buf.length) {
          offset++;
          marker = buf[offset + 1] ?? 0;
        }
        if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
          offset += 2;
          continue;
        }
        const segLen = buf.readUInt16BE(offset + 2);
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const bitsPerComponent = buf[offset + 4] ?? 8;
          const height = buf.readUInt16BE(offset + 5);
          const width = buf.readUInt16BE(offset + 7);
          const numComponents = buf[offset + 9] ?? 3;
          const colorSpace =
            numComponents === 1
              ? '/DeviceGray'
              : numComponents === 4
                ? '/DeviceCMYK'
                : '/DeviceRGB';
          const hexStream = buf.toString('hex') + '>';
          return {
            width,
            height,
            colorSpace,
            bitsPerComponent,
            filter: '[/ASCIIHexDecode /DCTDecode]',
            hexStream,
          };
        }
        offset += 2 + segLen;
      }
      return undefined;
    }

    // 2. PNG (89 50 4E 47 0D 0A 1A 0A)
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      let offset = 8;
      let width = 0;
      let height = 0;
      let bitDepth = 8;
      let colorType = 2;
      let palette: Buffer | undefined;
      let trns: Buffer | undefined;
      const idatChunks: Buffer[] = [];

      while (offset + 8 <= buf.length) {
        const length = buf.readUInt32BE(offset);
        const type = buf.toString('ascii', offset + 4, offset + 8);
        const dataStart = offset + 8;
        const dataEnd = dataStart + length;
        if (dataEnd > buf.length) break;

        const chunkData = buf.subarray(dataStart, dataEnd);
        if (type === 'IHDR' && length >= 13) {
          width = chunkData.readUInt32BE(0);
          height = chunkData.readUInt32BE(4);
          bitDepth = chunkData[8] ?? 8;
          colorType = chunkData[9] ?? 2;
        } else if (type === 'PLTE') {
          palette = chunkData;
        } else if (type === 'tRNS') {
          trns = chunkData;
        } else if (type === 'IDAT') {
          idatChunks.push(chunkData);
        } else if (type === 'IEND') {
          break;
        }
        offset = dataEnd + 4;
      }

      if (width <= 0 || height <= 0 || bitDepth !== 8 || idatChunks.length === 0) {
        return undefined;
      }

      const bpp =
        colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
      const stride = width * bpp;
      const rawData = inflateSync(Buffer.concat(idatChunks));
      const unfiltered = Buffer.alloc(height * stride);

      const paethPredictor = (a: number, b: number, c: number): number => {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        if (pa <= pb && pa <= pc) return a;
        if (pb <= pc) return b;
        return c;
      };

      for (let y = 0; y < height; y++) {
        const filterType = rawData[y * (stride + 1)] ?? 0;
        const srcRowStart = y * (stride + 1) + 1;
        const dstRowStart = y * stride;

        for (let x = 0; x < stride; x++) {
          const rawByte = rawData[srcRowStart + x] ?? 0;
          const left = x >= bpp ? (unfiltered[dstRowStart + x - bpp] ?? 0) : 0;
          const up = y > 0 ? (unfiltered[dstRowStart - stride + x] ?? 0) : 0;
          const upLeft = y > 0 && x >= bpp ? (unfiltered[dstRowStart - stride + x - bpp] ?? 0) : 0;

          let recon = rawByte;
          if (filterType === 1) {
            recon = (rawByte + left) & 0xff;
          } else if (filterType === 2) {
            recon = (rawByte + up) & 0xff;
          } else if (filterType === 3) {
            recon = (rawByte + Math.floor((left + up) / 2)) & 0xff;
          } else if (filterType === 4) {
            recon = (rawByte + paethPredictor(left, up, upLeft)) & 0xff;
          }
          unfiltered[dstRowStart + x] = recon;
        }
      }

      // Converte qualquer PNG (RGB, RGBA, Escala de Cinza, Paleta) em RGB de 24 bits sobre fundo branco (#FFFFFF)
      const rgbOut = Buffer.alloc(width * height * 3);
      for (let i = 0; i < width * height; i++) {
        let r = 255;
        let g = 255;
        let b = 255;
        let a = 255;

        if (colorType === 6) {
          r = unfiltered[i * 4] ?? 0;
          g = unfiltered[i * 4 + 1] ?? 0;
          b = unfiltered[i * 4 + 2] ?? 0;
          a = unfiltered[i * 4 + 3] ?? 255;
        } else if (colorType === 2) {
          r = unfiltered[i * 3] ?? 0;
          g = unfiltered[i * 3 + 1] ?? 0;
          b = unfiltered[i * 3 + 2] ?? 0;
        } else if (colorType === 4) {
          const gray = unfiltered[i * 2] ?? 0;
          r = gray;
          g = gray;
          b = gray;
          a = unfiltered[i * 2 + 1] ?? 255;
        } else if (colorType === 0) {
          const gray = unfiltered[i] ?? 0;
          r = gray;
          g = gray;
          b = gray;
        } else if (colorType === 3 && palette) {
          const idx = unfiltered[i] ?? 0;
          r = palette[idx * 3] ?? 0;
          g = palette[idx * 3 + 1] ?? 0;
          b = palette[idx * 3 + 2] ?? 0;
          if (trns && idx < trns.length) {
            a = trns[idx] ?? 255;
          }
        }

        if (a < 255) {
          const alpha = a / 255;
          r = Math.round(r * alpha + 255 * (1 - alpha));
          g = Math.round(g * alpha + 255 * (1 - alpha));
          b = Math.round(b * alpha + 255 * (1 - alpha));
        }

        rgbOut[i * 3] = r;
        rgbOut[i * 3 + 1] = g;
        rgbOut[i * 3 + 2] = b;
      }

      const compressedRgb = deflateSync(rgbOut);
      const hexStream = compressedRgb.toString('hex') + '>';
      return {
        width,
        height,
        colorSpace: '/DeviceRGB',
        bitsPerComponent: 8,
        filter: '[/ASCIIHexDecode /FlateDecode]',
        hexStream,
      };
    }

    return undefined;
  }

  private static buildPdfBuffer(contentStreams: string[], logoEmbed?: ImagemPdfEmbed): Buffer {
    const pageObjNums: number[] = [];
    const pageObjects: string[] = [];

    // Objetos 1..4: Catalog (1), Pages (2), Font Regular (3), Font Bold (4)
    // Objeto 5 (opcional): XObject Image /Im1 (quando logoEmbed estiver presente)
    const imageObjNum = logoEmbed ? 5 : undefined;
    let nextObjNum = logoEmbed ? 6 : 5;

    for (const stream of contentStreams) {
      const pageObjNum = nextObjNum++;
      const contentObjNum = nextObjNum++;
      pageObjNums.push(pageObjNum);

      const xObjectResource = imageObjNum ? ` /XObject << /Im1 ${imageObjNum} 0 R >>` : '';
      const streamBytes = Buffer.byteLength(stream, 'latin1');
      pageObjects.push(
        `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${xObjectResource} >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
      );
      pageObjects.push(
        `${contentObjNum} 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`
      );
    }

    const kidsRefs = pageObjNums.map((n) => `${n} 0 R`).join(' ');
    const objects: string[] = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      `2 0 obj\n<< /Type /Pages /Kids [${kidsRefs}] /Count ${pageObjNums.length} >>\nendobj\n`,
      '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    ];

    if (logoEmbed && imageObjNum) {
      const imgStreamLen = Buffer.byteLength(logoEmbed.hexStream, 'latin1');
      objects.push(
        `${imageObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${logoEmbed.width} /Height ${logoEmbed.height} /ColorSpace ${logoEmbed.colorSpace} /BitsPerComponent ${logoEmbed.bitsPerComponent} /Filter ${logoEmbed.filter} /Length ${imgStreamLen} >>\nstream\n${logoEmbed.hexStream}\nendstream\nendobj\n`
      );
    }

    objects.push(...pageObjects);

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
