import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  gerarChaveAcesso,
  validarChaveAcesso,
  getDadosChaveAcesso,
  getDigitoVerificador,
  calcularDigitoVerificador,
  extrairDadosChaveAcesso,
} from '../dist/index.js';

describe('chaveAcesso (Módulo 11)', () => {
  it('deve gerar chave de acesso de 44 dígitos válida com CNPJ e extrair os dados corretamente', () => {
    const res = gerarChaveAcesso({
      uf: 'DF',
      dataEmissao: '2026-09-15T10:00:00-03:00',
      cnpjOuCpf: '11.222.333/0001-81',
      modelo: '55',
      serie: 1,
      numero: 42,
      tpEmis: '1',
      cNF: 84729163,
    });

    assert.equal(res.chave.length, 44);
    assert.equal(res.id, `NFe${res.chave}`);
    assert.equal(validarChaveAcesso(res.chave), true);
    assert.equal(validarChaveAcesso(res.id), true);

    const dados = getDadosChaveAcesso(res.id);
    assert.equal(dados.cUF, '53');
    assert.equal(dados.aamm, '2609');
    assert.equal(dados.ano, '2026');
    assert.equal(dados.mes, '09');
    assert.equal(dados.cnpj, '11222333000181');
    assert.equal(dados.modelo, '55');
    assert.equal(dados.serie, '001');
    assert.equal(dados.numero, '000000042');
    assert.equal(dados.tpEmis, '1');
    assert.equal(dados.cNF, '84729163');
    assert.equal(dados.cDV, res.cDV);
  });

  it('deve aceitar CPF de 11 dígitos preenchendo com zeros à esquerda para 14 posições', () => {
    const res = gerarChaveAcesso({
      uf: 'SP',
      dataEmissao: '2611',
      cnpjOuCpf: '123.456.789-01',
      modelo: '65',
      serie: 2,
      numero: 100,
      tpEmis: 9,
      cNF: '00012345',
    });

    assert.equal(res.chave.length, 44);
    assert.equal(validarChaveAcesso(res.chave), true);
    const dados = extrairDadosChaveAcesso(res.chave);
    assert.equal(dados.cUF, '35');
    assert.equal(dados.cnpj, '00012345678901');
    assert.equal(dados.modelo, '65');
  });

  it('deve manter compatibilidade dos aliases getDigitoVerificador e calcularDigitoVerificador', () => {
    const base43 = '5326099999999999999955001000000001184729163';
    const dv1 = getDigitoVerificador(base43);
    const dv2 = calcularDigitoVerificador(base43);
    assert.equal(dv1, '4');
    assert.equal(dv1, dv2);
  });

  it('deve rejeitar chaves inválidas ou adulteradas', () => {
    assert.equal(validarChaveAcesso('123'), false);
    assert.equal(validarChaveAcesso('53260999999999999999550010000000011847291638'), false);
    assert.equal(validarChaveAcesso('53260999999999999999550010000000011847291634'), true);

    assert.throws(() => getDigitoVerificador('12345'), /43 dígitos/);
  });
});
