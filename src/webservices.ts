export type AmbienteSefaz = 'producao' | 'homologacao';

export type SiglaUF =
  | 'AC'
  | 'AL'
  | 'AM'
  | 'AP'
  | 'BA'
  | 'CE'
  | 'DF'
  | 'ES'
  | 'GO'
  | 'MA'
  | 'MG'
  | 'MS'
  | 'MT'
  | 'PA'
  | 'PB'
  | 'PE'
  | 'PI'
  | 'PR'
  | 'RJ'
  | 'RN'
  | 'RO'
  | 'RR'
  | 'RS'
  | 'SC'
  | 'SE'
  | 'SP'
  | 'TO';

export type AutorizadorSefaz =
  | 'AM'
  | 'BA'
  | 'GO'
  | 'MG'
  | 'MS'
  | 'MT'
  | 'PE'
  | 'PR'
  | 'RS'
  | 'SP'
  | 'SVAN'
  | 'SVRS'
  | 'SVC-AN'
  | 'SVC-RS';

export type ServicoSefaz =
  | 'status'
  | 'autorizacao'
  | 'retAutorizacao'
  | 'consultaProtocolo'
  | 'inutilizacao'
  | 'recepcaoEvento';

export type ServicoAmbienteNacional = 'recepcaoEvento' | 'distribuicaoDFe';

export type MapaServicosSefaz = Record<ServicoSefaz, string>;
export type MapaServicosAmbienteNacional = Record<ServicoAmbienteNacional, string>;

export const CODIGO_ORGAO_AMBIENTE_NACIONAL = '91';

export const URLS_AMBIENTE_NACIONAL: Record<AmbienteSefaz, MapaServicosAmbienteNacional> = {
  producao: {
    recepcaoEvento: 'https://www.nfe.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    distribuicaoDFe: 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
  },
  homologacao: {
    recepcaoEvento: 'https://hom1.nfe.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    distribuicaoDFe: 'https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx',
  },
};

export const CODIGOS_UF: Record<SiglaUF, string> = {
  AC: '12',
  AL: '27',
  AM: '13',
  AP: '16',
  BA: '29',
  CE: '23',
  DF: '53',
  ES: '32',
  GO: '52',
  MA: '21',
  MG: '31',
  MS: '50',
  MT: '51',
  PA: '15',
  PB: '25',
  PE: '26',
  PI: '22',
  PR: '41',
  RJ: '33',
  RN: '24',
  RO: '11',
  RR: '14',
  RS: '43',
  SC: '42',
  SE: '28',
  SP: '35',
  TO: '17',
};

export const AUTORIZADOR_POR_UF: Record<SiglaUF, AutorizadorSefaz> = {
  AC: 'SVRS',
  AL: 'SVRS',
  AM: 'AM',
  AP: 'SVRS',
  BA: 'BA',
  CE: 'SVRS',
  DF: 'SVRS',
  ES: 'SVRS',
  GO: 'GO',
  MA: 'SVAN',
  MG: 'MG',
  MS: 'MS',
  MT: 'MT',
  PA: 'SVRS',
  PB: 'SVRS',
  PE: 'PE',
  PI: 'SVRS',
  PR: 'PR',
  RJ: 'SVRS',
  RN: 'SVRS',
  RO: 'SVRS',
  RR: 'SVRS',
  RS: 'RS',
  SC: 'SVRS',
  SE: 'SVRS',
  SP: 'SP',
  TO: 'SVRS',
};

export const AUTORIZADOR_CONTINGENCIA_POR_UF: Record<SiglaUF, 'SVC-AN' | 'SVC-RS'> = {
  AC: 'SVC-AN',
  AL: 'SVC-AN',
  AM: 'SVC-RS',
  AP: 'SVC-AN',
  BA: 'SVC-RS',
  CE: 'SVC-AN',
  DF: 'SVC-AN',
  ES: 'SVC-AN',
  GO: 'SVC-RS',
  MA: 'SVC-RS',
  MG: 'SVC-AN',
  MS: 'SVC-RS',
  MT: 'SVC-RS',
  PA: 'SVC-AN',
  PB: 'SVC-AN',
  PE: 'SVC-RS',
  PI: 'SVC-AN',
  PR: 'SVC-RS',
  RJ: 'SVC-AN',
  RN: 'SVC-AN',
  RO: 'SVC-AN',
  RR: 'SVC-AN',
  RS: 'SVC-AN',
  SC: 'SVC-AN',
  SE: 'SVC-AN',
  SP: 'SVC-AN',
  TO: 'SVC-AN',
};

