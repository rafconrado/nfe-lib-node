/**
 * Tipagens completas da Estrutura da NF-e (Modelo 55), NFC-e (Modelo 65) e NFF.
 *
 * Convenções:
 * - Valores monetários/decimais são `string` para preservar precisão do XML.
 * - Atributos XML (ex.: `@Id`, `@versao`, `@nItem`) são prefixados com `@`.
 * - Para o schema completo da SEFAZ, gerar a partir do XSD oficial. 
 * - O layout completo, está disponível e documentado aqui: http://moc.sped.fazenda.pr.gov.br/NFe_NFCe/Leiaute.html
 * - O schema, está atualizado com a versão "Esquemas XML NF-e - Pacote de Liberação Distribuição de DF-e v.1.04. Publicado em 03/07/2026", disponível aqui: https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoln3w=
 */

// ============================================================================
// RAIZ
// ============================================================================

/** Estrutura raiz da NF-e. */
export interface DadosNFe {
  /** Grupo de informações da NF-e (`infNFe`). */
  infNFe: InfNFe;
}

/** Informações da Nota Fiscal Eletrônica (tag `infNFe`). */
export interface InfNFe {
  /** Atributo `Id` da nota (ex.: `NFe352609...`). */
  '@Id': string;
  /** Versão do layout (ex.: `4.00`). */
  '@versao': string;
  /** Identificação da NF-e. */
  ide: Ide;
  /** Identificação do emitente. */
  emit: Emit;
  /** Emissão NF-e avulsa pelo Fisco. */
  avulsa?: Avulsa;
  /** Identificação do destinatário. */
  dest?: Dest;
  /** Local de retirada (quando diferente do endereço do remetente). */
  retirada?: TLocal;
  /** Local de entrega (quando diferente do endereço do destinatário). */
  entrega?: TLocal;
  /** Pessoas autorizadas para download do XML. */
  autXML?: AutXML[];
  /** Itens (produtos/serviços) da NF-e. */
  det: Det[];
  /** Totais da NF-e. */
  total: Total;
  /** Informações do transporte. */
  transp: Transp;
  /** Dados de cobrança (fatura/duplicatas). */
  cobr?: Cobr;
  /** Informações de pagamento. */
  pag: Pag;
  /** Informações do intermediador (marketplace). */
  infIntermed?: InfIntermed;
  /** Informações adicionais (fisco/contribuinte). */
  infAdic?: InfAdic;
  /** Informações de exportação. */
  exporta?: Exporta;
  /** Informações de compras (empenho, pedido, contrato). */
  compra?: Compra;
  /** Informações de aquisição de cana. */
  cana?: Cana;
  /** Responsável técnico pela emissão. */
  infRespTec?: InfRespTec;
  /** Solicitação de emissão da NFF (NT 2021.002). */
  infSolicNFF?: InfSolicNFF;
  /** Informações de produtos da agropecuária. */
  agropecuario?: NFeAgropecuario;
  /** Provedor de Assinatura e Autorização (PAA). */
  infPAA?: InfPAA;
}

// ============================================================================
// IDENTIFICAÇÃO (ide)
// ============================================================================

/** Identificação da NF-e. */
export interface Ide {
  /** Código da UF da tabela do IBGE (ex.: `35` SP, `53` DF). */
  cUF: string;
  /** Código numérico que compõe a Chave de Acesso (8 dígitos). */
  cNF: string;
  /** Descrição da Natureza da Operação (ex.: `VENDA DE MERCADORIA`). */
  natOp: string;
  /** Modelo: `55` NF-e, `65` NFC-e. */
  mod: string;
  /** Série: 0-889 normal, 890-899 Fisco, 900-999 SCAN. */
  serie: string;
  /** Número do documento fiscal. */
  nNF: string;
  /** Data/hora de emissão `AAAA-MM-DDThh:mm:ssTZD`. */
  dhEmi: string;
  /** Data/hora de saída/entrada da mercadoria. */
  dhSaiEnt?: string;
  /** Data de previsão de entrega (`AAAA-MM-DD`). Não informar para NFC-e. */
  dPrevEntrega?: string;
  /** Tipo: `0` entrada, `1` saída. */
  tpNF: string;
  /** Local de destino: `1` interna, `2` interestadual, `3` exterior. */
  idDest: string;
  /** Código do município de ocorrência do fato gerador (IBGE). */
  cMunFG: string;
  /** Código do município de consumo para IBS/CBS. */
  cMunFGIBS?: string;
  /** Formato de impressão: `0` sem, `1` retrato, `2` paisagem, `3` simplificado, `4` NFC-e, `5` NFC-e em msg eletrônica. */
  tpImp: string;
  /** Forma de emissão: `1` normal, `2` FS, `3` SCAN, `4` DPEC, `5` FSDA, `6` SVC-AN, `7` SVC-RS, `9` off-line NFC-e. */
  tpEmis: string;
  /** Dígito verificador da Chave de Acesso. */
  cDV: string;
  /** Ambiente: `1` produção, `2` homologação. */
  tpAmb: string;
  /** Finalidade: `1` normal, `2` complementar, `3` ajuste, `4` devolução, `5` crédito, `6` débito. */
  finNFe: string;
  /** Tipo de Nota de Débito (01 a 08). */
  tpNFDebito?: string;
  /** Tipo de Nota de Crédito (01 a 06). */
  tpNFCredito?: string;
  /** Consumidor final: `0` normal, `1` consumidor final. */
  indFinal: string;
  /** Presença: `0` não aplica, `1` presencial, `2` internet, `3` teleatendimento, `4` entrega domicílio, `5` presencial fora do estabelecimento, `9` outros. */
  indPres: string;
  /** Indicador de intermediador: `0` sem, `1` com. */
  indIntermed?: string;
  /** Código indicador do local da operação de fornecimento. */
  cIndOp?: string;
  /** Processo de emissão: `0` app contribuinte, `1` avulsa Fisco, `2` avulsa contribuinte, `3` app Fisco. */
  procEmi: string;
  /** Versão do aplicativo utilizado. */
  verProc: string;
  /** Data/hora de entrada em contingência. */
  dhCont?: string;
  /** Justificativa da entrada em contingência. */
  xJust?: string;
  /** Documentos fiscais referenciados. */
  NFref?: TNFeInfNFeIdeNFref[];
  /** Grupo de compra governamental. */
  gCompraGov?: TCompraGov;
  /** Grupo de notas de antecipação de pagamento. */
  gPagAntecipado?: TgPagAntecipado[];
  /** Campos adicionais não mapeados. */
  [key: string]: any;
}

/** Grupo de NF referenciada. */
export interface TNFeInfNFeIdeNFref {
  /** Chave de acesso do CT-e referenciado. */
  refCTe?: string;
  /** Cupom Fiscal referenciado. */
  refECF?: RefECF;
  /** NF modelo 1/1A ou 2 referenciada. */
  refNF?: RefNF;
  /** NF de produtor rural referenciada. */
  refNFP?: RefNFP;
  /** Chave de acesso da NF-e referenciada. */
  refNFe?: string;
}

/** Cupom Fiscal referenciado. */
export interface RefECF {
  /** Modelo: `2B` máquina registradora, `2C` PDV, `2D` ECF. */
  mod: string;
  /** Número de ordem sequencial do ECF. */
  nECF: string;
  /** Número do Contador de Ordem de Operação. */
  nCOO: string;
}

/** NF modelo 1/1A ou 2 referenciada. */
export interface RefNF {
  /** Código da UF (IBGE). */
  cUF: string;
  /** Ano e mês de emissão (AAMM). */
  AAMM: string;
  /** CNPJ do emitente. */
  CNPJ: string;
  /** Modelo: `01` NF 1/1A, `02` NF 2. */
  mod: string;
  /** Série. */
  serie: string;
  /** Número. */
  nNF: string;
}

/** NF de produtor rural referenciada. */
export interface RefNFP {
  /** Código da UF (IBGE). */
  cUF: string;
  /** Ano e mês de emissão (AAMM). */
  AAMM: string;
  /** CNPJ do emitente. */
  CNPJ?: string;
  /** CPF do emitente. */
  CPF?: string;
  /** IE do emitente ou `ISENTO`. */
  IE: string;
  /** Modelo: `04` NF Produtor, `01` NF. */
  mod: string;
  /** Série. */
  serie: string;
  /** Número. */
  nNF: string;
}

/** Grupo de Compra Governamental. */
export interface TCompraGov {
  /** Tipo de ente: `1` União, `2` Estados, `3` DF, `4` Município, `5` Consórcio, `6` Comitê Gestor IBS. */
  tpEnteGov: string;
  /** Percentual de redução de alíquota. */
  pRedutor: string;
  /** Tipo de operação: `1` a `4`. */
  tpOperGov: string;
  /** Chaves de acesso de DF-e anteriores. */
  refDFeAnt?: string[];
}

/** Grupo de notas de antecipação de pagamento. */
export interface TgPagAntecipado {
  /** Chave de acesso da NF-e de antecipação. */
  refNFe: string;
}

// ============================================================================
// EMITENTE
// ============================================================================

/** Identificação do emitente. */
export interface Emit {
  /** CNPJ do emitente (informar apenas CNPJ ou CPF). */
  CNPJ?: string;
  /** CPF do emitente (informar apenas CNPJ ou CPF). */
  CPF?: string;
  /** Razão social ou nome do emitente. */
  xNome: string;
  /** Nome fantasia. */
  xFant?: string;
  /** Endereço do emitente. */
  enderEmit: EnderEmit;
  /** Inscrição Estadual. */
  IE: string;
  /** Inscrição Estadual do Substituto Tributário. */
  IEST?: string;
  /** Inscrição Municipal. */
  IM?: string;
  /** CNAE Fiscal. */
  CNAE?: string;
  /** Código de Regime Tributário: `1` SN, `2` SN excesso, `3` Normal, `4` MEI. */
  CRT: string;
  /** Inscrição do emitente na SUFRAMA. */
  ISUFEmit?: string;
  /** Campos adicionais. */
  [key: string]: any;
}

