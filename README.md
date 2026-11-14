# nfe-lib-node 🚀

Biblioteca Node.js em TypeScript para emissão e gestão de **Nota Fiscal Eletrônica (NF-e Modelo 55 — Layout 4.00)** com comunicação direta com a SEFAZ (mTLS/SOAP 1.2), assinatura XMLDSig e geração nativa de DANFE em PDF.

Pague apenas os seus impostos, não pela emissão! 😉

## 📦 Instalação

```bash
npm install nfe-lib-node
```

## ⚡ Uso Rápido

```typescript
import fs from 'node:fs';
import { NFe, Certificado, Danfe, type DadosNFe } from 'nfe-lib-node';

const certificado = new Certificado(fs.readFileSync('./certificado.pfx'), 'SENHA_DO_PFX');
const nfe = new NFe({ uf: 'DF', ambiente: 'homologacao', certificado });

// 1. Emitir NF-e (@Id, cUF, cNF, cDV, dhEmi e tpAmb são calculados automaticamente se omitidos)
const nota: DadosNFe = {
  infNFe: {
    ide: { natOp: 'VENDA', serie: '1', nNF: '100', tpNF: '1', idDest: '1', cMunFG: '5300108', tpImp: '1', tpEmis: '1', finNFe: '1', indFinal: '1', indPres: '1', procEmi: '0', verProc: '1.0.0' },
    emit: { /* dados do emitente */ } as any,
    dest: { /* dados do destinatário */ } as any,
    det: [ /* itens da nota */ ],
    total: { /* totais ICMSTot */ } as any,
    transp: { modFrete: '9' },
    pag: { detPag: [{ tPag: '01', vPag: '100.00' }] },
  },
};

const emissao = await nfe.emitir(nota);
console.log(emissao.chave, emissao.status, emissao.motivo);

// 2. Gerar DANFE A4 em PDF (com suporte opcional a logo PNG/JPEG)
if (emissao.xmlAssinado) {
  const pdf = Danfe.fromXml(emissao.xmlAssinado, emissao.xml, {
    logo: fs.readFileSync('./logo.png'), // opcional
  });
  fs.writeFileSync('./danfe.pdf', pdf);
}
```

## 🛠️ Operações Disponíveis

| Método / Utilitário | Descrição |
| :--- | :--- |
| `nfe.consultarStatus()` | Consulta disponibilidade do webservice da UF (`NFeStatusServico4`) |
| `nfe.emitir(dados)` | Assina, calcula chave/`cDV` automaticamente, envia lote síncrono e monta `<nfeProc>` |
| `nfe.consultarProtocolo(chave)` | Consulta situação atual e protocolo da NF-e (`NFeConsultaProtocolo4`) |
| `nfe.consultarRecibo(recibo)` | Consulta resultado de processamento de lote (`NFeRetAutorizacao4`) |
| `nfe.cancelar({ chave, protocolo, justificativa })` | Envia evento de Cancelamento (`110111`) e retorna `<procEventoNFe>` |
| `nfe.cartaCorrecao({ chave, correcao, nSeqEvento })` | Envia Carta de Correção Eletrônica — CC-e (`110110`) |
| `nfe.inutilizar({ cnpj, serie, numeroInicial, numeroFinal, justificativa })` | Inutiliza faixa de numeração (`NFeInutilizacao4`) e retorna `<ProcInutNFe>` |
| `nfe.manifestar({ chave, tipo, justificativa? })` | Manifestação do Destinatário no Ambiente Nacional (`ciencia`, `confirmacao`, `desconhecimento`, `nao_realizada`) |
| `nfe.distribuicaoDFe({ ultimoNSU \| nsu \| chave })` | Consulta `NFeDistribuicaoDFe` e descompacta `<docZip>` automaticamente |
| `Danfe.fromXml(xml, xmlRetorno?, { logo? })` | Gera PDF A4 do DANFE (monocromático padrão NFePHP, paginação automática e logo opcional) |
| `certificado.getDados()` | Extrai titular, CNPJ/CPF, validade e dias restantes do Certificado A1 (`.pfx`) |
| `gerarChaveAcesso` / `validarChaveAcesso` | Gera, valida e extrai campos da chave de 44 dígitos (Módulo 11) |

## 🛡️ Segurança

Nunca faça commit do seu arquivo `.pfx` ou da sua senha. O `.gitignore` do projeto já bloqueia extensões de certificados (`.pfx`, `.p12`, `.cer`, `.key`, `.pem`) e variáveis `.env`.

## 👨‍💻 Autor & Licença

Criado por **Rafael Conrado** ([GitHub](https://github.com/rafconrado) • [LinkedIn](https://www.linkedin.com/in/rafconradoo/)). Distribuído sob a licença **MIT**.