export const URLS_SEFAZ: Record<AutorizadorSefaz, Record<AmbienteSefaz, MapaServicosSefaz>> = {
  AM: {
    producao: {
      status: 'https://nfe.sefaz.am.gov.br/services2/services/NfeStatusServico4',
      autorizacao: 'https://nfe.sefaz.am.gov.br/services2/services/NfeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.am.gov.br/services2/services/NfeRetAutorizacao4',
      consultaProtocolo: 'https://nfe.sefaz.am.gov.br/services2/services/NfeConsulta4',
      inutilizacao: 'https://nfe.sefaz.am.gov.br/services2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.am.gov.br/services2/services/RecepcaoEvento4',
    },
    homologacao: {
      status: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeStatusServico4',
      autorizacao: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeAutorizacao4',
      retAutorizacao: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeRetAutorizacao4',
      consultaProtocolo: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeConsulta4',
      inutilizacao: 'https://homnfe.sefaz.am.gov.br/services2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://homnfe.sefaz.am.gov.br/services2/services/RecepcaoEvento4',
    },
  },
  BA: {
    producao: {
      status: 'https://nfe.sefaz.ba.gov.br/webservices/NFeStatusServico4/NFeStatusServico4.asmx',
      autorizacao: 'https://nfe.sefaz.ba.gov.br/webservices/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.sefaz.ba.gov.br/webservices/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://nfe.sefaz.ba.gov.br/webservices/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://nfe.sefaz.ba.gov.br/webservices/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.sefaz.ba.gov.br/webservices/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
    homologacao: {
      status: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeStatusServico4/NFeStatusServico4.asmx',
      autorizacao: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://hnfe.sefaz.ba.gov.br/webservices/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
  },
  GO: {
    producao: {
      status: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeStatusServico4',
      autorizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeRetAutorizacao4',
      consultaProtocolo: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeRecepcaoEvento4',
    },
    homologacao: {
      status: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeStatusServico4',
      autorizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeAutorizacao4',
      retAutorizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeRetAutorizacao4',
      consultaProtocolo: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeInutilizacao4',
      recepcaoEvento: 'https://homolog.sefaz.go.gov.br/nfe/services/NFeRecepcaoEvento4',
    },
  },
  MG: {
    producao: {
      status: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4',
      autorizacao: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4',
      consultaProtocolo: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4',
    },
    homologacao: {
      status: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeStatusServico4',
      autorizacao: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeAutorizacao4',
      retAutorizacao: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRetAutorizacao4',
      consultaProtocolo: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeInutilizacao4',
      recepcaoEvento: 'https://hnfe.fazenda.mg.gov.br/nfe2/services/NFeRecepcaoEvento4',
    },
  },
  MS: {
    producao: {
      status: 'https://nfe.sefaz.ms.gov.br/ws/NFeStatusServico4',
      autorizacao: 'https://nfe.sefaz.ms.gov.br/ws/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.ms.gov.br/ws/NFeRetAutorizacao4',
      consultaProtocolo: 'https://nfe.sefaz.ms.gov.br/ws/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefaz.ms.gov.br/ws/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.ms.gov.br/ws/NFeRecepcaoEvento4',
    },
    homologacao: {
      status: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeStatusServico4',
      autorizacao: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeAutorizacao4',
      retAutorizacao: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeRetAutorizacao4',
      consultaProtocolo: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeConsultaProtocolo4',
      inutilizacao: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeInutilizacao4',
      recepcaoEvento: 'https://hom.nfe.sefaz.ms.gov.br/ws/NFeRecepcaoEvento4',
    },
  },
  MT: {
    producao: {
      status: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeStatusServico4',
      autorizacao: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeRetAutorizacao4',
      consultaProtocolo: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeConsulta4',
      inutilizacao: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.mt.gov.br/nfews/v2/services/RecepcaoEvento4',
    },
    homologacao: {
      status: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeStatusServico4',
      autorizacao: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeAutorizacao4',
      retAutorizacao: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeRetAutorizacao4',
      consultaProtocolo: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeConsulta4',
      inutilizacao: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/NfeInutilizacao4',
      recepcaoEvento: 'https://homologacao.sefaz.mt.gov.br/nfews/v2/services/RecepcaoEvento4',
    },
  },
  PE: {
    producao: {
      status: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeStatusServico4',
      autorizacao: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeRetAutorizacao4',
      consultaProtocolo: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeRecepcaoEvento4',
    },
    homologacao: {
      status: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeStatusServico4',
      autorizacao: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeAutorizacao4',
      retAutorizacao: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeRetAutorizacao4',
      consultaProtocolo: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeInutilizacao4',
      recepcaoEvento: 'https://nfehomolog.sefaz.pe.gov.br/nfe-service/services/NFeRecepcaoEvento4',
    },
  },
  PR: {
    producao: {
      status: 'https://nfe.sefa.pr.gov.br/nfe/NFeStatusServico4',
      autorizacao: 'https://nfe.sefa.pr.gov.br/nfe/NFeAutorizacao4',
      retAutorizacao: 'https://nfe.sefa.pr.gov.br/nfe/NFeRetAutorizacao4',
      consultaProtocolo: 'https://nfe.sefa.pr.gov.br/nfe/NFeConsultaProtocolo4',
      inutilizacao: 'https://nfe.sefa.pr.gov.br/nfe/NFeInutilizacao4',
      recepcaoEvento: 'https://nfe.sefa.pr.gov.br/nfe/NFeRecepcaoEvento4',
    },
    homologacao: {
      status: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeStatusServico4',
      autorizacao: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeAutorizacao4',
      retAutorizacao: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeRetAutorizacao4',
      consultaProtocolo: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeConsultaProtocolo4',
      inutilizacao: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeInutilizacao4',
      recepcaoEvento: 'https://homologacao.nfe.sefa.pr.gov.br/nfe/NFeRecepcaoEvento4',
    },
  },
  RS: {
    producao: {
      status: 'https://nfe.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      autorizacao: 'https://nfe.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://nfe.sefazrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe.sefazrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.sefazrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    homologacao: {
      status: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      autorizacao: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
  SP: {
    producao: {
      status: 'https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
      autorizacao: 'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
      retAutorizacao: 'https://nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx',
      consultaProtocolo: 'https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx',
      inutilizacao: 'https://nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx',
    },
    homologacao: {
      status: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
      autorizacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
      retAutorizacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx',
      consultaProtocolo: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx',
      inutilizacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx',
    },
  },
  SVAN: {
    producao: {
      status: 'https://www.sefazvirtual.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      autorizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://www.sefazvirtual.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://www.sefazvirtual.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://www.sefazvirtual.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
    homologacao: {
      status: 'https://hom.sefazvirtual.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      autorizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://hom.sefazvirtual.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://hom.sefazvirtual.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://hom.sefazvirtual.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
  },
  SVRS: {
    producao: {
      status: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      autorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    homologacao: {
      status: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      autorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
  'SVC-AN': {
    producao: {
      status: 'https://www.svc.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      autorizacao: 'https://www.svc.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://www.svc.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://www.svc.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://www.svc.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://www.svc.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
    homologacao: {
      status: 'https://hom.svc.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
      autorizacao: 'https://hom.svc.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://hom.svc.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://hom.svc.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      inutilizacao: 'https://hom.svc.fazenda.gov.br/NFeInutilizacao4/NFeInutilizacao4.asmx',
      recepcaoEvento: 'https://hom.svc.fazenda.gov.br/NFeRecepcaoEvento4/NFeRecepcaoEvento4.asmx',
    },
  },
  'SVC-RS': {
    producao: {
      status: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      autorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
    homologacao: {
      status: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
      autorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retAutorizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consultaProtocolo: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      inutilizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      recepcaoEvento: 'https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
    },
  },
};

export function normalizarUF(uf: string): SiglaUF {
  const sigla = uf.trim().toUpperCase() as SiglaUF;
  if (!(sigla in CODIGOS_UF)) {
    throw new Error(`UF inválida: "${uf}". Informe uma sigla válida (ex: SP, DF, MG, RS).`);
  }
  return sigla;
}

export function getCodigoUF(uf: string): string {
  const sigla = normalizarUF(uf);
  return CODIGOS_UF[sigla];
}

export function getAutorizadorPorUF(uf: string, contingencia = false): AutorizadorSefaz {
  const sigla = normalizarUF(uf);
  return contingencia ? AUTORIZADOR_CONTINGENCIA_POR_UF[sigla] : AUTORIZADOR_POR_UF[sigla];
}

export function getUrlSefaz(
  uf: string,
  ambiente: AmbienteSefaz,
  servico: ServicoSefaz,
  contingencia = false
): string {
  const autorizador = getAutorizadorPorUF(uf, contingencia);
  const url = URLS_SEFAZ[autorizador]?.[ambiente]?.[servico];
  if (!url) {
    throw new Error(`Serviço "${servico}" não encontrado para o autorizador ${autorizador} (${ambiente}).`);
  }
  return url;
}

export function getUrlAmbienteNacional(
  ambiente: AmbienteSefaz,
  servico: ServicoAmbienteNacional
): string {
  const url = URLS_AMBIENTE_NACIONAL[ambiente]?.[servico];
  if (!url) {
    throw new Error(`Serviço "${servico}" não encontrado para o Ambiente Nacional (${ambiente}).`);
  }
  return url;
}

export const obterCodigoUF = getCodigoUF;
export const obterAutorizadorPorUF = getAutorizadorPorUF;
export const obterUrlSefaz = getUrlSefaz;
export const obterUrlAmbienteNacional = getUrlAmbienteNacional;