/** Endereço do emitente. */
export interface EnderEmit {
  /** Logradouro. */
  xLgr: string;
  /** Número. */
  nro: string;
  /** Complemento. */
  xCpl?: string;
  /** Bairro. */
  xBairro: string;
  /** Código do município (IBGE). */
  cMun: string;
  /** Nome do município. */
  xMun: string;
  /** Sigla da UF. */
  UF: string;
  /** CEP. */
  CEP: string;
  /** Código do país (1058 = Brasil). */
  cPais: string;
  /** Nome do país. */
  xPais?: string;
  /** Telefone (DDD + número). */
  fone?: string;
}

// ============================================================================
// DESTINATÁRIO
// ============================================================================

/** Identificação do destinatário. */
export interface Dest {
  /** CNPJ do destinatário. */
  CNPJ?: string;
  /** CPF do destinatário. */
  CPF?: string;
  /** Identificador de estrangeiro. */
  idEstrangeiro?: string;
  /** Razão social ou nome. */
  xNome?: string;
  /** Endereço do destinatário. */
  enderDest?: EnderDest;
  /** Indicador da IE: `1` contribuinte ICMS, `2` isento, `9` não contribuinte. */
  indIEDest: string;
  /** Inscrição Estadual (quando `indIEDest=1`). */
  IE?: string;
  /** Inscrição na SUFRAMA. */
  ISUF?: string;
  /** Inscrição Municipal. */
  IM?: string;
  /** E-mail. */
  email?: string;
  /** Campos adicionais. */
  [key: string]: any;
}

/** Endereço do destinatário. */
export interface EnderDest {
  /** Logradouro. */
  xLgr: string;
  /** Número. */
  nro: string;
  /** Complemento. */
  xCpl?: string;
  /** Bairro. */
  xBairro: string;
  /** Código do município. */
  cMun: string;
  /** Nome do município. Informar `EXTERIOR` para operações com o exterior. */
  xMun: string;
  /** Sigla da UF. Informar `EX` para operações com o exterior. */
  UF: string;
  /** CEP. */
  CEP?: string;
  /** Código do país. */
  cPais?: string;
  /** Nome do país. */
  xPais?: string;
  /** Telefone. */
  fone?: string;
}

// ============================================================================
// LOCAL (retirada / entrega)
// ============================================================================

/** Local de retirada ou entrega. */
export interface TLocal {
  /** CNPJ do local. */
  CNPJ?: string;
  /** CPF do local. */
  CPF?: string;
  /** Razão social ou nome. */
  xNome?: string;
  /** Logradouro. */
  xLgr: string;
  /** Número. */
  nro: string;
  /** Complemento. */
  xCpl?: string;
  /** Bairro. */
  xBairro: string;
  /** Código do município. */
  cMun: string;
  /** Nome do município. */
  xMun: string;
  /** Sigla da UF. */
  UF: string;
  /** CEP. */
  CEP?: string;
  /** Código do país. */
  cPais?: string;
  /** Nome do país. */
  xPais?: string;
  /** Telefone. */
  fone?: string;
  /** E-mail. */
  email?: string;
  /** Inscrição Estadual. */
  IE?: string;
}

// ============================================================================
// AVULSA / AUTXML
// ============================================================================

/** Emissão NF-e avulsa pelo Fisco. */
export interface Avulsa {
  /** CNPJ do Fisco emitente. */
  CNPJ: string;
  /** Órgão emissor. */
  xOrgao: string;
  /** Matrícula do agente. */
  matr: string;
  /** Nome do agente. */
  xAgente: string;
  /** Telefone. */
  fone?: string;
  /** Sigla da UF. */
  UF: string;
  /** Número do DAR. */
  nDAR?: string;
  /** Data de emissão do DAR. */
  dEmi?: string;
  /** Valor do DAR. */
  vDAR?: string;
  /** Repartição fiscal emitente. */
  repEmi: string;
  /** Data de pagamento do DAR. */
  dPag?: string;
}

/** Pessoa autorizada para download do XML. */
export interface AutXML {
  /** CNPJ autorizado (informar apenas CNPJ ou CPF). */
  CNPJ?: string;
  /** CPF autorizado (informar apenas CNPJ ou CPF). */
  CPF?: string;
}

// ============================================================================
// ITENS (det / prod)
// ============================================================================

/** Detalhamento de produtos e serviços. */
export interface Det {
  /** Número do item (atributo `@nItem`). */
  '@nItem': number;
  /** Dados do produto/serviço. */
  prod: Prod;
  /** Tributos do item. */
  imposto: Imposto;
  /** Impostos devolvidos. */
  impostoDevol?: TNFeInfNFeDetImpostoDevol;
  /** Informações adicionais do produto. */
  infAdProd?: string;
  /** Observações de uso livre. */
  obsItem?: ObsItem;
  /** Valor total do item. */
  vItem?: string;
  /** DF-e referenciado. */
  DFeReferenciado?: DFeReferenciado;
}

/** Dados dos produtos e serviços. */
export interface Prod {
  /** Código do produto/serviço. */
  cProd: string;
  /** GTIN (código de barras). */
  cEAN?: string;
  /** Código de barras diferente do padrão GTIN (3-30). */
  cBarra?: string;
  /** Descrição do produto/serviço. */
  xProd: string;
  /** Código NCM (8 posições). `00` para serviços. */
  NCM: string;
  /** Nomenclatura de Valor Aduaneiro e Estatístico. */
  NVE?: string[];
  /** Código Especificador da Substituição Tributária. */
  CEST?: string;
  /** Indicador de escala relevante (`S`/`N`). */
  indEscala?: string;
  /** CNPJ do fabricante. */
  CNPJFab?: string;
  /** Código de Benefício Fiscal. */
  cBenef?: string;
  /** Grupo de crédito presumido. */
  gCred?: ProdGCred[];
  /** Classificação para subapuração do IBS na ZFM (`0` a `4`). */
  tpCredPresIBSZFM?: string;
  /** Código EX TIPI. */
  EXTIPI?: string;
  /** Código Fiscal de Operações e Prestações. */
  CFOP: string;
  /** Unidade comercial. */
  uCom: string;
  /** Quantidade comercial. */
  qCom: string;
  /** Valor unitário de comercialização. */
  vUnCom: string;
  /** Valor bruto do produto/serviço. */
  vProd: string;
  /** GTIN da unidade tributável. */
  cEANTrib?: string;
  /** Código de barras da unidade tributável diferente do GTIN (3-60). */
  cBarraTrib?: string;
  /** Unidade tributável. */
  uTrib: string;
  /** Quantidade tributável. */
  qTrib: string;
  /** Valor unitário de tributação. */
  vUnTrib: string;
  /** Valor do frete do item. */
  vFrete?: string;
  /** Valor do seguro do item. */
  vSeg?: string;
  /** Valor do desconto do item. */
  vDesc?: string;
  /** Outras despesas acessórias. */
  vOutro?: string;
  /** Indica se compõe o total da NF-e: `0` não, `1` sim. */
  indTot: string;
  /** Indicador de bem móvel usado (`1` para sim). */
  indBemMovelUsado?: string;
  /** Declarações de Importação. */
  DI?: TNFeInfNFeDetProdDI[];
  /** Detalhes de exportação. */
  detExport?: TNFeInfNFeDetProdDetExport[];
  /** Número do pedido de compra. */
  xPed?: string;
  /** Número do item do pedido de compra. */
  nItemPed?: string;
  /** Número de controle da FCI. */
  nFCI?: string;
  /** Grupo de rastreabilidade. */
  rastro?: TNFeInfNFeDetProdRastro[];
  /** Informações do produto NFF. */
  infProdNFF?: TPInfProdNFF;
  /** Informações da embalagem. */
  infProdEmb?: TPInfProdEmb;
  /** Armamentos. */
  arma?: Arma[];
  /** Combustíveis líquidos. */
  comb?: Comb;
  /** Medicamentos e matérias-primas farmacêuticas. */
  med?: Med;
  /** Número do RECOPI (papel imune). */
  nRECOPI?: string;
  /** Veículos novos. */
  veicProd?: VeicProd;
}

// ============================================================================
// PRODUTOS — GRUPOS COMPLEMENTARES
// ============================================================================

/** Grupo de informações sobre o Crédito Presumido. */
export interface ProdGCred {
  /** Código de Benefício Fiscal de Crédito Presumido na UF. */
  cCredPresumido: string;
  /** Percentual do Crédito Presumido. */
  pCredPresumido: string;
  /** Valor do Crédito Presumido. */
  vCredPresumido: string;
}

/** Informações da embalagem do produto. */
export interface TPInfProdEmb {
  /** Embalagem (ex.: `a granel`, `caixa`, `garrafa`). */
  xEmb: string;
  /** Volume do produto na embalagem. */
  qVolEmb: string;
  /** Unidade de medida da embalagem (ex.: `kg`, `litro`). */
  uEmb: string;
}

/** Informações do Produto para NFF (NT 2021.002). */
export interface TPInfProdNFF {
  /** Código Fiscal do Produto. */
  cProdFisco: string;
  /** Código da operação selecionada na NFF. */
  cOperNFF: string;
}

/** Declaração de Importação. */
export interface TNFeInfNFeDetProdDI {
  /** Número da DI/DSI/DA/DRI-E. */
  nDI: string;
  /** Data de registro (`AAAA-MM-DD`). */
  dDI: string;
  /** Local de desembaraço aduaneiro. */
  xLocDesemb: string;
  /** UF de desembaraço (IBGE). */
  UFDesemb: string;
  /** Data de desembaraço (`AAAA-MM-DD`). */
  dDesemb: string;
  /** Via de transporte: `1` a `13`. */
  tpViaTransp: string;
  /** Valor adicional ao frete para renovação da marinha mercante. */
  vAFRMM?: string;
  /** Forma de importação: `1` conta própria, `2` conta e ordem, `3` encomenda. */
  tpIntermedio: string;
  /** CNPJ do adquirente/encomendante. */
  CNPJ?: string;
  /** UF do adquirente/encomendante. */
  UFTerceiro?: string;
  /** Código do exportador. */
  cExportador: string;
  /** Adições. */
  adi: TNFeInfNFeDetProdDIAdi[];
}

