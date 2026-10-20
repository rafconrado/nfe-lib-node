import https from 'https';
import forge from 'node-forge';

export interface DadosCertificado {
  nomeComum: string;
  cnpjOuCpf?: string | undefined;
  emissor: string;
  validoDe: Date;
  validoAte: Date;
  estaValido: boolean;
  diasParaVencer: number;
}

interface ExtraidoPfx {
  privateKey: string;
  certificate: string;
  leafCert: forge.pki.Certificate;
}

export class Certificado {
  public pfxBuffer: Buffer;
  public password?: string | undefined;
  private cacheExtraido?: ExtraidoPfx | undefined;

  constructor(pfxBuffer: Buffer, password?: string | undefined) {
    this.pfxBuffer = pfxBuffer;
    this.password = password;
  }

  /**
   * Retorna a chave privada e o certificado público em formato PEM.
   */
  public getPem(): { privateKey: string; certificate: string } {
    const { privateKey, certificate } = this.extractFromPfx();
    return { privateKey, certificate };
  }

  /**
   * Retorna um https.Agent configurado com o certificado para autenticação mútua TLS (exigida pela SEFAZ).
   */
  public getHttpsAgent(): https.Agent {
    const { privateKey, certificate } = this.getPem();
    return new https.Agent({
      cert: certificate,
      key: privateKey,
      rejectUnauthorized: false, // Em ambientes de homologação da Sefaz, a cadeia pode ser inválida
    });
  }

  /**
   * Retorna metadados e informações de validade do certificado A1 (ICP-Brasil).
   */
  public getDados(): DadosCertificado {
    const { leafCert } = this.extractFromPfx();
    const nomeComum = this.getAttrValue(leafCert.subject.attributes, 'CN');
    const emissor =
      this.getAttrValue(leafCert.issuer.attributes, 'CN') ||
      this.getAttrValue(leafCert.issuer.attributes, 'O');

    const matchDoc = nomeComum.match(/:(\d{11}|\d{14})\b/) ?? nomeComum.match(/\b(\d{14})\b/);
    const cnpjOuCpf = matchDoc?.[1];

    const validoDe = leafCert.validity.notBefore;
    const validoAte = leafCert.validity.notAfter;
    const agora = new Date();
    const estaValido = agora >= validoDe && agora <= validoAte;
    const diasParaVencer = Math.floor((validoAte.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));

    return {
      nomeComum,
      cnpjOuCpf,
      emissor,
      validoDe,
      validoAte,
      estaValido,
      diasParaVencer,
    };
  }

  /**
   * Indica se o certificado está dentro do prazo de validade na data atual.
   */
  public estaValido(): boolean {
    return this.getDados().estaValido;
  }

  private extractFromPfx(): ExtraidoPfx {
    if (this.cacheExtraido) {
      return this.cacheExtraido;
    }

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

    if (!privateKeyPem || !certPem || !cert) {
      throw new Error('Não foi possível extrair a chave privada ou o certificado do PFX.');
    }

    this.cacheExtraido = {
      privateKey: privateKeyPem,
      certificate: certPem,
      leafCert: cert,
    };

    return this.cacheExtraido;
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

  private getAttrValue(
    attributes: forge.pki.CertificateField[],
    shortName: string
  ): string {
    const field = attributes.find((attr) => attr.shortName === shortName);
    return typeof field?.value === 'string' ? field.value : '';
  }
}
