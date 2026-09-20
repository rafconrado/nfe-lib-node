/**
 * Tipagens básicas da Estrutura da NF-e.
 * O Schema completo da SEFAZ possui centenas de campos, portanto os nós folha
 * podem ser definidos conforme a necessidade do projeto ou utilizando bibliotecas de terceiros.
 */

export interface DadosNFe {
  infNFe: {
    /** Atributo Id da Nota (Ex: NFe532609...) */
    '@Id': string;
    /** Versão do layout (Ex: 4.00) */
    '@versao': string;
    /** Identificação da NF-e */
    ide: {
      cUF: string;
      cNF: string;
      natOp: string;
      mod: string;
      serie: string;
      nNF: string;
      dhEmi: string;
      tpNF: string;
      idDest: string;
      cMunFG: string;
      tpImp: string;
      tpEmis: string;
      cDV: string;
      tpAmb: string;
      finNFe: string;
      indFinal: string;
      indPres: string;
      procEmi: string;
      verProc: string;
      [key: string]: any;
    };
    /** Identificação do Emitente */
    emit: {
      CNPJ?: string;
      CPF?: string;
      xNome: string;
      enderEmit: any;
      IE: string;
      CRT: string;
      [key: string]: any;
    };
    /** Identificação do Destinatário */
    dest: {
      CNPJ?: string;
      CPF?: string;
      xNome: string;
      enderDest: any;
      indIEDest: string;
      IE?: string;
      [key: string]: any;
    };
    /** Detalhamento dos Produtos e Serviços */
    det: any | any[];
    /** Totais da NF-e */
    total: any;
    /** Informações do Transporte */
    transp: any;
    /** Informações de Pagamento */
    pag: any;
    /** Informações Adicionais (Opcional) */
    infAdic?: any;
    [key: string]: any;
  };
}

export interface RetornoSefaz {
  sucesso: boolean;
  xml: string;
}