/** Adição da DI. */
export interface TNFeInfNFeDetProdDIAdi {
  /** Número da adição. */
  nAdicao?: string;
  /** Número sequencial do item na adição. */
  nSeqAdic: string;
  /** Código do fabricante estrangeiro. */
  cFabricante: string;
  /** Valor do desconto do item na adição. */
  vDescDI?: string;
  /** Número do ato concessório de Drawback. */
  nDraw?: string;
}

/** Detalhe da exportação. */
export interface TNFeInfNFeDetProdDetExport {
  /** Número do ato concessório de Drawback. */
  nDraw?: string;
  /** Exportação indireta. */
  exportInd?: TNFeInfNFeDetProdDetExportExportInd;
}

/** Exportação indireta. */
export interface TNFeInfNFeDetProdDetExportExportInd {
  /** Registro de exportação. */
  nRE: string;
  /** Chave de acesso da NF-e recebida para exportação. */
  chNFe: string;
  /** Quantidade exportada. */
  qExport: string;
}

/** Grupo de rastreabilidade. */
export interface TNFeInfNFeDetProdRastro {
  /** Número do lote. */
  nLote: string;
  /** Quantidade no lote. */
  qLote: string;
  /** Data de fabricação (`AAAA-MM-DD`). */
  dFab: string;
  /** Data de validade (`AAAA-MM-DD`). */
  dVal: string;
  /** Código de agregação. */
  cAgreg?: string;
}

/** Armamentos. */
export interface Arma {
  /** Tipo: `0` uso permitido, `1` uso restrito. */
  tpArma: string;
  /** Número de série da arma. */
  nSerie: string;
  /** Número de série do cano. */
  nCano: string;
  /** Descrição completa da arma. */
  descr: string;
}

/** Combustíveis líquidos. */
export interface Comb {
  /** Código de produto da ANP. */
  cProdANP: string;
  /** Descrição do produto conforme ANP. */
  descANP: string;
  /** Percentual de GLP derivado de petróleo. */
  pGLP?: string;
  /** Percentual de gás natural nacional. */
  pGNn?: string;
  /** Percentual de gás natural importado. */
  pGNi?: string;
  /** Valor de partida. */
  vPart?: string;
  /** Código de autorização/registro CODIF. */
  CODIF?: string;
  /** Quantidade à temperatura ambiente. */
  qTemp?: string;
  /** UF de consumo. */
  UFCons: string;
  /** CIDE Combustíveis. */
  CIDE?: TNFeInfNFeDetProdCombCIDE;
  /** Encerrante. */
  encerrante?: TNFeInfNFeDetProdCombEncerrante;
  /** Percentual de mistura de biodiesel. */
  pBio?: string;
  /** Origem do combustível. */
  origComb?: TNFeInfNFeDetProdCombOrigComb;
}

/** CIDE Combustíveis. */
export interface TNFeInfNFeDetProdCombCIDE {
  /** BC do CIDE (quantidade comercializada). */
  qBCProd: string;
  /** Alíquota do CIDE (em reais). */
  vAliqProd: string;
  /** Valor do CIDE. */
  vCIDE: string;
}

/** Encerrante. */
export interface TNFeInfNFeDetProdCombEncerrante {
  /** Número do bico. */
  nBico: string;
  /** Número da bomba. */
  nBomba?: string;
  /** Número do tanque. */
  nTanque: string;
  /** Valor do encerrante no início. */
  vEncIni: string;
  /** Valor do encerrante no final. */
  vEncFin: string;
}

/** Origem do combustível. */
export interface TNFeInfNFeDetProdCombOrigComb {
  /** Indicador de importação: `0` nacional, `1` importado. */
  indImport: string;
  /** UF de origem do produtor/importador. */
  cUFOrig: string;
  /** Percentual originário para a UF. */
  pOrig: string;
}

/** Medicamentos e matérias-primas farmacêuticas. */
export interface Med {
  /** Número do registro ANVISA ou `ISENTO`. */
  cProdANVISA: string;
  /** Motivo da isenção do registro ANVISA. */
  xMotivoIsencao?: string;
  /** Preço Máximo ao Consumidor. */
  vPMC: string;
}

/** Veículos novos. */
export interface VeicProd {
  /** Tipo: `1` venda concessionária, `2` faturamento direto, `3` venda direta, `0` outros. */
  tpOp: string;
  /** Chassi do veículo (VIN). */
  chassi: string;
  /** Código da cor (montadora). */
  cCor: string;
  /** Descrição da cor. */
  xCor: string;
  /** Potência máxima (CV). */
  pot: string;
  /** Cilindradas. */
  cilin: string;
  /** Peso líquido. */
  pesoL: string;
  /** Peso bruto. */
  pesoB: string;
  /** Número de série. */
  nSerie: string;
  /** Tipo de combustível (RENAVAM). */
  tpComb: string;
  /** Número do motor. */
  nMotor: string;
  /** CMT - Capacidade Máxima de Tração. */
  CMT: string;
  /** Distância entre eixos. */
  dist: string;
  /** Ano modelo de fabricação (AAAA). */
  anoMod: string;
  /** Ano de fabricação (AAAA). */
  anoFab: string;
  /** Tipo de pintura. */
  tpPint: string;
  /** Tipo de veículo (RENAVAM). */
  tpVeic: string;
  /** Espécie de veículo (RENAVAM). */
  espVeic: string;
  /** VIN remarcado (`R`) ou novo (`N`). */
  VIN: string;
  /** Condição: `1` acabado, `2` inacabado, `3` semiacabado. */
  condVeic: string;
  /** Código marca/modelo (RENAVAM). */
  cMod: string;
  /** Código da cor (DENATRAN). */
  cCorDENATRAN: string;
  /** Lotação máxima. */
  lota: string;
  /** Restrição: `0` a `9`. */
  tpRest: string;
}

// ============================================================================
// IMPOSTOS
// ============================================================================

/** Tributos incidentes nos produtos/serviços. */
export interface Imposto {
  /** Valor estimado total de tributos. */
  vTotTrib?: string;
  /** ICMS. */
  ICMS?: ICMS;
  /** IPI. */
  IPI?: IPI;
  /** Imposto de Importação. */
  II?: II;
  /** ISSQN. */
  ISSQN?: ISSQN;
  /** PIS. */
  PIS?: PIS;
  /** PIS Substituição Tributária. */
  PISST?: PISST;
  /** COFINS. */
  COFINS?: COFINS;
  /** COFINS Substituição Tributária. */
  COFINSST?: COFINSST;
  /** ICMS para UF de destino. */
  ICMSUFDest?: ICMSUFDest;
  /** Imposto Seletivo. */
  IS?: TIS;
  /** IBS e CBS (Reforma Tributária). */
  IBSCBS?: TTribNFe;
}

/** Origem da mercadoria. */
export interface ICMSOrigem {
  /** Código de origem: `0` a `8`. */
  orig: string;
}

/** Grupo de ICMS. Apenas um dos campos deve ser preenchido. */
export interface ICMS {
  ICMS00?: ICMS00;
  ICMS02?: ICMS02;
  ICMS10?: ICMS10;
  ICMS15?: ICMS15;
  ICMS20?: ICMS20;
  ICMS30?: ICMS30;
  ICMS40?: ICMS40;
  ICMS51?: ICMS51;
  ICMS53?: ICMS53;
  ICMS60?: ICMS60;
  ICMS61?: ICMS61;
  ICMS70?: ICMS70;
  ICMS90?: ICMS90;
  ICMSPart?: ICMSPart;
  ICMSST?: ICMSST;
  ICMSSN101?: ICMSSN101;
  ICMSSN102?: ICMSSN102;
  ICMSSN201?: ICMSSN201;
  ICMSSN202?: ICMSSN202;
  ICMSSN500?: ICMSSN500;
  ICMSSN900?: ICMSSN900;
}

/** CST 00 - Tributada integralmente. */
export interface ICMS00 extends ICMSOrigem {
  /** CST: `00`. */
  CST: string;
  /** Modalidade de BC: `0` margem, `1` pauta, `2` preço tabelado, `3` valor da operação. */
  modBC: string;
  /** Valor da BC do ICMS. */
  vBC: string;
  /** Alíquota do ICMS. */
  pICMS: string;
  /** Valor do ICMS. */
  vICMS: string;
  /** Percentual do FCP. */
  pFCP?: string;
  /** Valor do FCP. */
  vFCP?: string;
}

/** CST 02 - Tributação monofásica própria sobre combustíveis. */
export interface ICMS02 extends ICMSOrigem {
  /** CST: `02`. */
  CST: string;
  /** Quantidade tributada. */
  qBCMono: string;
  /** Alíquota ad rem. */
  adRemICMS: string;
  /** Valor do ICMS próprio. */
  vICMSMono: string;
}

/** CST 10 - Tributada e com cobrança do ICMS por ST. */
export interface ICMS10 extends ICMSOrigem {
  /** CST: `10`. */
  CST: string;
  /** Modalidade de BC do ICMS. */
  modBC: string;
  /** Valor da BC do ICMS. */
  vBC: string;
  /** Alíquota do ICMS. */
  pICMS: string;
  /** Valor do ICMS. */
  vICMS: string;
  /** Valor da BC do FCP. */
  vBCFCP?: string;
  /** Percentual do FCP. */
  pFCP?: string;
  /** Valor do FCP. */
  vFCP?: string;
  /** Modalidade de BC do ICMS ST. */
  modBCST: string;
  /** Percentual de MVA. */
  pMVAST?: string;
  /** Percentual de redução da BC ST. */
  pRedBCST?: string;
  /** Valor da BC do ICMS ST. */
  vBCST: string;
  /** Alíquota do ICMS ST. */
  pICMSST: string;
  /** Valor do ICMS ST. */
  vICMSST: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
  /** Valor do ICMS ST desonerado. */
  vICMSSTDeson?: string;
  /** Motivo da desoneração do ICMS ST. */
  motDesICMSST?: string;
}

