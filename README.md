# nfe-lib-node 🚀

Uma biblioteca Node.js em TypeScript para emissão de Nota Fiscal Eletrônica (NF-e) focada em simplicidade, segurança e sem dependência de serviços terceiros (SaaS). 

Pague apenas os seus impostos, não pela emissão! 😉

## 📦 Instalação

Instale diretamente via NPM:

```bash
npm install nfe-lib-node
```

Ou, para clonar e rodar localmente:

```bash
git clone https://github.com/rafconrado/nfe-lib-node.git
cd nfe-lib-node
npm install
```

## 🚀 Como usar

A arquitetura foi pensada para ser o mais simples possível. Você só precisa do seu Certificado Digital A1 (`.pfx`).

### 1. Validar Certificado e Consultar Status do Serviço (SEFAZ)

```typescript
import { NFe, Certificado } from 'nfe-lib-node';
import fs from 'fs';

async function testarSefaz() {
  const certificado = new Certificado(fs.readFileSync('./certificado.pfx'), 'SENHA_DO_CERTIFICADO');

  // Opcional: Inspecionar dados e validade do Certificado A1 (ICP-Brasil)
  const dadosCert = certificado.getDados();
  console.log(`Titular: ${dadosCert.nomeComum} (${dadosCert.cnpjOuCpf})`);
  console.log(`Válido: ${dadosCert.estaValido} (${dadosCert.diasParaVencer} dias restantes)`);

  const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });

  const status = await nfe.consultarStatus();
  console.log(status.xml);
}
```

### 2. Emitir uma NF-e (Autorização) e Gerar DANFE em PDF

A biblioteca cuida da infraestrutura completa (Tipagem do Layout 4.00, Assinatura XMLDSig, comunicação SOAP e geração de DANFE em PDF sem dependências pesadas):

```typescript
import { NFe, Certificado, Danfe, type DadosNFe } from 'nfe-lib-node';
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
      det: [ /* ... */ ],
      total: { /* ... */ },
      transp: { /* ... */ },
      pag: { /* ... */ }
    }
  };

  const resposta = await nfe.emitir(nota);
  console.log(`Status: ${resposta.status} - ${resposta.motivo}`);

  // Gera o PDF do DANFE diretamente a partir do XML assinado + retorno da SEFAZ
  if (resposta.xmlAssinado) {
    const pdfBuffer = Danfe.fromXml(resposta.xmlAssinado, resposta.xml);
    fs.writeFileSync('./danfe.pdf', pdfBuffer);
  }
}
```

## ✨ Funcionalidades Atuais

* 🔐 **Certificado Digital A1 (`.pfx`)**: Extração com cache em memória, inspeção de validade/titular (`getDados()`, `estaValido()`) e configuração de mTLS.
* ✍️ **Assinatura Digital XMLDSig**: Assinatura no padrão exigido pela SEFAZ (`rsa-sha1` / `enveloped-signature` / `c14n`).
* 📡 **Comunicação SEFAZ (SOAP 1.2)**: Consulta de status do serviço (`consultarStatus`) e autorização síncrona de NF-e (`emitir`) com geração automática do `<nfeProc>`.
* 📄 **Gerador de DANFE em PDF**: Geração nativa de PDF com código de barras `Code128C` via `Danfe.fromXml()`.
* 📘 **Tipagem TypeScript Completa**: Interfaces completas da NF-e / NFC-e 4.00 (incluindo os novos grupos de IBS/CBS da Reforma Tributária).

## 🛡️ Segurança

* **Nunca** faça commit do seu arquivo `.pfx` ou da sua senha para o GitHub.
* O arquivo `.gitignore` já vem configurado para ignorar extensões de certificados por padrão.

## 🤝 Contribuições

As próximas etapas envolvem suporte a eventos (Cancelamento, Carta de Correção), Consulta de Protocolo por chave, Inutilização e mapeamento completo de WebServices de todas as UFs. Toda contribuição da comunidade Node.js brasileira é bem-vinda!

## 👨‍💻 Autor

Criado e idealizado por **Rafael Conrado**.
Se você curtiu o projeto, me dê um "Alô" nas redes:
* [GitHub - @rafconrado](https://github.com/rafconrado)
* [LinkedIn](https://www.linkedin.com/in/rafconradoo/)

## 📝 Licença

MIT License
