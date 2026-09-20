import https from 'https';

export class Certificado {
  private pfxBuffer: Buffer;
  private password?: string;

  /**
   * Inicializa o certificado digital A1.
   * @param pfxBuffer O Buffer do arquivo .pfx lido (ex: fs.readFileSync('cert.pfx'))
   * @param password A senha do certificado (opcional, dependendo do certificado)
   */
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