/** CST 15 - Monofásica própria e com retenção. */
export interface ICMS15 extends ICMSOrigem {
  /** CST: `15`. */
  CST: string;
  /** Quantidade tributada. */
  qBCMono: string;
  /** Alíquota ad rem. */
  adRemICMS: string;
  /** Valor do ICMS próprio. */
  vICMSMono: string;
  /** Quantidade sujeita a retenção. */
  qBCMonoReten: string;
  /** Alíquota ad rem com retenção. */
  adRemICMSReten: string;
  /** Valor do ICMS com retenção. */
  vICMSMonoReten: string;
  /** Percentual de redução do ad rem. */
  pRedAdRem?: string;
  /** Motivo da redução: `1` transporte coletivo, `9` outros. */
  motRedAdRem?: string;
}

/** CST 20 - Com redução de BC. */
export interface ICMS20 extends ICMSOrigem {
  /** CST: `20`. */
  CST: string;
  /** Modalidade de BC. */
  modBC: string;
  /** Percentual de redução da BC. */
  pRedBC: string;
  /** Valor da BC. */
  vBC: string;
  /** Alíquota do ICMS. */
  pICMS: string;
  /** Valor do ICMS. */
  vICMS: string;
  /** BC do FCP. */
  vBCFCP?: string;
  /** Percentual do FCP. */
  pFCP?: string;
  /** Valor do FCP. */
  vFCP?: string;
  /** Valor do ICMS desonerado. */
  vICMSDeson?: string;
  /** Motivo da desoneração. */
  motDesICMS?: string;
  /** Indica se o ICMS desonerado deduz do vProd: `0` não, `1` sim. */
  indDeduzDeson?: string;
}

/** CST 30 - Isenta/não tributada com ICMS ST. */
export interface ICMS30 extends ICMSOrigem {
  /** CST: `30`. */
  CST: string;
  /** Modalidade de BC ST. */
  modBCST: string;
  /** MVA. */
  pMVAST?: string;
  /** Redução da BC ST. */
  pRedBCST?: string;
  /** BC do ICMS ST. */
  vBCST: string;
  /** Alíquota do ICMS ST. */
  pICMSST: string;
  /** Valor do ICMS ST. */
  vICMSST: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
  /** Valor do ICMS desonerado. */
  vICMSDeson?: string;
  /** Motivo da desoneração. */
  motDesICMS?: string;
  /** Indica se deduz do vProd. */
  indDeduzDeson?: string;
}

/** CST 40/41/50/51 - Isenta, não tributada, suspensão, diferimento. */
export interface ICMS40 extends ICMSOrigem {
  /** CST: `40`, `41`, `50`, `51`. */
  CST: string;
  /** Valor do ICMS desonerado (apenas veículos com desoneração condicional). */
  vICMSDeson?: string;
  /** Motivo da desoneração. */
  motDesICMS?: string;
  /** Indica se deduz do vProd. */
  indDeduzDeson?: string;
}

/** CST 51 - Diferimento. */
export interface ICMS51 extends ICMSOrigem {
  /** CST: `51`. */
  CST: string;
  /** Modalidade de BC. */
  modBC?: string;
  /** Redução da BC. */
  pRedBC?: string;
  /** Valor da BC. */
  vBC?: string;
  /** Alíquota do ICMS. */
  pICMS?: string;
  /** Valor do ICMS da operação. */
  vICMSOp?: string;
  /** Percentual do diferimento. */
  pDif?: string;
  /** Valor do ICMS diferido. */
  vICMSDif?: string;
  /** Valor do ICMS. */
  vICMS?: string;
  /** BC do FCP. */
  vBCFCP?: string;
  /** Percentual do FCP. */
  pFCP?: string;
  /** Valor do FCP. */
  vFCP?: string;
  /** Percentual de diferimento do FCP. */
  pFCPDif?: string;
  /** Valor do FCP diferido. */
  vFCPDif?: string;
  /** Valor efetivo do FCP. */
  vFCPEfet?: string;
}

/** CST 53 - Monofásica sobre combustíveis com recolhimento diferido. */
export interface ICMS53 extends ICMSOrigem {
  /** CST: `53`. */
  CST: string;
  /** Quantidade tributada. */
  qBCMono?: string;
  /** Alíquota ad rem. */
  adRemICMS?: string;
  /** Valor do ICMS da operação. */
  vICMSMonoOp?: string;
  /** Percentual do diferimento. */
  pDif?: string;
  /** Valor do ICMS diferido. */
  vICMSMonoDif?: string;
  /** Valor do ICMS próprio devido. */
  vICMSMono?: string;
  /** Quantidade diferida. */
  qBCMonoDif?: string;
  /** Alíquota ad rem diferida. */
  adRemICMSDif?: string;
}

/** CST 60 - ICMS cobrado anteriormente por ST. */
export interface ICMS60 extends ICMSOrigem {
  /** CST: `60`. */
  CST: string;
  /** BC do ICMS ST retido anteriormente. */
  vBCSTRet?: string;
  /** Alíquota suportada pelo consumidor final. */
  pST?: string;
  /** Valor do ICMS do substituto. */
  vICMSSubstituto?: string;
  /** Valor do ICMS ST retido. */
  vICMSSTRet?: string;
  /** BC do FCP ST retido. */
  vBCFCPSTRet?: string;
  /** Percentual do FCP ST retido. */
  pFCPSTRet?: string;
  /** Valor do FCP ST retido. */
  vFCPSTRet?: string;
  /** Redução da BC efetiva. */
  pRedBCEfet?: string;
  /** BC efetiva. */
  vBCEfet?: string;
  /** Alíquota efetiva. */
  pICMSEfet?: string;
  /** Valor do ICMS efetivo. */
  vICMSEfet?: string;
}

/** CST 61 - Monofásica cobrada anteriormente. */
export interface ICMS61 extends ICMSOrigem {
  /** CST: `61`. */
  CST: string;
  /** Quantidade retida anteriormente. */
  qBCMonoRet: string;
  /** Alíquota ad rem retida. */
  adRemICMSRet: string;
  /** Valor do ICMS retido. */
  vICMSMonoRet: string;
}

/** CST 70 - Redução de BC e ICMS ST. */
export interface ICMS70 extends ICMSOrigem {
  /** CST: `70`. */
  CST: string;
  /** Modalidade de BC. */
  modBC: string;
  /** Redução da BC. */
  pRedBC: string;
  /** Valor da BC. */
  vBC: string;
  /** Alíquota do ICMS. */
  pICMS: string;
  /** Valor do ICMS. */
  vICMS: string;
  /** BC do FCP. */
  vBCFCP?: string;
  /** Percentual do FCP. */
  pFCP?: string;
  /** Valor do FCP. */
  vFCP?: string;
  /** Modalidade de BC ST. */
  modBCST: string;
  /** MVA. */
  pMVAST?: string;
  /** Redução da BC ST. */
  pRedBCST?: string;
  /** BC do ICMS ST. */
  vBCST: string;
  /** Alíquota do ICMS ST. */
  pICMSST: string;
  /** Valor do ICMS ST. */
  vICMSST: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
  /** Valor do ICMS desonerado. */
  vICMSDeson?: string;
  /** Motivo da desoneração. */
  motDesICMS?: string;
  /** Indica se deduz do vProd. */
  indDeduzDeson?: string;
  /** Valor do ICMS ST desonerado. */
  vICMSSTDeson?: string;
  /** Motivo da desoneração do ICMS ST. */
  motDesICMSST?: string;
}

/** CST 90 - Outras. */
export interface ICMS90 extends ICMSOrigem {
  /** CST: `90`. */
  CST: string;
  /** Modalidade de BC. */
  modBC?: string;
  /** Valor da BC. */
  vBC?: string;
  /** Redução da BC. */
  pRedBC?: string;
  /** Código de Benefício Fiscal quando houver RBC. */
  cBenefRBC?: string;
  /** Alíquota do ICMS. */
  pICMS?: string;
  /** Valor do ICMS da operação. */
  vICMSOp?: string;
  /** Percentual do diferimento. */
  pDif?: string;
  /** Valor do ICMS diferido. */
  vICMSDif?: string;
  /** Valor do ICMS. */
  vICMS?: string;
  /** BC do FCP. */
  vBCFCP?: string;
  /** Percentual do FCP. */
  pFCP?: string;
  /** Valor do FCP. */
  vFCP?: string;
  /** Percentual de diferimento do FCP. */
  pFCPDif?: string;
  /** Valor do FCP diferido. */
  vFCPDif?: string;
  /** Valor efetivo do FCP. */
  vFCPEfet?: string;
  /** Modalidade de BC ST. */
  modBCST?: string;
  /** MVA. */
  pMVAST?: string;
  /** Redução da BC ST. */
  pRedBCST?: string;
  /** BC do ICMS ST. */
  vBCST?: string;
  /** Alíquota do ICMS ST. */
  pICMSST?: string;
  /** Valor do ICMS ST. */
  vICMSST?: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
  /** Valor do ICMS desonerado. */
  vICMSDeson?: string;
  /** Motivo da desoneração. */
  motDesICMS?: string;
  /** Indica se deduz do vProd. */
  indDeduzDeson?: string;
  /** Valor do ICMS ST desonerado. */
  vICMSSTDeson?: string;
  /** Motivo da desoneração do ICMS ST. */
  motDesICMSST?: string;
}

/** Partilha do ICMS entre UF de origem e destino. */
export interface ICMSPart extends ICMSOrigem {
  /** CST: `10`, `20`, `90`. */
  CST: string;
  /** Modalidade de BC. */
  modBC: string;
  /** Valor da BC. */
  vBC: string;
  /** Redução da BC. */
  pRedBC?: string;
  /** Alíquota do ICMS. */
  pICMS: string;
  /** Valor do ICMS. */
  vICMS: string;
  /** Modalidade de BC ST. */
  modBCST: string;
  /** MVA. */
  pMVAST?: string;
  /** Redução da BC ST. */
  pRedBCST?: string;
  /** BC do ICMS ST. */
  vBCST: string;
  /** Alíquota do ICMS ST. */
  pICMSST: string;
  /** Valor do ICMS ST. */
  vICMSST: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
  /** Percentual da BC da operação própria. */
  pBCOp: string;
  /** UF para a qual é devido o ICMS ST. */
  UFST: string;
  /** Valor do ICMS desonerado. */
  vICMSDeson?: string;
  /** Motivo da desoneração. */
  motDesICMS?: string;
  /** Indica se deduz do vProd. */
  indDeduzDeson?: string;
}

