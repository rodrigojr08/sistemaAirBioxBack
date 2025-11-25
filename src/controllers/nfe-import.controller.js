const fs = require("fs");
const xml2js = require("xml2js").parseStringPromise;

const pool = require("../config/database2");
const NFeImportModel = require("../models/nfe-import.model");
const EstoqueMovModel = require("../models/estoque-mov.model");
const ProdutosXmlModel = require("../models/produtos-xml.model");
const FornecedorModel = require("../models/fornecedores.model");

exports.importarXML = async (req, res) => {
    try {
        const { xmlBase64 } = req.body;

        if (!xmlBase64) {
            return res.status(400).json({ erro: "XML não enviado." });
        }

        const xmlString = Buffer.from(xmlBase64, "base64").toString("utf-8");

        const json = await xml2js(xmlString, { explicitArray: false });
        const nf = json.nfeProc.NFe.infNFe;

        await pool.query("BEGIN");

        const chave = json.nfeProc.protNFe.infProt.chNFe;

        const existe = await pool.query(
            "SELECT id FROM nfe_entrada WHERE chave_acesso = $1 LIMIT 1",
            [chave]
        );

        if (existe.rowCount > 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({
                erro: "NF-e já importada anteriormente.",
                id_existente: existe.rows[0].id
            });
        }

        // === EMITENTE (XML: <emit>) ===
        const emit = nf.emit;
        const endEmit = emit.enderEmit;

        const dadosEmitente = {
            cnpj: emit.CNPJ,
            razao_social: emit.xNome,
            nome_fantasia: emit.xFant || emit.xNome,
            ie: emit.IE || null,
            im: emit.IM || null,
            cnae: emit.CNAE || null,
            crt: emit.CRT || null,
            logradouro: endEmit.xLgr,
            numero: endEmit.nro,
            bairro: endEmit.xBairro,
            cidade: endEmit.xMun,
            cod_municipio: endEmit.cMun,
            uf: endEmit.UF,
            cep: endEmit.CEP,
            pais: endEmit.xPais,
            telefone: endEmit.fone || null
        };

        const id_emitente = await NFeImportModel.inserirEmitente(dadosEmitente);

        // === FORNECEDOR (tabela própria, baseado no emitente) ===
        let id_fornecedor;
        const fornecedorExistente = await FornecedorModel.buscarPorCNPJ(emit.CNPJ);

        if (fornecedorExistente.rowCount > 0) {
            id_fornecedor = fornecedorExistente.rows[0].id;
        } else {
            id_fornecedor = await FornecedorModel.criar({
                razao_social: emit.xNome,
                nome_fantasia: emit.xFant || emit.xNome,
                cnpj: emit.CNPJ,
                ie: emit.IE || null,
                email: nf.dest?.email || null,
                telefone: endEmit.fone || null,
                cep: endEmit.CEP,
                endereco: endEmit.xLgr,
                numero: endEmit.nro,
                bairro: endEmit.xBairro,
                cidade: endEmit.xMun,
                uf: endEmit.UF
            });
        }

        // === DESTINATÁRIO (XML: <dest>) ===
        const dest = nf.dest;
        const endDest = dest.enderDest;

        const dadosDest = {
            cnpj: dest.CNPJ,
            razao_social: dest.xNome,
            ie: dest.IE || null,
            email: dest.email || null,
            logradouro: endDest.xLgr,
            numero: endDest.nro,
            bairro: endDest.xBairro,
            cidade: endDest.xMun,
            cod_municipio: endDest.cMun,
            uf: endDest.UF,
            cep: endDest.CEP,
            pais: endDest.xPais,
            telefone: endDest.fone || null
        };

        const id_destinatario = await NFeImportModel.inserirDestinatario(dadosDest);

        // === TRANSPORTE (XML: <transp>) ===
        const transp = nf.transp;
        const vol = transp.vol || {};
        const transporta = transp.transporta || {};

        const dadosTransp = {
            mod_frete: Number(transp.modFrete),
            cnpj_transp: transporta.CNPJ || null,
            nome_transp: transporta.xNome || null,
            ie_transp: transporta.IE || null,
            endereco: transporta.xEnder || null,
            municipio: transporta.xMun || null,
            uf: transporta.UF || null,
            q_vol: vol.qVol ? Number(vol.qVol) : null,
            esp_vol: vol.esp || null,
            peso_liq: vol.pesoL ? Number(vol.pesoL) : null,
            peso_bruto: vol.pesoB ? Number(vol.pesoB) : null
        };

        const id_transporte = await NFeImportModel.inserirTransporte(dadosTransp);

        // === COBRANÇA + DUPLICATAS (XML: <cobr>) ===
        let id_cobranca = null;
        if (nf.cobr && nf.cobr.fat) {
            const fat = nf.cobr.fat;

            const dadosCobr = {
                numero_fatura: fat.nFat,
                valor_original: Number(fat.vOrig),
                valor_desconto: Number(fat.vDesc || 0),
                valor_liquido: Number(fat.vLiq)
            };

            id_cobranca = await NFeImportModel.inserirCobranca(dadosCobr);

            let dups = nf.cobr.dup || [];
            if (!Array.isArray(dups)) dups = [dups];

            for (const dup of dups) {
                await NFeImportModel.inserirDuplicata(id_cobranca, {
                    numero: dup.nDup,
                    vencimento: dup.dVenc,
                    valor: Number(dup.vDup)
                });
            }
        }

        // === PAGAMENTO (XML: <pag>) ===
        let id_pagamento = null;
        if (nf.pag && nf.pag.detPag) {
            const detPag = nf.pag.detPag;

            const dadosPag = {
                forma_pagamento: detPag.tPag,
                indicador_pagamento: Number(detPag.indPag || 0),
                valor_pagamento: Number(detPag.vPag)
            };

            id_pagamento = await NFeImportModel.inserirPagamento(dadosPag);
        }
        const ide = nf.ide;
        const icmsTot = nf.total.ICMSTot;

        const dadosICMS = {
            vBC: icmsTot.vBC,
            vICMS: icmsTot.vICMS,
            vICMSDeson: icmsTot.vICMSDeson,
            vFCP: icmsTot.vFCP,
            vBCST: icmsTot.vBCST,
            vST: icmsTot.vST,
            vFCPST: icmsTot.vFCPST,
            vFCPSTRet: icmsTot.vFCPSTRet,
            vProd: icmsTot.vProd,
            vFrete: icmsTot.vFrete,
            vSeg: icmsTot.vSeg,
            vDesc: icmsTot.vDesc,
            vII: icmsTot.vII,
            vIPI: icmsTot.vIPI,
            vIPIDevol: icmsTot.vIPIDevol,
            vPIS: icmsTot.vPIS,
            vCOFINS: icmsTot.vCOFINS,
            vOutro: icmsTot.vOutro,
            vNF: icmsTot.vTotTrib
        };

        const id_icms_tot = await NFeImportModel.inserirIcmsTot(dadosICMS);

        // === CABEÇALHO NF-E (XML: <ide> + <total>) ===
        const dadosNFe = {
            id_emitente,
            id_fornecedor,
            id_destinatario,
            id_transporte,
            id_cobranca: id_cobranca,
            id_pagamento: id_pagamento,
            id_icms_totais: id_icms_tot,

            numero: ide.nNF,
            serie: ide.serie,
            modelo: ide.mod,
            chave: json.nfeProc.protNFe.infProt.chNFe,
            data_emissao: ide.dhEmi,
            data_entrada: ide.dhSaiEnt || ide.dhEmi,
            tipo_nf: ide.tpNF,
            finalidade: ide.finNFe,

            id_nfe: json.nfeProc.NFe.infNFe.$.Id,          // ✅ CORRETO
            protocolo: json.nfeProc.protNFe.infProt.nProt,

            natureza_operacao: ide.natOp,
            cod_uf: ide.cUF,
            cod_nf: ide.cNF,
            id_dest: ide.idDest,
            cod_municipio: ide.cMunFG,
            tp_imp: ide.tpImp,
            tp_emissao: ide.tpEmis,
            cod_verificacao: ide.cDV,
            tipo_ambiente: ide.tpAmb,
            finalidade_nf: ide.finNFe,
            consumidor_final: ide.indFinal,
            ind_pres: ide.indPres,
            ind_intermed: ide.indIntermed,
            proc_emi: ide.procEmi,
            ver_proc: ide.verProc,

            versao_aplicacao: json.nfeProc.protNFe.infProt.verAplic, // ok
            dig_val: json.nfeProc.protNFe.infProt.digVal,            // ✅ CORRETO
            status: json.nfeProc.protNFe.infProt.cStat,              // ok
            motivo: json.nfeProc.protNFe.infProt.xMotivo,

            xml_json: json// ok
        };

        const idNFe = await NFeImportModel.inserirNFe(dadosNFe);

        const sig = json.nfeProc.NFe.Signature;

        if (sig) {
            const assinatura = {
                canonical_method: sig.SignedInfo?.CanonicalizationMethod?.$?.Algorithm || null,
                signature_method: sig.SignedInfo?.SignatureMethod?.$?.Algorithm || null,
                reference_uri: sig.SignedInfo?.Reference?.$?.URI || null,
                digest_method: sig.SignedInfo?.Reference?.DigestMethod?.$?.Algorithm || null,

                digest_value: sig.SignedInfo?.Reference?.DigestValue || null,
                signature_value: sig.SignatureValue || null,
                x509_certificate: sig.KeyInfo?.X509Data?.X509Certificate || null
            };
            console.log('dados: ', assinatura)
            await NFeImportModel.inserirAssinatura(idNFe, assinatura);
        }

        // === ITENS + ESTOQUE ===
        let itens = nf.det;
        if (!Array.isArray(itens)) itens = [itens];

        for (const det of itens) {
            const prod = det.prod;
            const imposto = det.imposto;

            // ============ DADOS DO PRODUTO ============
            const dadosItem = {
                codigo_produto: prod.cProd,
                ean: prod.cEAN || null,
                descricao: prod.xProd,
                ncm: prod.NCM,
                quantidade: Number(prod.qCom || 0),
                valor_unitario: Number(prod.vUnCom || 0),
                valor_total: Number(prod.vProd || 0),
                numero_item: Number(det.$?.nItem || 0),
                cest: prod.CEST || null,
                cfop: prod.CFOP || null,
                unidade: prod.uCom || null,
                valor_frete: Number(prod.vFrete || 0),
                ind_total: Number(prod.indTot || 1),
                ean_trib: prod.cEANTrib || null,
                unidade_trib: prod.uTrib || null,
                quantidade_trib: Number(prod.qTrib || 0),
                valor_unitario_trib: Number(prod.vUnTrib || 0)
            };

            // ============ DADOS DOS IMPOSTOS POR ITEM ============
            const icmsXML = imposto.ICMS?.ICMS10
                || imposto.ICMS?.ICMS20
                || {};

            const dadosImpostos = {
                icms_origem: Number(icmsXML?.orig || 0),
                icms_cst: icmsXML?.CST || null,
                icms_mod_bc: Number(icmsXML?.modBC || 0),
                icms_base: Number(icmsXML?.vBC || 0),
                icms_aliquota: Number(icmsXML?.pICMS || 0),
                icms_valor: Number(icmsXML?.vICMS || 0),

                icms_mod_bc_st: Number(icmsXML?.modBCST || 0),
                icms_mvast: Number(icmsXML?.pMVAST || 0),
                icms_base_st: Number(icmsXML?.vBCST || 0),
                icms_aliq_st: Number(icmsXML?.pICMSST || 0),
                icms_valor_st: Number(icmsXML?.vICMSST || 0),
                icms_p_red_bc: Number(icmsXML?.pRedBC || 0),

                ipi_cenq: Number(imposto.IPI.cEnq || 0),
                ipi_cst: imposto.IPI?.IPINT?.CST || imposto.IPI?.IPITrib?.CST || null,

                pis_cst: imposto.PIS.PISAliq.CST || null,
                pis_vbc: Number(imposto.PIS.PISAliq.vBC || 0),
                pis_ppis: Number(imposto.PIS.PISAliq.pPIS || 0),
                pis_valor: Number(imposto.PIS.PISAliq.vPIS || 0),

                cofins_cst: imposto.COFINS.COFINSAliq.CST || null,
                cofins_vbc: Number(imposto.COFINS.COFINSAliq.vBC || 0),
                cofins_pcofins: Number(imposto.COFINS.COFINSAliq.pCOFINS || 0),
                cofins_valor: Number(imposto.COFINS.COFINSAliq.vCOFINS || 0),

                valor_total_tributos: Number(imposto.vTotTrib)

            };

            // ============ PRODUTO ============
            const prodRes = await ProdutosXmlModel.buscarPorEAN(prod.cEAN);
            let id_produto;

            if (prodRes.rowCount > 0) {
                id_produto = prodRes.rows[0].id;
            } else {
                const novoProduto = await ProdutosXmlModel.criarProdutoPorXml({
                    ean: prod.cEAN,
                    descricao: prod.xProd,
                    ncm: prod.NCM,
                    unidade: prod.uCom,
                    custo: Number(prod.vUnCom),
                    id_fornecedor
                });
                id_produto = novoProduto.rows[0].id;
            }

            const idItem = await NFeImportModel.inserirItem(idNFe, dadosItem, dadosImpostos);

            // Movimentação de estoque (entrada)
            await EstoqueMovModel.registrarMovimentacao(
                id_produto,
                "ENTRADA",
                dadosItem.quantidade,
                "NFE_ENTRADA",
                idItem
            );
        }

        await pool.query("COMMIT");

        return res.json({
            sucesso: true,
            mensagem: "NF-e importada com sucesso!",
            idNFe
        });

    } catch (err) {
        await pool.query("ROLLBACK");
        console.error(err);
        res.status(500).json({
            erro: "Erro ao importar XML",
            detalhes: err.message
        });
    }
};