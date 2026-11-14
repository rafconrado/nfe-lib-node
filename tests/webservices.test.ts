import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CODIGOS_UF,
  CODIGO_ORGAO_AMBIENTE_NACIONAL,
  getAutorizadorPorUF,
  getCodigoUF,
  getUrlAmbienteNacional,
  getUrlSefaz,
  normalizarUF,
  type SiglaUF,
} from '../dist/index.js';

describe('webservices (Mapeamento UF, Contingência e Ambiente Nacional)', () => {
  it('deve resolver códigos IBGE e URLs de todos os 27 estados em produção e homologação', () => {
    const ufs = Object.keys(CODIGOS_UF) as SiglaUF[];
    assert.equal(ufs.length, 27);

    for (const uf of ufs) {
      const codigo = getCodigoUF(uf);
      assert.match(codigo, /^\d{2}$/);

      const urlStatusHom = getUrlSefaz(uf, 'homologacao', 'status');
      const urlAutProd = getUrlSefaz(uf, 'producao', 'autorizacao');
      const urlCont = getUrlSefaz(uf, 'homologacao', 'autorizacao', true);

      assert.match(urlStatusHom, /^https:\/\//);
      assert.match(urlAutProd, /^https:\/\//);
      assert.match(urlCont, /^https:\/\//);
    }
  });

  it('deve mapear corretamente autorizadores próprios, SVRS, SVAN e contingência SVC-AN/SVC-RS', () => {
    assert.equal(getAutorizadorPorUF('SP'), 'SP');
    assert.equal(getAutorizadorPorUF('DF'), 'SVRS');
    assert.equal(getAutorizadorPorUF('MA'), 'SVAN');
    assert.equal(getAutorizadorPorUF('SP', true), 'SVC-AN');
    assert.equal(getAutorizadorPorUF('PR', true), 'SVC-RS');
  });

  it('deve resolver as URLs do Ambiente Nacional (AN - cOrgao 91)', () => {
    assert.equal(CODIGO_ORGAO_AMBIENTE_NACIONAL, '91');
    assert.match(
      getUrlAmbienteNacional('homologacao', 'recepcaoEvento'),
      /hom1\.nfe\.fazenda\.gov\.br\/NFeRecepcaoEvento4/
    );
    assert.match(
      getUrlAmbienteNacional('producao', 'distribuicaoDFe'),
      /www1\.nfe\.fazenda\.gov\.br\/NFeDistribuicaoDFe/
    );
  });

  it('deve lançar erro para sigla de UF inexistente', () => {
    assert.throws(() => normalizarUF('XX'), /UF inválida/);
  });
});