/** ICMS ST devido para UF de destino. */
export interface ICMSST extends ICMSOrigem {
  /** CST: `41` não tributado, `60` cobrado anteriormente por ST. */
  CST: string;
  /** BC do ICMS ST retido na UF remetente. */
  vBCSTRet: string;
  /** Alíquota suportada pelo consumidor final. */
  pST?: string;
  /** Valor do ICMS do substituto. */
  vICMSSubstituto?: string;
  /** Valor do ICMS ST retido. */
  vICMSSTRet: string;
  /** BC do FCP ST retido. */
  vBCFCPSTRet?: string;
  /** Percentual do FCP ST retido. */
  pFCPSTRet?: string;
  /** Valor do FCP ST retido. */
  vFCPSTRet?: string;
  /** BC do ICMS ST da UF destino. */
  vBCSTDest: string;
  /** Valor do ICMS ST da UF destino. */
  vICMSSTDest: string;
  /** Redução da BC efetiva. */
  pRedBCEfet?: string;
  /** BC efetiva. */
  vBCEfet?: string;
  /** Alíquota efetiva. */
  pICMSEfet?: string;
  /** Valor do ICMS efetivo. */
  vICMSEfet?: string;
}

/** Simples Nacional - CSOSN 101. */
export interface ICMSSN101 extends ICMSOrigem {
  /** CSOSN: `101`. */
  CSOSN: string;
  /** Alíquota de crédito do SN. */
  pCredSN: string;
  /** Valor do crédito do ICMS. */
  vCredICMSSN: string;
}

/** Simples Nacional - CSOSN 102/103/300/400. */
export interface ICMSSN102 extends ICMSOrigem {
  /** CSOSN: `102`, `103`, `300`, `400`. */
  CSOSN: string;
}

/** Simples Nacional - CSOSN 201. */
export interface ICMSSN201 extends ICMSOrigem {
  /** CSOSN: `201`. */
  CSOSN: string;
  /** Modalidade de BC ST. */
  modBCST: string;
  /** MVA. */
  pMVAST?: string;
  /** Redução da BC ST. */
  pRedBCST?: string;
  /** BC do ICMS ST. */
  vBCST: string;
  /** Alíquota do ICMS ST. */
  pICMSST: string;
  /** Valor do ICMS ST. */
  vICMSST: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
  /** Alíquota de crédito do SN. */
  pCredSN: string;
  /** Valor do crédito do ICMS. */
  vCredICMSSN: string;
}

/** Simples Nacional - CSOSN 202/203. */
export interface ICMSSN202 extends ICMSOrigem {
  /** CSOSN: `202`, `203`. */
  CSOSN: string;
  /** Modalidade de BC ST. */
  modBCST: string;
  /** MVA. */
  pMVAST?: string;
  /** Redução da BC ST. */
  pRedBCST?: string;
  /** BC do ICMS ST. */
  vBCST: string;
  /** Alíquota do ICMS ST. */
  pICMSST: string;
  /** Valor do ICMS ST. */
  vICMSST: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
}

/** Simples Nacional - CSOSN 500. */
export interface ICMSSN500 extends ICMSOrigem {
  /** CSOSN: `500`. */
  CSOSN: string;
  /** BC do ICMS ST retido. */
  vBCSTRet?: string;
  /** Alíquota suportada pelo consumidor final. */
  pST?: string;
  /** Valor do ICMS do substituto. */
  vICMSSubstituto?: string;
  /** Valor do ICMS ST retido. */
  vICMSSTRet?: string;
  /** BC do FCP ST retido. */
  vBCFCPSTRet?: string;
  /** Percentual do FCP ST retido. */
  pFCPSTRet?: string;
  /** Valor do FCP ST retido. */
  vFCPSTRet?: string;
  /** Redução da BC efetiva. */
  pRedBCEfet?: string;
  /** BC efetiva. */
  vBCEfet?: string;
  /** Alíquota efetiva. */
  pICMSEfet?: string;
  /** Valor do ICMS efetivo. */
  vICMSEfet?: string;
}

/** Simples Nacional - CSOSN 900. */
export interface ICMSSN900 extends ICMSOrigem {
  /** CSOSN: `900`. */
  CSOSN: string;
  /** Modalidade de BC. */
  modBC?: string;
  /** Valor da BC. */
  vBC?: string;
  /** Redução da BC. */
  pRedBC?: string;
  /** Alíquota do ICMS. */
  pICMS?: string;
  /** Valor do ICMS. */
  vICMS?: string;
  /** Modalidade de BC ST. */
  modBCST?: string;
  /** MVA. */
  pMVAST?: string;
  /** Redução da BC ST. */
  pRedBCST?: string;
  /** BC do ICMS ST. */
  vBCST?: string;
  /** Alíquota do ICMS ST. */
  pICMSST?: string;
  /** Valor do ICMS ST. */
  vICMSST?: string;
  /** BC do FCP ST. */
  vBCFCPST?: string;
  /** Percentual do FCP ST. */
  pFCPST?: string;
  /** Valor do FCP ST. */
  vFCPST?: string;
  /** Alíquota de crédito do SN. */
  pCredSN?: string;
  /** Valor do crédito do ICMS. */
  vCredICMSSN?: string;
}

// ============================================================================
// IPI / II / ISSQN / PIS / COFINS / ICMSUFDest
// ============================================================================

/** IPI - Imposto sobre Produtos Industrializados. */
export interface IPI {
  /** CNPJ do produtor (quando diferente do emitente). */
  CNPJProd?: string;
  /** Código do selo de controle do IPI. */
  cSelo?: string;
  /** Quantidade de selo. */
  qSelo?: string;
  /** Código de enquadramento legal do IPI. */
  cEnq: string;
  /** IPI tributado (CST 00, 49, 50, 99). */
  IPITrib?: IPITrib;
  /** IPI não tributado (CST 01 a 05, 51 a 55). */
  IPINT?: IPINT;
}

/** IPI tributado. */
export interface IPITrib {
  /** CST: `00`, `49`, `50`, `99`. */
  CST: string;
  /** Valor da BC do IPI (cálculo por alíquota). */
  vBC?: string;
  /** Alíquota do IPI (cálculo por alíquota). */
  pIPI?: string;
  /** Quantidade na unidade padrão (cálculo por unidade). */
  qUnid?: string;
  /** Valor por unidade (cálculo por unidade). */
  vUnid?: string;
  /** Valor do IPI. */
  vIPI: string;
}

/** IPI não tributado. */
export interface IPINT {
  /** CST: `01` a `05`, `51` a `55`. */
  CST: string;
}

/** Imposto de Importação. */
export interface II {
  /** Base de cálculo. */
  vBC: string;
  /** Despesas aduaneiras. */
  vDespAdu: string;
  /** Valor do II. */
  vII: string;
  /** Valor do IOF. */
  vIOF: string;
}

/** ISSQN - Imposto Sobre Serviços de Qualquer Natureza. */
export interface ISSQN {
  /** Base de cálculo. */
  vBC: string;
  /** Alíquota do ISS. */
  vAliq: string;
  /** Valor do ISSQN. */
  vISSQN: string;
  /** Código do município do fato gerador. */
  cMunFG: string;
  /** Item da lista de serviços (LC 116/2003). */
  cListServ: string;
  /** Valor da dedução. */
  vDeducao?: string;
  /** Outras retenções. */
  vOutro?: string;
  /** Desconto incondicional. */
  vDescIncond?: string;
  /** Desconto condicional. */
  vDescCond?: string;
  /** ISS retido. */
  vISSRet?: string;
  /** Exigibilidade: `1` a `7`. */
  indISS: string;
  /** Código do serviço. */
  cServico?: string;
  /** Código do município (IBGE). */
  cMun?: string;
  /** Código do país. */
  cPais?: string;
  /** Número do processo. */
  nProcesso?: string;
  /** Indicador de incentivo fiscal: `1` sim, `2` não. */
  indIncentivo: string;
}

/** PIS - Contribuição para o Programa de Integração Social. */
export interface PIS {
  /** PIS tributado por alíquota. */
  PISAliq?: PISAliq;
  /** PIS não tributado. */
  PISNT?: PISNT;
  /** PIS outras operações. */
  PISOutr?: PISOutr;
  /** PIS por quantidade. */
  PISQtde?: PISQtde;
}

/** PIS tributado por alíquota. */
export interface PISAliq {
  /** CST: `01` ou `02`. */
  CST: string;
  /** Base de cálculo. */
  vBC: string;
  /** Alíquota do PIS. */
  pPIS: string;
  /** Valor do PIS. */
  vPIS: string;
}

/** PIS não tributado. */
export interface PISNT {
  /** CST: `04`, `06`, `07`, `08`, `09`. */
  CST: string;
}

/** PIS outras operações. */
export interface PISOutr {
  /** CST: 49 a 99. */
  CST: string;
  /** Base de cálculo. */
  vBC?: string;
  /** Alíquota (percentual). */
  pPIS?: string;
  /** Quantidade vendida (NT 2011/004). */
  qBCProd?: string;
  /** Alíquota em reais (NT 2011/004). */
  vAliqProd?: string;
  /** Valor do PIS. */
  vPIS: string;
}

/** PIS por quantidade. */
export interface PISQtde {
  /** CST: `03`. */
  CST: string;
  /** Quantidade vendida. */
  qBCProd: string;
  /** Alíquota em reais. */
  vAliqProd: string;
  /** Valor do PIS. */
  vPIS: string;
}

/** PIS Substituição Tributária. */
export interface PISST {
  /** Base de cálculo. */
  vBC?: string;
  /** Alíquota percentual. */
  pPIS?: string;
  /** Quantidade vendida. */
  qBCProd?: string;
  /** Alíquota em reais. */
  vAliqProd?: string;
  /** Valor do PIS ST. */
  vPIS: string;
  /** Indica se compõe o total da NF-e: `0` não, `1` sim. */
  indSomaPISST?: string;
}

/** COFINS - Contribuição para o Financiamento da Seguridade Social. */
export interface COFINS {
  /** COFINS por alíquota. */
  COFINSAliq?: COFINSAliq;
  /** COFINS não tributado. */
  COFINSNT?: COFINSNT;
  /** COFINS outras operações. */
  COFINSOutr?: COFINSOutr;
  /** COFINS por quantidade. */
  COFINSQtde?: COFINSQtde;
}

