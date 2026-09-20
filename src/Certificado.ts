import https from 'https';

export class Certificado {
  public pfxBuffer: Buffer;
  public password?: string;

  constructor(pfxBuffer: Buffer, password?: string) {
    this.pfxBuffer = pfxBuffer;
    this.password = password;
  }

  /**
   * Retorna um https.Agent configurado com o certificado para autenticação mútua TLS (exigida pela SEFAZ).
   */
  public getHttpsAgent(): https.Agent {
    return new https.Agent({
      pfx: this.pfxBuffer,
      passphrase: this.password,
      rejectUnauthorized: false, // Em ambientes de homologação da Sefaz, a cadeia pode ser inválida
    });
  }
}
