import { NFe, Certificado, DadosNFe } from '../src';
import fs from 'fs';
import path from 'path';

async function rodarEmissao() {
  console.log('Iniciando emissão de NF-e...');

  try {
    const pfxPath = path.resolve(__dirname, '../certificado.pfx');
    
    // ATENÇÃO: Substitua 'SUA_SENHA' pela senha real do certificado!
    const certificado = new Certificado(
      fs.readFileSync(pfxPath),
      'SUA_SENHA' 
    );

    const nfe = new NFe({
      uf: 'DF',
      ambiente: 'homologacao',
      certificado: certificado
    });

    // =========================================================================
    // DADOS DA NOTA FISCAL
    // =========================================================================
    const chaveAcesso = '53260999999999999999550010000000011000000011';
    
    const dadosNota: DadosNFe = {
      infNFe: {
        '@Id': `NFe${chaveAcesso}`,
        '@versao': '4.00',
        ide: {
          cUF: '53',
          cNF: '00000001',
          natOp: 'VENDA DE MERCADORIA',
          mod: '55',
          serie: '1',
          nNF: '1',
          dhEmi: new Date().toISOString().substring(0, 19) + '-03:00',
          tpNF: '1', // 1=Saída
          idDest: '1', // 1=Operação interna
          cMunFG: '5300108', // Brasília
          tpImp: '1', // 1=Retrato
          tpEmis: '1', // 1=Normal
          cDV: '1',
          tpAmb: '2', // 2=Homologação
          finNFe: '1', // 1=Normal
          indFinal: '1', // 1=Consumidor Final
          indPres: '1', // 1=Operação presencial
          procEmi: '0',
          verProc: '1.0.0'
        },
        emit: {
          CNPJ: '00000000000000', // INSIRA O CNPJ DO EMITENTE
          xNome: 'EMPRESA EMITENTE TESTE LTDA',
          enderEmit: {
            xLgr: 'Rua Teste',
            nro: '123',
            xBairro: 'Centro',
            cMun: '5300108',
            xMun: 'Brasilia',
            UF: 'DF',
            CEP: '70000000',
            cPais: '1058',
            xPais: 'Brasil',
            fone: '61999999999'
          },
          IE: '00000000000', // INSIRA A IE DO EMITENTE
          CRT: '1' // 1=Simples Nacional
        },
        dest: {
          CPF: '00000000000', // CPF DO DESTINATÁRIO
          xNome: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
          enderDest: {
            xLgr: 'Rua Destino',
            nro: '321',
            xBairro: 'Bairro Destino',
            cMun: '5300108',
            xMun: 'Brasilia',
            UF: 'DF',
            CEP: '70000000',
            cPais: '1058',
            xPais: 'Brasil'
          },
          indIEDest: '9' // 9=Não Contribuinte
        },
        det: {
          '@nItem': '1',
          prod: {
            cProd: '001',
            cEAN: 'SEM GTIN',
            xProd: 'Produto de Teste NFe',
            NCM: '94039000', 
            CFOP: '5102',
            uCom: 'UN',
            qCom: '1.0000',
            vUnCom: '0.01',
            vProd: '0.01',
            cEANTrib: 'SEM GTIN',
            uTrib: 'UN',
            qTrib: '1.0000',
            vUnTrib: '0.01',
            indTot: '1'
          },
          imposto: {
            vTotTrib: '0.00',
            ICMS: {
              ICMSSN102: {
                orig: '0',
                CSOSN: '102'
              }
            },
            PIS: {
              PISOutr: {
                CST: '99',
                vBC: '0.00',
                pPIS: '0.00',
                vPIS: '0.00'
              }
            },
            COFINS: {
              COFINSOutr: {
                CST: '99',
                vBC: '0.00',
                pCOFINS: '0.00',
                vCOFINS: '0.00'
              }
            }
          }
        },
        total: {
          ICMSTot: {
            vBC: '0.00', vICMS: '0.00', vICMSDeson: '0.00', vFCP: '0.00', 
            vBCST: '0.00', vST: '0.00', vFCPST: '0.00', vFCPSTRet: '0.00', 
            vProd: '0.01', vFrete: '0.00', vSeg: '0.00', vDesc: '0.00', 
            vII: '0.00', vIPI: '0.00', vIPIDevol: '0.00', vPIS: '0.00', 
            vCOFINS: '0.00', vOutro: '0.00', vNF: '0.01', vTotTrib: '0.00'
          }
        },
        transp: {
          modFrete: '9' // 9=Sem Frete
        },
        pag: {
          detPag: {
            indPag: '0', // 0=Pagamento à Vista
            tPag: '01', // 01=Dinheiro
            vPag: '0.01'
          }
        }
      }
    };

    console.log('Enviando NFe...');
    const resposta = await nfe.emitir(dadosNota);
    
    console.log('\n✅ Resposta da SEFAZ:');
    console.log(resposta.xml);

  } catch (error: any) {
    console.error('\n❌ Erro:');
    console.error(error.message);
  }
}

rodarEmissao();
