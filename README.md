# nfe-lib-node 🚀

Uma biblioteca Node.js em TypeScript para emissão de Nota Fiscal Eletrônica (NF-e) focada em simplicidade, segurança e sem dependência de serviços terceiros (SaaS). 

Pague apenas os seus impostos, não pela emissão! 😉

## 📦 Instalação

Como o projeto está no início, faça o clone e instale as dependências localmente:

```bash
git clone https://github.com/SEU_USUARIO/nfe-lib-node.git
cd nfe-lib-node
npm install
```

## 🚀 Como usar

A arquitetura foi pensada para ser o mais simples possível. Você só precisa do seu Certificado Digital A1 (`.pfx`).

### 1. Consultar Status do Serviço (SEFAZ)

```typescript
import { NFe, Certificado } from 'nfe-lib-node';
import fs from 'fs';

async function testarSefaz() {
  // Carregue seu certificado físico
  const certificado = new Certificado(
    fs.readFileSync('./certificado.pfx'),
    'SENHA_DO_CERTIFICADO'
  );

  // Inicialize a biblioteca para o seu Estado
  const nfe = new NFe({
    uf: 'DF', 
    ambiente: 'homologacao', // 'homologacao' ou 'producao'
    certificado: certificado
  });

  // Consulte se os servidores da Sefaz estão online
  const status = await nfe.consultarStatus();
  console.log(status);
}

testarSefaz();
```

## 🛡️ Segurança

* **Nunca** faça commit do seu arquivo `.pfx` ou da sua senha para o GitHub.
* O arquivo `.gitignore` já vem configurado para ignorar extensões de certificados por padrão.

## 🤝 Contribuições

Este projeto está no início (Fase 1: Comunicação Base). As próximas etapas envolvem a construção dos Builders de XML e a Assinatura Digital (XMLDSig). Toda contribuição da comunidade Node.js brasileira é bem-vinda!

## 📝 Licença

MIT License
