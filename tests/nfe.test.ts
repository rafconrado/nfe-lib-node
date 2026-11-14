import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import {
  NFe,
  descompactarDocZip,
  gerarChaveAcesso,
  getUrlAmbienteNacional,
} from '../dist/index.js';
import { criarCertificadoTeste } from './helpers.ts';

describe('NFe (Operações SOAP, Eventos, Manifestação e Distribuição DF-e)', () => {
  const certificado = criarCertificadoTeste('DESTINATARIO TESTE LTDA:11222333000181');
  const { chave } = gerarChaveAcesso({
    uf: 'DF',
    dataEmissao: '2611',
    cnpjOuCpf: '99888777000166',
    modelo: '55',
    serie: 1,
    numero: 10,
    tpEmis: 1,
    cNF: '12345678',
  });

  it('deve consultar status, protocolo e recibo com validação dos parâmetros', async () => {
    const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });
    let ultimoXml = '';

    (nfe as unknown as { enviarSoap: (u: string, x: string) => Promise<unknown> }).enviarSoap =
      async (_url: string, xmlBody: string) => {
        ultimoXml = xmlBody;
        return { sucesso: true, status: 107, motivo: 'Servico em Operacao', xml: '<retConsStatServ><cStat>107</cStat></retConsStatServ>' };
      };

    const status = await nfe.consultarStatus();
    assert.equal(status.sucesso, true);
    assert.match(ultimoXml, /<xServ>STATUS<\/xServ>/);

    await nfe.consultarProtocolo(chave);
    assert.match(ultimoXml, new RegExp(`<chNFe>${chave}</chNFe>`));

    await nfe.consultarRecibo('531000000000001');
    assert.match(ultimoXml, /<nRec>531000000000001<\/nRec>/);

    await assert.rejects(() => nfe.consultarProtocolo('123'), /Chave de acesso inválida/);
    await assert.rejects(() => nfe.consultarRecibo('123'), /Número de recibo inválido/);
  });

  it('deve assinar e montar procEventoNFe para Cancelamento e Carta de Correção', async () => {
    const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });
    let ultimoXml = '';

    (nfe as unknown as { enviarSoap: (u: string, x: string) => Promise<unknown> }).enviarSoap =
      async (_url: string, xmlBody: string) => {
        ultimoXml = xmlBody;
        return {
          sucesso: true,
          status: 135,
          motivo: 'Evento registrado e vinculado a NF-e',
          xml: '<retEnvEvento versao="1.00"><retEvento versao="1.00"><infEvento><cStat>135</cStat></infEvento></retEvento></retEnvEvento>',
        };
      };

    const canc = await nfe.cancelar({
      chave,
      protocolo: '153260000000001',
      justificativa: 'Cancelamento por erro de preenchimento comercial.',
    });
    assert.match(ultimoXml, /<tpEvento>110111<\/tpEvento>/);
    assert.match(canc.xmlProcEvento ?? '', /<procEventoNFe/);

    const cce = await nfe.cartaCorrecao({
      chave,
      correcao: 'Alteracao na descricao complementar das volumes transportados.',
    });
    assert.match(ultimoXml, /<tpEvento>110110<\/tpEvento>/);
    assert.match(cce.xmlProcEvento ?? '', /<procEventoNFe/);
  });

  it('deve enviar Manifestação do Destinatário para o Ambiente Nacional (cOrgao 91) com CNPJ extraído do certificado', async () => {
    const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });
    let ultimoUrl = '';
    let ultimoXml = '';

    (nfe as unknown as { enviarSoap: (u: string, x: string) => Promise<unknown> }).enviarSoap =
      async (url: string, xmlBody: string) => {
        ultimoUrl = url;
        ultimoXml = xmlBody;
        return {
          sucesso: true,
          status: 135,
          motivo: 'Evento registrado e vinculado a NF-e',
          xml: '<retEnvEvento versao="1.00"><retEvento versao="1.00"><infEvento><cStat>135</cStat></infEvento></retEvento></retEnvEvento>',
        };
      };

    const ciencia = await nfe.manifestar({ chave, tipo: 'ciencia' });
    assert.equal(ultimoUrl, getUrlAmbienteNacional('homologacao', 'recepcaoEvento'));
    assert.match(ultimoXml, /<cOrgao>91<\/cOrgao>/);
    assert.match(ultimoXml, /<CNPJ>11222333000181<\/CNPJ>/);
    assert.match(ultimoXml, /<tpEvento>210210<\/tpEvento>/);
    assert.match(ultimoXml, /<descEvento>Ciencia da Operacao<\/descEvento>/);
    assert.match(ciencia.xmlProcEvento ?? '', /<procEventoNFe/);

    await nfe.manifestar({
      chave,
      tipo: 'nao_realizada',
      justificativa: 'Mercadoria recusada no ato da entrega por divergencia.',
    });
    assert.match(ultimoXml, /<tpEvento>210240<\/tpEvento>/);
    assert.match(ultimoXml, /<xJust>Mercadoria recusada no ato da entrega por divergencia\.<\/xJust>/);

    await assert.rejects(
      () => nfe.manifestar({ chave, tipo: 'nao_realizada', justificativa: 'curta' }),
      /entre 15 e 255 caracteres/
    );
  });

  it('deve consultar distribuicaoDFe e descompactar tags <docZip> automaticamente', async () => {
    const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });
    const xmlOriginal = '<resNFe versao="1.01"><chNFe>' + chave + '</chNFe><vNF>250.00</vNF></resNFe>';
    const zipB64 = gzipSync(Buffer.from(xmlOriginal, 'utf-8')).toString('base64');

    assert.equal(descompactarDocZip(zipB64), xmlOriginal);

    let ultimoXml = '';
    (nfe as unknown as { enviarSoap: (u: string, x: string) => Promise<unknown> }).enviarSoap =
      async (_url: string, xmlBody: string) => {
        ultimoXml = xmlBody;
        return {
          sucesso: true,
          status: 138,
          motivo: 'Documento localizado',
          xml: `<retDistDFeInt versao="1.01"><cStat>138</cStat><xMotivo>Documento localizado</xMotivo><ultNSU>000000000000007</ultNSU><maxNSU>000000000000010</maxNSU><loteDistDFeInt><docZip NSU="000000000000007" schema="resNFe_v1.01.xsd">${zipB64}</docZip></loteDistDFeInt></retDistDFeInt>`,
        };
      };

    const dist = await nfe.distribuicaoDFe({ ultimoNSU: 5 });
    assert.match(ultimoXml, /<ultNSU>000000000000005<\/ultNSU>/);
    assert.equal(dist.ultNSU, '000000000000007');
    assert.equal(dist.maxNSU, '000000000000010');
    assert.equal(dist.documentos.length, 1);
    assert.equal(dist.documentos[0]?.nsu, '000000000000007');
    assert.equal(dist.documentos[0]?.schema, 'resNFe_v1.01.xsd');
    assert.equal(dist.documentos[0]?.xml, xmlOriginal);

    await nfe.distribuicaoDFe({ nsu: 7 });
    assert.match(ultimoXml, /<consNSU><NSU>000000000000007<\/NSU><\/consNSU>/);

    await nfe.distribuicaoDFe({ chave });
    assert.match(ultimoXml, new RegExp(`<consChNFe><chNFe>${chave}</chNFe></consChNFe>`));

    await assert.rejects(
      () => nfe.distribuicaoDFe({ ultimoNSU: 0, nsu: 1 }),
      /apenas um modo de consulta/
    );
  });

  it('deve assinar e montar ProcInutNFe na inutilização de faixa de numeração', async () => {
    const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });
    let ultimoXml = '';

    (nfe as unknown as { enviarSoap: (u: string, x: string) => Promise<unknown> }).enviarSoap =
      async (_url: string, xmlBody: string) => {
        ultimoXml = xmlBody;
        return {
          sucesso: true,
          status: 102,
          motivo: 'Inutilizacao de numero homologado',
          xml: '<retInutNFe versao="4.00"><infInut><cStat>102</cStat><xMotivo>Inutilizacao de numero homologado</xMotivo></infInut></retInutNFe>',
        };
      };

    const inut = await nfe.inutilizar({
      cnpj: '11.222.333/0001-81',
      serie: 1,
      numeroInicial: 10,
      numeroFinal: 12,
      ano: 2026,
      justificativa: 'Quebra de sequencia na numeracao do sistema emissor.',
    });

    assert.equal(inut.sucesso, true);
    assert.match(ultimoXml, /Id="ID53261122233300018155001000000010000000012"/);
    assert.match(inut.xmlProcInut ?? '', /<ProcInutNFe/);
  });
});