/** COFINS por alíquota. */
export interface COFINSAliq {
  /** CST: `01` ou `02`. */
  CST: string;
  /** Base de cálculo. */
  vBC: string;
  /** Alíquota do COFINS. */
  pCOFINS: string;
  /** Valor do COFINS. */
  vCOFINS: string;
}

/** COFINS não tributado. */
export interface COFINSNT {
  /** CST: `04`, `06`, `07`, `08`, `09`. */
  CST: string;
}

/** COFINS outras operações. */
export interface COFINSOutr {
  /** CST: 49 a 99. */
  CST: string;
  /** Base de cálculo. */
  vBC?: string;
  /** Alíquota percentual. */
  pCOFINS?: string;
  /** Quantidade vendida. */
  qBCProd?: string;
  /** Alíquota em reais. */
  vAliqProd?: string;
  /** Valor do COFINS. */
  vCOFINS: string;
}

/** COFINS por quantidade. */
export interface COFINSQtde {
  /** CST: `03`. */
  CST: string;
  /** Quantidade vendida. */
  qBCProd: string;
  /** Alíquota em reais. */
  vAliqProd: string;
  /** Valor do COFINS. */
  vCOFINS: string;
}

/** COFINS Substituição Tributária. */
export interface COFINSST {
  /** Base de cálculo. */
  vBC?: string;
  /** Alíquota percentual. */
  pCOFINS?: string;
  /** Quantidade vendida. */
  qBCProd?: string;
  /** Alíquota em reais. */
  vAliqProd?: string;
  /** Valor do COFINS ST. */
  vCOFINS: string;
  /** Indica se compõe o total da NF-e: `0` não, `1` sim. */
  indSomaCOFINSST?: string;
}

/** ICMS para UF de destino (vendas a consumidor final não contribuinte). */
export interface ICMSUFDest {
  /** BC do ICMS na UF de destino. */
  vBCUFDest: string;
  /** BC do FCP na UF de destino. */
  vBCFCPUFDest?: string;
  /** Percentual do FCP na UF de destino. */
  pFCPUFDest?: string;
  /** Alíquota interna da UF de destino. */
  pICMSUFDest: string;
  /** Alíquota interestadual (`4%`, `7%` ou `12%`). */
  pICMSInter: string;
  /** Percentual de partilha para UF de destino. */
  pICMSInterPart: string;
  /** Valor do FCP da UF de destino. */
  vFCPUFDest?: string;
  /** Valor do ICMS de partilha para UF de destino. */
  vICMSUFDest: string;
  /** Valor do ICMS de partilha para UF remetente (zero a partir de 2019). */
  vICMSUFRemet: string;
}

/** Impostos devolvidos. */
export interface TNFeInfNFeDetImpostoDevol {
  /** Percentual de mercadoria devolvida. */
  pDevol: string;
  /** Informação de IPI devolvido. */
  IPI: TNFeInfNFeDetImpostoDevolIPI;
}

/** IPI devolvido. */
export interface TNFeInfNFeDetImpostoDevolIPI {
  /** Valor do IPI devolvido. */
  vIPIDevol: string;
}

// ============================================================================
// IS / IBS / CBS — REFORMA TRIBUTÁRIA
// ============================================================================

/** Imposto Seletivo (IS). */
export interface TIS {
  /** CST do IS. */
  CSTIS: string;
  /** Classificação tributária do IS. */
  cClassTribIS: string;
  /** Base de cálculo do IS. */
  vBCIS: string;
  /** Alíquota do IS. */
  pIS?: string;
  /** Alíquota específica por unidade. */
  adRemIS?: string;
  /** Unidade de medida tributável. */
  uTrib?: string;
  /** Quantidade tributável. */
  qTrib?: string;
  /** Valor do IS. */
  vIS: string;
}

/** Informações do IBS e CBS (Reforma Tributária). */
export interface TTribNFe {
  /** CST do IBS/CBS. */
  CST: string;
  /** Classificação tributária do IBS/CBS. */
  cClassTrib: string;
  /** Indicador de doação (`1` sim). */
  indDoacao?: string;
  /** Ajuste de competência. */
  gAjusteCompet?: TAjusteCompet;
  /** Grupo IBS/CBS. */
  gIBSCBS?: TCIBS;
  /** Grupo monofásico. */
  gIBSCBSMono?: TMonofasia;
  /** Transferência de crédito. */
  gTransfCred?: TTransfCred;
  /** Estorno de crédito. */
  gEstornoCred?: TEstornoCred;
  /** Crédito presumido IBS ZFM. */
  gCredPresIBSZFM?: TCredPresIBSZFM;
  /** Crédito presumido da operação. */
  gCredPresOper?: TCredPresOper;
}

/** Ajuste de competência. */
export interface TAjusteCompet {
  /** Ano/mês de apuração (AAAA-MM). */
  competApur: string;
  /** Valor do IBS. */
  vIBS: string;
  /** Valor da CBS. */
  vCBS: string;
}

/** Estorno de crédito. */
export interface TEstornoCred {
  /** Valor do IBS estornado. */
  vIBSEstCred: string;
  /** Valor da CBS estornada. */
  vCBSEstCred: string;
}

/** Crédito presumido de IBS ZFM. */
export interface TCredPresIBSZFM {
  /** Ano/mês de apuração. */
  competApur: string;
  /** Classificação: `0` sem, `1` consumo final, `2` capital, `3` intermediários, `4` informática. */
  tpCredPresIBSZFM: string;
  /** Valor do crédito presumido. */
  vCredPresIBSZFM: string;
}

/** Transferência de crédito. */
export interface TTransfCred {
  /** Valor do IBS transferido. */
  vIBS: string;
  /** Valor da CBS transferida. */
  vCBS: string;
}

/** Informações do IBS/CBS monofásico. */
export interface TMonofasia {
  /** Monofásica padrão. */
  gMonoPadrao?: TMonofasiaGMonoPadrao;
  /** Monofásica sujeita à retenção. */
  gMonoReten?: TMonofasiaGMonoReten;
  /** Monofásica retida anteriormente. */
  gMonoRet?: TMonofasiaGMonoRet;
  /** Monofásica diferida. */
  gMonoDif?: TMonofasiaGMonoDif;
  /** Total de IBS monofásico do item. */
  vTotIBSMonoItem: string;
  /** Total de CBS monofásica do item. */
  vTotCBSMonoItem: string;
}

/** Diferimento da tributação monofásica. */
export interface TMonofasiaGMonoDif {
  /** Percentual de diferimento do IBS. */
  pDifIBS: string;
  /** Valor do IBS diferido. */
  vIBSMonoDif: string;
  /** Percentual de diferimento da CBS. */
  pDifCBS: string;
  /** Valor da CBS diferida. */
  vCBSMonoDif: string;
}

/** Monofásica retida anteriormente. */
export interface TMonofasiaGMonoRet {
  /** Quantidade retida. */
  qBCMonoRet: string;
  /** Alíquota ad rem do IBS retido. */
  adRemIBSRet: string;
  /** Valor do IBS retido. */
  vIBSMonoRet: string;
  /** Alíquota ad rem da CBS retida. */
  adRemCBSRet: string;
  /** Valor da CBS retida. */
  vCBSMonoRet: string;
}

/** Monofásica sujeita à retenção. */
export interface TMonofasiaGMonoReten {
  /** Quantidade sujeita à retenção. */
  qBCMonoReten: string;
  /** Alíquota ad rem do IBS. */
  adRemIBSReten: string;
  /** Valor do IBS com retenção. */
  vIBSMonoReten: string;
  /** Alíquota ad rem da CBS. */
  adRemCBSReten: string;
  /** Valor da CBS com retenção. */
  vCBSMonoReten: string;
}

/** Monofásica padrão. */
export interface TMonofasiaGMonoPadrao {
  /** Quantidade tributada. */
  qBCMono: string;
  /** Alíquota ad rem do IBS. */
  adRemIBS: string;
  /** Alíquota ad rem da CBS. */
  adRemCBS: string;
  /** Valor do IBS monofásico. */
  vIBSMono: string;
  /** Valor da CBS monofásica. */
  vCBSMono: string;
}

/** Grupo de informações do IBS e CBS. */
export interface TCIBS {
  /** Base de cálculo do IBS/CBS. */
  vBC: string;
  /** IBS da UF. */
  gIBSUF?: TCIBSGIBSUF;
  /** IBS do Município. */
  gIBSMun?: TCIBSGIBSMun;
  /** Valor total do IBS. */
  vIBS: string;
  /** CBS. */
  gCBS?: TCIBSGCBS;
  /** Tributação regular. */
  gTribRegular?: TTribRegular;
  /** Tributação em compras governamentais. */
  gTribCompraGov?: TTribCompraGov;
}

/** Tributação em compras governamentais. */
export interface TTribCompraGov {
  /** Alíquota do IBS da UF. */
  pAliqIBSUF: string;
  /** Valor do IBS da UF. */
  vTribIBSUF: string;
  /** Alíquota do IBS do Município. */
  pAliqIBSMun: string;
  /** Valor do IBS do Município. */
  vTribIBSMun: string;
  /** Alíquota da CBS. */
  pAliqCBS: string;
  /** Valor da CBS. */
  vTribCBS: string;
}

/** Crédito presumido (IBS ou CBS). */
export interface TCredPres {
  /** Percentual do crédito presumido. */
  pCredPres: string;
  /** Valor do crédito presumido. */
  vCredPres: string;
  /** Valor em condição suspensiva. */
  vCredPresCondSus?: string;
}

/** Tributação regular. */
export interface TTribRegular {
  /** CST regular. */
  CSTReg: string;
  /** Classificação tributária regular. */
  cClassTribReg: string;
  /** Alíquota efetiva do IBS UF. */
  pAliqEfetRegIBSUF: string;
  /** Valor do IBS UF. */
  vTribRegIBSUF: string;
  /** Alíquota efetiva do IBS Município. */
  pAliqEfetRegIBSMun: string;
  /** Valor do IBS Município. */
  vTribRegIBSMun: string;
  /** Alíquota efetiva da CBS. */
  pAliqEfetRegCBS: string;
  /** Valor da CBS. */
  vTribRegCBS: string;
}

