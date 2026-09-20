import { SignedXml } from 'xml-crypto';
import forge from 'node-forge';
import { DOMParser } from '@xmldom/xmldom';

export class Assinador {
  private privateKeyPem: string;
  private publicCertPem: string;

  constructor(pfxBuffer: Buffer, password?: string) {
    const { privateKey, certificate } = this.extractPemFromPfx(pfxBuffer, password);
    this.privateKeyPem = privateKey;
    this.publicCertPem = certificate;
  }

  /**
   * Extrai a chave privada e o certificado público do PFX
   */
  private extractPemFromPfx(pfxBuffer: Buffer, password?: string) {
    const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password || '');

    let privateKeyPem = '';
    let certPem = '';

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const cert = certBags[forge.pki.oids.certBag]?.[0]?.cert;
    if (cert) {
      certPem = forge.pki.certificateToPem(cert);
    }

    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const key = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key;
    if (key) {
      privateKeyPem = forge.pki.privateKeyToPem(key);
    }

    if (!privateKeyPem || !certPem) {
      throw new Error('Não foi possível extrair a chave privada ou o certificado do PFX.');
    }

    return { privateKey: privateKeyPem, certificate: certPem };
  }

  /**
   * Assina o XML da Nota Fiscal Eletrônica no padrão SEFAZ (XMLDSig)
   */
  public assinarXmlNFe(xmlCru: string): string {
    const doc = new DOMParser().parseFromString(xmlCru, 'text/xml');
    const infNFe = doc.getElementsByTagName('infNFe')[0];
    
    if (!infNFe) {
      throw new Error('Tag <infNFe> não encontrada no XML. O XML fornecido não é uma NF-e válida.');
    }

    const id = infNFe.getAttribute('Id');
    if (!id) {
      throw new Error('A tag <infNFe> precisa ter o atributo Id (ex: Id="NFe12345...")');
    }

    const sig = new SignedXml();
    // A SEFAZ exige URI=#IdDaNota e essas duas transforms
    sig.addReference({
      xpath: `//*[@Id='${id}']`,
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature', 
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
      ],
      digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
      uri: `#${id}`
    });

    sig.privateKey = this.privateKeyPem;
    sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
    sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

    // Em xml-crypto v6, basta passar o publicCert
    sig.publicCert = Buffer.from(this.publicCertPem);

    sig.computeSignature(xmlCru, {
      prefix: '',
      location: { reference: `//*[local-name(.)='NFe']`, action: 'append' }
    });

    return sig.getSignedXml();
  }
}
