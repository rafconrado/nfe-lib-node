import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Assinador, Danfe } from '../dist/index.js';
import { criarCertificadoTeste } from './helpers.ts';

describe('Certificado, Assinador (XMLDSig) e Danfe (PDF)', () => {
  const cert = criarCertificadoTeste();
  const assinador = new Assinador(cert);

  it('deve extrair PEM, metadados ICP-Brasil e validade do Certificado A1', () => {
    const pem = cert.getPem();
    assert.match(pem.privateKey, /BEGIN RSA PRIVATE KEY|BEGIN PRIVATE KEY/);
    assert.match(pem.certificate, /BEGIN CERTIFICATE/);

    const dados = cert.getDados();
    assert.equal(dados.nomeComum, 'EMPRESA TESTE LTDA:11222333000181');
    assert.equal(dados.cnpjOuCpf, '11222333000181');
    assert.equal(dados.estaValido, true);
    assert.equal(cert.estaValido(), true);
    assert.ok(dados.diasParaVencer >= 29);
  });

  it('deve assinar XML de NF-e, Evento e Inutilização no padrão SEFAZ', () => {
    const xmlNFe =
      '<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe53260999999999999999550010000000011847291634" versao="4.00"><ide><cUF>53</cUF></ide></infNFe></NFe>';
    const nfeAssinada = assinador.assinarXmlNFe(xmlNFe);
    assert.match(nfeAssinada, /<Signature xmlns="http:\/\/www\.w3\.org\/2000\/09\/xmldsig#">/);
    assert.match(nfeAssinada, /URI="#NFe53260999999999999999550010000000011847291634"/);

    const xmlEvento =
      '<evento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00"><infEvento Id="ID2102105326099999999999999955001000000001184729163401"><cOrgao>91</cOrgao></infEvento></evento>';
    const eventoAssinado = assinador.assinarXmlEvento(xmlEvento);
    assert.match(eventoAssinado, /URI="#ID2102105326099999999999999955001000000001184729163401"/);

    const xmlInut =
      '<inutNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><infInut Id="ID53261122233300018155001000000001000000001"><xServ>INUTILIZAR</xServ></infInut></inutNFe>';
    const inutAssinada = assinador.assinarXmlInutilizacao(xmlInut);
    assert.match(inutAssinada, /URI="#ID53261122233300018155001000000001000000001"/);
  });

  it('deve gerar um PDF válido do DANFE a partir do XML da NF-e (incluindo duplicatas e múltiplas páginas)', () => {
    const itensXml = Array.from({ length: 25 }, (_, i) => `<det nItem="${i + 1}"><prod><cProd>${i + 1}</cProd><xProd>PRODUTO TESTE ${i + 1}</xProd><NCM>94039000</NCM><CFOP>5102</CFOP><uCom>UN</uCom><qCom>1.0000</qCom><vUnCom>10.00</vUnCom><vProd>10.00</vProd></prod><imposto><ICMS><ICMSSN102><orig>0</orig><CSOSN>102</CSOSN></ICMSSN102></ICMS></imposto></det>`).join('');
    const xmlNFe = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe53260999999999999999550010000000011847291634" versao="4.00"><ide><nNF>1</nNF><serie>1</serie><dhEmi>2026-11-14T08:00:00-03:00</dhEmi><tpNF>1</tpNF><natOp>VENDA</natOp></ide><emit><CNPJ>11222333000181</CNPJ><xNome>EMITENTE LTDA</xNome><IE>123456</IE><enderEmit><xLgr>Rua A</xLgr><nro>10</nro><xBairro>Centro</xBairro><xMun>Brasilia</xMun><UF>DF</UF><CEP>70000000</CEP></enderEmit></emit><dest><CNPJ>99888777000166</CNPJ><xNome>DESTINATARIO LTDA</xNome><enderDest><xLgr>Rua B</xLgr><nro>20</nro><xBairro>Sul</xBairro><xMun>Brasilia</xMun><UF>DF</UF><CEP>70000000</CEP></enderDest></dest>${itensXml}<total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vBCST>0.00</vBCST><vST>0.00</vST><vProd>250.00</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vIPI>0.00</vIPI><vOutro>0.00</vOutro><vNF>250.00</vNF></ICMSTot></total><transp><modFrete>0</modFrete><veicTransp><placa>ABC1D23</placa><UF>DF</UF><RNTC>12345678</RNTC></veicTransp></transp><cobr><fat><nFat>001</nFat><vLiq>250.00</vLiq></fat><dup><nDup>001</nDup><dVenc>2026-12-15</dVenc><vDup>250.00</vDup></dup></cobr></infNFe></NFe>`;
    const pdf = Danfe.fromXml(xmlNFe);
    assert.ok(Buffer.isBuffer(pdf));
    const pdfStr = pdf.toString('latin1');
    assert.ok(pdfStr.startsWith('%PDF-1.4'));
    assert.match(pdfStr, /\/Count 2/);
    assert.match(pdfStr, /Folha 1\/2/);
    assert.match(pdfStr, /Folha 2\/2/);
    assert.match(pdfStr, /EMITENTE LTDA/);
    assert.match(pdfStr, /PRODUTO TESTE 25/);
    assert.match(pdfStr, /ABC1D23/);
    assert.match(pdfStr, /15\/12\/2026/);
  });
});