/** Informações da CBS. */
export interface TCIBSGCBS {
  /** Alíquota da CBS. */
  pCBS: string;
  /** Diferimento. */
  gDif?: TDif;
  /** Devolução de tributos. */
  gDevTrib?: TDevTrib;
  /** Redução de alíquota. */
  gRed?: TRed;
  /** ALC/ZFM CBS. */
  gALCZFMCBS?: TgALCZFMCBS;
  /** Valor da CBS. */
  vCBS: string;
}

/** Operações em áreas incentivadas (ALC/ZFM) - CBS. */
export interface TgALCZFMCBS {
  /** Tipo de aplicação: `1` sem processo Suframa, `2` com processo Suframa. */
  tpALCZFMCBS: string;
  /** Número do processo na Suframa. */
  nProcSuframa: string;
  /** Alíquota efetiva de referência. */
  pAliqEfetRegCBS: string;
  /** Valor da CBS de referência. */
  vTribRegCBS: string;
}

/** Redução de alíquota. */
export interface TRed {
  /** Percentual de redução. */
  pRedAliq: string;
  /** Alíquota efetiva. */
  pAliqEfet: string;
}

/** Devolução de tributos. */
export interface TDevTrib {
  /** Percentual de devolução. */
  pDevTrib: string;
  /** Valor devolvido. */
  vDevTrib: string;
}

/** Diferimento. */
export interface TDif {
  /** Percentual do diferimento. */
  pDif: string;
  /** Valor do diferimento. */
  vDif: string;
}

/** IBS do Município. */
export interface TCIBSGIBSMun {
  /** Alíquota do IBS do Município. */
  pIBSMun: string;
  /** Diferimento. */
  gDif?: TDif;
  /** Devolução de tributos. */
  gDevTrib?: TDevTrib;
  /** Redução. */
  gRed?: TRed;
  /** Valor do IBS do Município. */
  vIBSMun: string;
}

/** IBS da UF. */
export interface TCIBSGIBSUF {
  /** Alíquota do IBS da UF. */
  pIBSUF: string;
  /** Diferimento. */
  gDif?: TDif;
  /** Devolução de tributos. */
  gDevTrib?: TDevTrib;
  /** Redução. */
  gRed?: TRed;
  /** Valor do IBS da UF. */
  vIBSUF: string;
}

/** Crédito presumido da operação. */
export interface TCredPresOper {
  /** BC do crédito presumido. */
  vBCCredPres: string;
  /** Código do crédito presumido. */
  cCredPres: string;
  /** Crédito presumido IBS. */
  gIBSCredPres?: TCredPres;
  /** Crédito presumido CBS. */
  gCBSCredPres?: TCredPres;
}

// ============================================================================
// TOTAIS
// ============================================================================

/** Totais da NF-e. */
export interface Total {
  /** Totais do ICMS. */
  ICMSTot: ICMSTot;
  /** Totais do ISSQN. */
  ISSQNtot?: ISSQNtot;
  /** Tributos retidos. */
  retTrib?: RetTrib;
  /** Total do Imposto Seletivo. */
  ISTot?: ISTot;
  /** Totais do IBS/CBS. */
  IBSCBSTot?: IBSCBSTot;
  /** Valor total da NF considerando IBS, CBS e IS por fora. */
  vNFTot?: string;
}

/** Totais do ICMS. */
export interface ICMSTot {
  /** Base de cálculo do ICMS. */
  vBC: string;
  /** Total do ICMS. */
  vICMS: string;
  /** Total do ICMS desonerado. */
  vICMSDeson: string;
  /** Total do FCP UF destino. */
  vFCPUFDest?: string;
  /** Total do ICMS UF destino. */
  vICMSUFDest?: string;
  /** Total do ICMS UF remetente. */
  vICMSUFRemet?: string;
  /** Total do FCP. */
  vFCP: string;
  /** BC do ICMS ST. */
  vBCST: string;
  /** Total do ICMS ST. */
  vST: string;
  /** Total do FCP ST. */
  vFCPST: string;
  /** Total do FCP ST retido. */
  vFCPSTRet: string;
  /** Quantidade do ICMS monofásico. */
  qBCMono?: string;
  /** Valor do ICMS monofásico. */
  vICMSMono?: string;
  /** Quantidade sujeita à retenção. */
  qBCMonoReten?: string;
  /** Valor sujeito à retenção. */
  vICMSMonoReten?: string;
  /** Quantidade retida. */
  qBCMonoRet?: string;
  /** Valor retido. */
  vICMSMonoRet?: string;
  /** Total dos produtos. */
  vProd: string;
  /** Total do frete. */
  vFrete: string;
  /** Total do seguro. */
  vSeg: string;
  /** Total do desconto. */
  vDesc: string;
  /** Total do II. */
  vII: string;
  /** Total do IPI. */
  vIPI: string;
  /** Total do IPI devolvido. */
  vIPIDevol: string;
  /** Total do PIS. */
  vPIS: string;
  /** Total do COFINS. */
  vCOFINS: string;
  /** Outras despesas. */
  vOutro: string;
  /** Valor total da NF-e. */
  vNF: string;
  /** Total estimado de tributos. */
  vTotTrib?: string;
}

/** Totais do ISSQN. */
export interface ISSQNtot {
  /** Valor dos serviços. */
  vServ?: string;
  /** Base de cálculo. */
  vBC?: string;
  /** Valor do ISS. */
  vISS?: string;
  /** Valor do PIS. */
  vPIS?: string;
  /** Valor do COFINS. */
  vCOFINS?: string;
  /** Data de competência. */
  dCompet: string;
  /** Deduções. */
  vDeducao?: string;
  /** Outras retenções. */
  vOutro?: string;
  /** Desconto incondicional. */
  vDescIncond?: string;
  /** Desconto condicional. */
  vDescCond?: string;
  /** ISS retido. */
  vISSRet?: string;
  /** Regime especial: `1` a `6`. */
  cRegTrib?: string;
}

/** Tributos retidos. */
export interface RetTrib {
  /** PIS retido. */
  vRetPIS?: string;
  /** COFINS retido. */
  vRetCOFINS?: string;
  /** CSLL retida. */
  vRetCSLL?: string;
  /** BC do IRRF. */
  vBCIRRF?: string;
  /** IRRF. */
  vIRRF?: string;
  /** BC da contribuição previdenciária. */
  vBCRetPrev?: string;
  /** Contribuição previdenciária retida. */
  vRetPrev?: string;
}

/** Totais do Imposto Seletivo. */
export interface ISTot {
  /** Valor total do IS. */
  vIS: string;
}

/** Totais do IBS/CBS. */
export interface IBSCBSTot {
  /** BC do IBS/CBS. */
  vBCIBSCBS: string;
  /** Totalização do IBS. */
  gIBS?: IBSCBSTotGIBS;
  /** Totalização da CBS. */
  gCBS?: IBSCBSTotGCBS;
  /** Totalização da monofasia. */
  gMono?: IBSCBSTotGMono;
  /** Estorno de crédito. */
  gEstornoCred?: TotGEstornoCred;
}

/** Total do estorno de crédito. */
export interface TotGEstornoCred {
  /** Total do IBS estornado. */
  vIBSEstCred: string;
  /** Total da CBS estornada. */
  vCBSEstCred: string;
}

/** Totalização do IBS. */
export interface IBSCBSTotGIBS {
  /** IBS UF. */
  gIBSUF?: IBSCBSTotGIBSUF;
  /** IBS Município. */
  gIBSMun?: IBSCBSTotGIBSMun;
  /** Total do IBS. */
  vIBS: string;
  /** Total do crédito presumido. */
  vCredPres: string;
  /** Total do crédito presumido condição suspensiva. */
  vCredPresCondSus: string;
}

/** Totalização do IBS da UF. */
export interface IBSCBSTotGIBSUF {
  /** Total do diferimento. */
  vDif: string;
  /** Total de devoluções. */
  vDevTrib: string;
  /** Total do IBS UF. */
  vIBSUF: string;
}

/** Totalização do IBS do Município. */
export interface IBSCBSTotGIBSMun {
  /** Total do diferimento. */
  vDif: string;
  /** Total de devoluções. */
  vDevTrib: string;
  /** Total do IBS Municipal. */
  vIBSMun: string;
}

/** Totalização da CBS. */
export interface IBSCBSTotGCBS {
  /** Total do diferimento. */
  vDif: string;
  /** Total de devoluções. */
  vDevTrib: string;
  /** Total da CBS. */
  vCBS: string;
  /** Total do crédito presumido. */
  vCredPres: string;
  /** Total do crédito presumido condição suspensiva. */
  vCredPresCondSus: string;
}

/** Totalização da monofasia. */
export interface IBSCBSTotGMono {
  /** Total do IBS monofásico. */
  vIBSMono: string;
  /** Total da CBS monofásica. */
  vCBSMono: string;
  /** Total do IBS sujeito à retenção. */
  vIBSMonoReten: string;
  /** Total da CBS sujeita à retenção. */
  vCBSMonoReten: string;
  /** Total do IBS retido. */
  vIBSMonoRet: string;
  /** Total da CBS retida. */
  vCBSMonoRet: string;
}

// ============================================================================
// TRANSPORTE
// ============================================================================

/** Informações do transporte. */
export interface Transp {
  /** Modalidade do frete: `0` CIF, `1` FOB, `2` terceiros, `3` próprio remetente, `4` próprio destinatário, `9` sem transporte. */
  modFrete: number;
  /** Dados do transportador. */
  transporta?: Transporta;
  /** Retenção de ICMS sobre transporte. */
  retTransp?: TNFeInfNFeTranspRetTransp;
  /** Veículo de transporte. */
  veicTransp?: TVeiculo;
  /** Reboque. */
  reboque?: TVeiculo;
  /** Identificação do vagão. */
  vagao?: string;
  /** Identificação da balsa. */
  balsa?: string;
  /** Volumes transportados. */
  vol?: Vol[];
}

