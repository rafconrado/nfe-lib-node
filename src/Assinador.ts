import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';
import { Certificado } from './Certificado.js';

export class Assinador {
  private privateKeyPem: string;
  private publicCertPem: string;

  constructor(certificadoOuPfx: Certificado | Buffer, password?: string | undefined) {
    const cert =
      certificadoOuPfx instanceof Certificado
        ? certificadoOuPfx
        : new Certificado(certificadoOuPfx, password);
    const { privateKey, certificate } = cert.getPem();
    this.privateKeyPem = privateKey;
    this.publicCertPem = certificate;
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
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      ],
      digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
      uri: `#${id}`,
    });

    sig.privateKey = this.privateKeyPem;
    sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
    sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

    // Em xml-crypto v6, basta passar o publicCert
    sig.publicCert = Buffer.from(this.publicCertPem);

    sig.computeSignature(xmlCru, {
      prefix: '',
      location: { reference: `//*[local-name(.)='NFe']`, action: 'append' },
    });

    return sig.getSignedXml();
  }
}
