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
  const certificado = new Certificado(fs.readFileSync('./certificado.pfx'), 'SENHA_DO_CERTIFICADO');
  const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });

  const status = await nfe.consultarStatus();
  console.log(status.xml);
}
```

### 2. Emitir uma NF-e (Autorização)

A biblioteca foca na infraestrutura (Assinatura XMLDSig e SOAP). Você fornece um objeto com a estrutura da SEFAZ, e a biblioteca cuida da dor de cabeça da criptografia:

```typescript
import { NFe, Certificado, DadosNFe } from 'nfe-lib-node';
import fs from 'fs';

async function emitirNota() {
  const certificado = new Certificado(fs.readFileSync('./certificado.pfx'), 'SENHA_DO_CERTIFICADO');
  const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });

  const nota: DadosNFe = {
    infNFe: {
      '@Id': 'NFe5326...',
      '@versao': '4.00',
      ide: { /* ... */ },
      emit: { /* ... */ },
      dest: { /* ... */ },
      det: { /* ... */ },
      total: { /* ... */ },
      transp: { /* ... */ },
      pag: { /* ... */ }
    }
  };

  const resposta = await nfe.emitir(nota);
  console.log(resposta.xml); // Autorizado!
}
```

testarSefaz();

## 🛡️ Segurança

* **Nunca** faça commit do seu arquivo `.pfx` ou da sua senha para o GitHub.
* O arquivo `.gitignore` já vem configurado para ignorar extensões de certificados por padrão.

## 🤝 Contribuições

Este projeto está no início (Fase 1: Comunicação Base). As próximas etapas envolvem a construção dos Builders de XML e a Assinatura Digital (XMLDSig). Toda contribuição da comunidade Node.js brasileira é bem-vinda!

## 👨‍💻 Autor

Criado e idealizado por **Rafael Conrado**.
Se você curtiu o projeto, me dê um "Alô" nas redes:
* [GitHub - @rafconrado](https://github.com/rafconrado)
* [LinkedIn](https://www.linkedin.com/in/rafconradoo/)

## 📝 Licença

MIT License
