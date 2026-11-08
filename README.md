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

### 3. Consultar Protocolo, Recibo, Cancelar, Carta de Correção e Inutilizar Numeração

```typescript
import { NFe, Certificado } from 'nfe-lib-node';
import fs from 'fs';

async function gerenciarNotas() {
  const certificado = new Certificado(fs.readFileSync('./certificado.pfx'), 'SENHA_DO_CERTIFICADO');
  const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });

  const chave = '53260999999999999999550010000000011847291638';

  // 1. Consulta de Protocolo por Chave de Acesso (NFeConsultaProtocolo4)
  const consulta = await nfe.consultarProtocolo(chave);
  console.log(`Situação: ${consulta.status} - ${consulta.motivo}`);

  // 2. Consulta de Recibo de Lote de 15 dígitos (NFeRetAutorizacao4)
  const recibo = await nfe.consultarRecibo('531000000000001');
  console.log(`Recibo: ${recibo.status} - ${recibo.motivo}`);

  // 3. Carta de Correção Eletrônica - CC-e (tpEvento 110110)
  const cce = await nfe.cartaCorrecao({
    chave,
    correcao: 'Correcao na descricao complementar da mercadoria transportada.',
    nSeqEvento: 1,
  });
  console.log(`CC-e: ${cce.status} - ${cce.motivo}`);

  // 4. Cancelamento de NF-e (tpEvento 110111)
  const cancelamento = await nfe.cancelar({
    chave,
    protocolo: '153260000000001',
    justificativa: 'Erro no preenchimento dos dados comerciais da nota fiscal.',
  });
  console.log(`Cancelamento: ${cancelamento.status} - ${cancelamento.motivo}`);

  // 5. Inutilização de Faixa de Numeração (NFeInutilizacao4)
  const inutilizacao = await nfe.inutilizar({
    cnpj: '00000000000000',
    serie: 1,
    numeroInicial: 10,
    numeroFinal: 12,
    justificativa: 'Quebra de sequencia na numeracao do sistema emissor.',
  });
  console.log(`Inutilização: ${inutilizacao.status} - ${inutilizacao.motivo}`);
}
```

## ✨ Funcionalidades Atuais

* 🔐 **Certificado Digital A1 (`.pfx`)**: Extração com cache em memória, inspeção de validade/titular (`getDados()`, `estaValido()`) e configuração de mTLS.
* 🔑 **Chave de Acesso (Módulo 11)**: Geração, validação, extração de dados da chave de 44 dígitos e cálculo automático do `cDV` (`gerarChaveAcesso`, `validarChaveAcesso`, `getDadosChaveAcesso`, `getDigitoVerificador`).
* ✍️ **Assinatura Digital XMLDSig**: Assinatura no padrão exigido pela SEFAZ (`rsa-sha1` / `enveloped-signature` / `c14n`) para NF-e, Eventos e Inutilização (`assinarXmlNFe`, `assinarXmlEvento`, `assinarXmlInutilizacao`).
* 🗺️ **Mapeamento Completo de WebServices por UF**: Resolução automática das URLs oficiais da NF-e 4.00 para todas as 27 UFs (`getUrlSefaz`, `getAutorizadorPorUF`, `getCodigoUF` — Autorizadores próprios: AM, BA, GO, MG, MS, MT, PE, PR, RS, SP + SVAN, SVRS e contingência SVC-AN / SVC-RS).
* 📡 **Comunicação SEFAZ Completa (SOAP 1.2)**: Consulta de status (`consultarStatus`), autorização síncrona (`emitir`), consulta de protocolo por chave (`consultarProtocolo`), consulta de recibo (`consultarRecibo`), cancelamento (`cancelar`), carta de correção (`cartaCorrecao`) e inutilização de numeração (`inutilizar`), com montagem automática de `<nfeProc>`, `<procEventoNFe>` e `<ProcInutNFe>`.
* 📄 **Gerador de DANFE em PDF**: Geração nativa de PDF com código de barras `Code128C` via `Danfe.fromXml()`.
* 📘 **Tipagem TypeScript Completa**: Interfaces completas da NF-e / NFC-e 4.00 (incluindo os novos grupos de IBS/CBS da Reforma Tributária).

## 🛡️ Segurança

* **Nunca** faça commit do seu arquivo `.pfx` ou da sua senha para o GitHub.
* O arquivo `.gitignore` já vem configurado para ignorar extensões de certificados por padrão.

## 🤝 Contribuições

As próximas etapas envolvem suporte a Distribuição de DF-e (`NFeDistribuicaoDFe`), Manifestação do Destinatário e geração de QR-Code para NFC-e (Modelo 65). Toda contribuição da comunidade Node.js brasileira é bem-vinda!

## 👨‍💻 Autor

Criado e idealizado por **Rafael Conrado**.
Se você curtiu o projeto, me dê um "Alô" nas redes:
* [GitHub - @rafconrado](https://github.com/rafconrado)
* [LinkedIn](https://www.linkedin.com/in/rafconradoo/)

## 📝 Licença

MIT License
