import https from 'https';
import forge from 'node-forge';

export class Certificado {
  public pfxBuffer: Buffer;
  public password?: string | undefined;

  constructor(pfxBuffer: Buffer, password?: string | undefined) {
    this.pfxBuffer = pfxBuffer;
    this.password = password;
  }

  /**
   * Retorna um https.Agent configurado com o certificado para autenticação mútua TLS (exigida pela SEFAZ).
   */
  public getHttpsAgent(): https.Agent {
    const { privateKey, certificate } = this.extractPemFromPfx();
    return new https.Agent({
      cert: certificate,
      key: privateKey,
      rejectUnauthorized: false, // Em ambientes de homologação da Sefaz, a cadeia pode ser inválida
    });
  }

  private extractPemFromPfx(): { privateKey: string; certificate: string } {
    const p12Asn1 = forge.asn1.fromDer(this.pfxBuffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.password ?? '');

    const certBagOid = forge.pki.oids.certBag as string;
    const certBags = p12.getBags({ bagType: certBagOid })[certBagOid] ?? [];
    const cert = this.getLeafCert(certBags);
    const certPem = cert ? forge.pki.certificateToPem(cert) : '';

    const keyBagOid = forge.pki.oids.pkcs8ShroudedKeyBag as string;
    const keyBags = p12.getBags({ bagType: keyBagOid })[keyBagOid] ?? [];
    const key = keyBags[0]?.key;
    const privateKeyPem = key ? forge.pki.privateKeyToPem(key) : '';

    if (!privateKeyPem || !certPem) {
      throw new Error('Não foi possível extrair a chave privada ou o certificado do PFX.');
    }

    return { privateKey: privateKeyPem, certificate: certPem };
  }

  private getLeafCert(certBags: forge.pkcs12.Bag[]): forge.pki.Certificate | undefined {
    for (const bag of certBags) {
      if (!bag.cert) continue;
      const isCa = bag.cert.extensions?.some(
        (ext: { name?: string; cA?: boolean }) => ext.name === 'basicConstraints' && ext.cA === true
      );
      if (!isCa) {
        return bag.cert;
      }
    }
    return certBags[0]?.cert;
  }
}