/** Dados do transportador. */
export interface Transporta {
  /** CNPJ do transportador. */
  CNPJ?: string;
  /** CPF do transportador. */
  CPF?: string;
  /** Razão social ou nome. */
  xNome?: string;
  /** Inscrição Estadual. */
  IE?: string;
  /** Endereço completo. */
  xEnder?: string;
  /** Nome do município. */
  xMun?: string;
  /** Sigla da UF. */
  UF?: string;
}

/** Retenção de ICMS sobre transporte. */
export interface TNFeInfNFeTranspRetTransp {
  /** Valor do serviço. */
  vServ: string;
  /** BC da retenção. */
  vBCRet: string;
  /** Alíquota da retenção. */
  pICMSRet: string;
  /** Valor do ICMS retido. */
  vICMSRet: string;
  /** CFOP. */
  CFOP: string;
  /** Código do município do fato gerador. */
  cMunFG: string;
}

/** Veículo. */
export interface TVeiculo {
  /** Placa do veículo. */
  placa: string;
  /** UF do veículo. */
  UF?: string;
  /** Registro Nacional de Transportador de Carga (ANTT). */
  RNTC?: string;
}

/** Volumes transportados. */
export interface Vol {
  /** Quantidade de volumes. */
  qVol?: string;
  /** Espécie. */
  esp?: string;
  /** Marca. */
  marca?: string;
  /** Numeração. */
  nVol?: string;
  /** Peso líquido (kg). */
  pesoL?: string;
  /** Peso bruto (kg). */
  pesoB?: string;
  /** Lacres. */
  lacres?: TNFeInfNFeTranspVolLacres[];
}

/** Lacre. */
export interface TNFeInfNFeTranspVolLacres {
  /** Número do lacre. */
  nLacre: string;
}

// ============================================================================
// COBRANÇA
// ============================================================================

/** Dados de cobrança. */
export interface Cobr {
  /** Fatura. */
  fat?: Fat;
  /** Duplicatas. */
  dup?: Dup[];
}

/** Fatura. */
export interface Fat {
  /** Número da fatura. */
  nFat?: string;
  /** Valor original. */
  vOrig?: string;
  /** Desconto. */
  vDesc?: string;
  /** Valor líquido. */
  vLiq?: string;
}

/** Duplicata. */
export interface Dup {
  /** Número da duplicata. */
  nDup?: string;
  /** Data de vencimento (`AAAA-MM-DD`). */
  dVenc?: string;
  /** Valor da duplicata. */
  vDup?: string;
}

// ============================================================================
// PAGAMENTO
// ============================================================================

/** Informações de pagamento. */
export interface Pag {
  /** Detalhamento dos pagamentos. */
  detPag: DetPag[];
  /** Troco. */
  vTroco?: string;
}

/** Detalhamento de um pagamento. */
export interface DetPag {
  /** Indicador: `0` à vista, `1` a prazo. */
  indPag?: string;
  /** Código da forma de pagamento (`01` a `99`). */
  tPag: string;
  /** Descrição do meio de pagamento. */
  xPag?: string;
  /** Valor do pagamento. */
  vPag?: string;
  /** Informações de cartão. */
  card?: DetPagCard;
}

/** Informações de cartão. */
export interface DetPagCard {
  /** Tipo de integração: `1` integrado, `2` não integrado. */
  tpIntegra: string;
  /** CNPJ da instituição de pagamento. */
  CNPJ?: string;
  /** Bandeira da operadora (`01` a `99`). */
  tBand?: string;
  /** Número de autorização. */
  cAut?: string;
}

// ============================================================================
// INFORMAÇÕES ADICIONAIS / INTERMEDIADOR / RESP. TÉCNICO
// ============================================================================

/** Informações adicionais. */
export interface InfAdic {
  /** Informações de interesse do Fisco. */
  infAdFisco?: string;
  /** Informações complementares de interesse do contribuinte. */
  infCpl?: string;
  /** Campos de uso livre do contribuinte (até 10). */
  obsCont?: TNFeInfNFeInfAdicObsCont[];
  /** Campos de uso livre do Fisco. */
  obsFisco?: TNFeInfNFeInfAdicObsFisco[];
  /** Processos referenciados. */
  procRef?: TNFeInfNFeInfAdicProcRef[];
}

/** Campo de uso livre do contribuinte. */
export interface TNFeInfNFeInfAdicObsCont {
  /** Identificação do campo. */
  xCampo: string;
  /** Conteúdo do campo. */
  xTexto: string;
}

/** Campo de uso livre do Fisco. */
export interface TNFeInfNFeInfAdicObsFisco {
  /** Identificação do campo. */
  xCampo: string;
  /** Conteúdo do campo. */
  xTexto: string;
}

/** Processo referenciado. */
export interface TNFeInfNFeInfAdicProcRef {
  /** Identificador do processo. */
  nProc: string;
  /** Origem: `0` SEFAZ, `1` Justiça Federal, `2` Justiça Estadual, `3` Secex/RFB, `9` outros. */
  indProc: string;
}

/** Informações do intermediador (marketplace). */
export interface InfIntermed {
  /** CNPJ do intermediador. */
  CNPJ: string;
  /** Identificador do vendedor no site do intermediador. */
  idCadIntTran: string;
}

/** Responsável técnico pela emissão. */
export interface InfRespTec {
  /** CNPJ da empresa responsável técnica. */
  CNPJ: string;
  /** Nome do contato. */
  xContato: string;
  /** E-mail do contato. */
  email: string;
  /** Telefone. */
  fone: string;
  /** Identificador do CSRT. */
  idCSRT?: string;
  /** Hash do CSRT. */
  hashCSRT?: string;
}

/** Solicitação de emissão da NFF. */
export interface InfSolicNFF {
  /** Descrição da solicitação. */
  xSolic: string;
}

// ============================================================================
// EXPORTAÇÃO / COMPRA / CANA
// ============================================================================

/** Informações de exportação. */
export interface Exporta {
  /** UF de embarque ou transposição de fronteira (`99` exterior). */
  UFSaidaPais: string;
  /** Local de embarque. */
  xLocExporta: string;
  /** Local de despacho. */
  xLocDespacho?: string;
}

/** Informações de compras. */
export interface Compra {
  /** Nota de Empenho. */
  xNEmp?: string;
  /** Pedido. */
  xPed?: string;
  /** Contrato. */
  xCont?: string;
}

/** Informações de aquisição de cana. */
export interface Cana {
  /** Identificação da safra. */
  safra: string;
  /** Mês e ano de referência (MM/AAAA). */
  ref: string;
  /** Fornecimento diário. */
  forDia: ForDia[];
  /** Quantidade total do mês. */
  qTotMes: string;
  /** Quantidade total anterior. */
  qTotAnt: string;
  /** Quantidade total geral. */
  qTotGer: string;
  /** Deduções. */
  deduc?: Deduc[];
  /** Valor dos fornecimentos. */
  vFor: string;
  /** Valor total das deduções. */
  vTotDed: string;
  /** Valor líquido dos fornecimentos. */
  vLiqFor: string;
}

/** Fornecimento diário de cana. */
export interface ForDia {
  /** Dia (atributo `@dia`). */
  '@dia': string;
  /** Quantidade em kg. */
  qtde: string;
}

/** Deduções - taxas e contribuições. */
export interface Deduc {
  /** Descrição da dedução. */
  xDed: string;
  /** Valor da dedução. */
  vDed: string;
}

// ============================================================================
// AGROPECUÁRIO / PAA / OBSITEM / DFeReferenciado
// ============================================================================

/** Informações de produtos da agricultura, pecuária e produção florestal. */
export interface NFeAgropecuario {
  /** Defensivos agrícolas. */
  defensivo?: AgropecuarioDefensivo;
  /** Guia de trânsito. */
  guiaTransito?: AgropecuarioGuiaTransito;
}

/** Guia de trânsito. */
export interface AgropecuarioGuiaTransito {
  /** Tipo: `1` GTA, `2` TTA, `3` DTA, `4` ATV, `5` PTV, `6` GTV, `7` DOF. */
  tpGuia: string;
  /** UF de emissão. */
  UFGuia: string;
  /** Série. */
  serieGuia: string;
  /** Número. */
  nGuia: string;
}

/** Defensivos agrícolas. */
export interface AgropecuarioDefensivo {
  /** Número da receita. */
  nReceituario: string;
  /** CPF do responsável técnico. */
  CPFRespTec: string;
}

/** Provedor de Assinatura e Autorização. */
export interface InfPAA {
  /** CNPJ do PAA. */
  CNPJPAA: string;
  /** Assinatura RSA. */
  PAASignature: PAASignature;
}

/** Assinatura RSA do emitente para DFe gerados por PAA. */
export interface PAASignature {
  /** Assinatura RSA em base64. */
  SignatureValue: string;
  /** Chave pública RSA. */
  RSAKeyValue: SAKeyValueType;
}

/** Chave pública RSA. */
export interface SAKeyValueType {
  /** Módulo da chave pública. */
  Modulus: string;
  /** Expoente da chave pública. */
  Exponent: string;
}

/** Observações de uso livre para o item. */
export interface ObsItem {
  /** Observação do contribuinte. */
  obsCont: ObsItemObsCont;
}

/** Observação de uso livre do contribuinte. */
export interface ObsItemObsCont {
  /** Identificação do campo. */
  xCampo: string;
  /** Conteúdo do campo. */
  xTexto: string;
}

/** Documento Fiscal Eletrônico referenciado. */
export interface DFeReferenciado {
  /** Chave de acesso do DF-e referenciado. */
  chaveAcesso: string;
  /** Número do item do documento referenciado. */
  nItem?: string;
}

/** Informações suplementares (NFC-e). */
export interface InfNFeSupl {
  /** Texto do QR-Code do DANFE NFC-e. */
  qrCode: string;
  /** URL de consulta por chave de acesso. */
  urlChave: string;
}

// ============================================================================
// RETORNO SEFAZ
// ============================================================================

/** Resultado do envio/consulta à SEFAZ. */
export interface RetornoSefaz {
  /** Indica se o processamento foi bem-sucedido. */
  sucesso: boolean;
  /** Código de status (ex.: `100` autorizado). */
  status: number;
  /** Descrição textual do status. */
  motivo: string;
  /** XML completo do retorno. */
  xml: string;
}
