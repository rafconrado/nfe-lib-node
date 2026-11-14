import forge from 'node-forge';
import { Certificado } from '../dist/index.js';

export function criarCertificadoTeste(cn = 'EMPRESA TESTE LTDA:11222333000181'): Certificado {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 60_000);
  cert.validity.notAfter = new Date(Date.now() + 30 * 86_400_000);
  const attrs = [{ shortName: 'CN', value: cn }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], '1234');
  const pfxBuffer = Buffer.from(forge.asn1.toDer(p12Asn1).getBytes(), 'binary');
  return new Certificado(pfxBuffer, '1234');
}
