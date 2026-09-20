import { NFe, Certificado } from '../src';
import fs from 'fs';
import path from 'path';

async function rodarExemplo() {
  console.log('Iniciando teste da Lib de NFe...');

  try {
    // 1. Caminho do certificado
    const pfxPath = path.resolve(__dirname, '../certificado.pfx');
    if (!fs.existsSync(pfxPath)) {
      console.error('ERRO: Arquivo certificado.pfx não encontrado na raiz do projeto!');
      return;
    }

    // 2. Instanciando o Certificado
    // ATENÇÃO: Substitua 'SUA_SENHA' pela senha real do certificado!
    const certificado = new Certificado(
      fs.readFileSync(pfxPath),
      'SUA_SENHA' 
    );

    // 3. Configurando a NFe para o DF em Homologação
    const nfe = new NFe({
      uf: 'DF',
      ambiente: 'homologacao',
      certificado: certificado
    });

    // 4. Testando a comunicação (Status do Serviço)
    console.log('Consultando status da SEFAZ...');
    const status = await nfe.consultarStatus();
    
    console.log('\n✅ Sucesso! Resposta da SEFAZ:');
    console.log(status.xml);

  } catch (error: any) {
    console.error('\n❌ Erro ao comunicar com a SEFAZ:');
    console.error(error.message);
  }
}

rodarExemplo();
