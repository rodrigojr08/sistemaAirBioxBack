const pool = require("../config/database2");

const NFeImportModel = {
    // === EMITENTE ===
    inserirEmitente: async (emit) => {
        const result = await pool.query(`
            INSERT INTO nfe_emitente
            (cnpj, razao_social, fantasia, ie, im, cnae, crt,
             logradouro, numero, bairro, municipio, cod_municipio,
             uf, cep, pais, telefone)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
            RETURNING id
        `, [
            emit.cnpj, emit.razao_social, emit.nome_fantasia,
            emit.ie, emit.im, emit.cnae, emit.crt,
            emit.logradouro, emit.numero, emit.bairro,
            emit.cidade, emit.cod_municipio, emit.uf,
            emit.cep, emit.pais, emit.telefone
        ]);
        return result.rows[0].id;
    },

    // === DESTINATARIO ===
    inserirDestinatario: async (dest) => {
        const result = await pool.query(`
            INSERT INTO nfe_destinatario
            (cnpj, razao_social, ie, email,
             logradouro, numero, bairro, municipio,
             cod_municipio, uf, cep, pais, telefone)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING id
        `, [
            dest.cnpj, dest.razao_social, dest.ie, dest.email,
            dest.logradouro, dest.numero, dest.bairro, dest.cidade,
            dest.cod_municipio, dest.uf, dest.cep, dest.pais,
            dest.telefone
        ]);
        return result.rows[0].id;
    },

    // === TRANSPORTE ===
    inserirTransporte: async (transp) => {
        const result = await pool.query(`
            INSERT INTO nfe_transporte
            (modalidade_frete, cnpj, nome, ie,
             endereco, municipio, uf,
             quantidade_volumes, especie, peso_liquido, peso_bruto)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING id
        `, [
            transp.mod_frete, transp.cnpj_transp, transp.nome_transp,
            transp.ie_transp, transp.endereco, transp.municipio,
            transp.uf, transp.q_vol, transp.esp_vol,
            transp.peso_liq, transp.peso_bruto
        ]);
        return result.rows[0].id;
    },

    // === COBRANÇA + DUPLICATAS ===
    inserirCobranca: async (cob) => {
        const result = await pool.query(`
            INSERT INTO nfe_cobranca
            (numero_fatura, valor_origem, valor_desconto, valor_liquido)
            VALUES ($1,$2,$3,$4)
            RETURNING id
        `, [
            cob.numero_fatura, cob.valor_original,
            cob.valor_desconto, cob.valor_liquido
        ]);
        return result.rows[0].id;
    },

    inserirDuplicata: async (id_cobranca, dup) => {
        await pool.query(`
            INSERT INTO nfe_duplicatas
            (id_cobranca, numero, vencimento, valor)
            VALUES ($1,$2,$3,$4)
        `, [
            id_cobranca,
            dup.numero,
            dup.vencimento,
            dup.valor
        ]);
    },

    // === PAGAMENTO ===
    inserirPagamento: async (pag) => {
        const result = await pool.query(`
            INSERT INTO nfe_pagamentos
            (forma_pagamento, indicador_pagamento, valor)
            VALUES ($1,$2,$3)
            RETURNING id
        `, [
            pag.forma_pagamento,
            pag.indicador_pagamento,
            pag.valor_pagamento
        ]);
        return result.rows[0].id;
    },

    inserirIcmsTot: async (icms) => {
        const result = await pool.query(`
        INSERT INTO nfe_icms_tot (
            vBC, vICMS, vICMSDeson, vFCP, vBCST, vST, vFCPST, vFCPSTRet,
            vProd, vFrete, vSeg, vDesc, vII, vIPI, vIPIDevol,
            vPIS, vCOFINS, vOutro, vNF
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
            $11,$12,$13,$14,$15,$16,$17,$18,$19
        )
        RETURNING id
    `, [
            icms.vBC,
            icms.vICMS,
            icms.vICMSDeson,
            icms.vFCP,
            icms.vBCST,
            icms.vST,
            icms.vFCPST,
            icms.vFCPSTRet,
            icms.vProd,
            icms.vFrete,
            icms.vSeg,
            icms.vDesc,
            icms.vII,
            icms.vIPI,
            icms.vIPIDevol,
            icms.vPIS,
            icms.vCOFINS,
            icms.vOutro,
            icms.vNF
        ]);

        return result.rows[0].id;
    },

    // === CABEÇALHO NFE ===
    inserirNFe: async (dadosNF) => {

        const {
            id_emitente, id_fornecedor, id_destinatario,
            id_transporte, id_cobranca, id_pagamento, id_icms_totais,

            numero, serie, modelo, chave,
            data_emissao, data_entrada, tipo_nf, finalidade,

            id_nfe, protocolo, natureza_operacao,
            cod_uf, cod_nf, id_dest, cod_municipio,
            tp_imp, tp_emissao, cod_verificacao, tipo_ambiente,
            finalidade_nf, consumidor_final, ind_pres, ind_intermed,
            proc_emi, ver_proc,

            versao_aplicacao, dig_val, status, motivo,  xml_json
        } = dadosNF;

        const sql = `
        INSERT INTO nfe_entrada (
            id_emitente, id_fornecedor, id_destinatario,
            id_transporte, id_cobranca, id_pagamento, id_icms_totais,

            numero, serie, modelo, chave_acesso,
            data_emissao, data_recebimento, tipo_nf, finalidade,
            id_nfe, protocolo, natureza_operacao, cod_uf, cod_nf,

            id_dest, cod_municipio, tp_imp, tp_emissao,
            cod_verificacao, tipo_ambiente, finalidade_nf,
            consumidor_final, ind_pres, ind_intermed,
            proc_emi, ver_proc,

            versao_aplicacao, dig_val, status, motivo, xml_json
        )
        VALUES (
            $1, $2, $3,
            $4, $5, $6, $7,

            $8, $9, $10, $11,
            $12, $13, $14, $15,
            $16, $17, $18, $19, $20,

            $21, $22, $23, $24,
            $25, $26, $27,
            $28, $29, $30,
            $31, $32,

            $33, $34, $35, $36, $37
        )
        RETURNING id
    `;

        const params = [
            id_emitente, id_fornecedor, id_destinatario,
            id_transporte, id_cobranca, id_pagamento, id_icms_totais,

            numero, serie, modelo, chave,
            data_emissao, data_entrada, tipo_nf, finalidade,
            id_nfe, protocolo, natureza_operacao, cod_uf, cod_nf,

            id_dest, cod_municipio, tp_imp, tp_emissao,
            cod_verificacao, tipo_ambiente, finalidade_nf,
            consumidor_final, ind_pres, ind_intermed,
            proc_emi, ver_proc,

            versao_aplicacao, dig_val, status, motivo, xml_json
        ];

        const result = await pool.query(sql, params);
        return result.rows[0].id;
    },


    inserirAssinatura: async (idNFe, assinatura) => {
        const sql = `
        INSERT INTO nfe_signature (
            id_nfe_entrada,
            canonical_method,
            signature_method,
            reference_uri,
            digest_method,
            digest_value,
            signature_value,
            x509_certificate
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id
    `;

        const params = [
            idNFe,
            assinatura.canonical_method,
            assinatura.signature_method,
            assinatura.reference_uri,
            assinatura.digest_method,
            assinatura.digest_value,
            assinatura.signature_value,
            assinatura.x509_certificate
        ];

        return pool.query(sql, params);
    },

    // === ITENS + IMPOSTOS (igual você já tinha) ===
    inserirItem: async (id_nfe, item, impostos = {}) => {
        const {
            codigo_produto,
            ean,
            descricao,
            ncm,
            quantidade,
            valor_unitario,
            valor_total,
            numero_item,
            cest,
            cfop,
            unidade,
            valor_frete,
            ind_total,
            ean_trib,
            unidade_trib,
            quantidade_trib,
            valor_unitario_trib
        } = item;

        // 1) INSERE O ITEM
        const result = await pool.query(`
        INSERT INTO nfe_itens
        (id_nfe, codigo_produto, ean, descricao, ncm,
         quantidade, valor_unitario, valor_total, numero_item, cest, cfop, 
         unidade, valor_frete, ind_total, ean_trib, unidade_trib, quantidade_trib, valor_unitario_trib)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        RETURNING id
    `, [
            id_nfe, codigo_produto, ean, descricao, ncm,
            quantidade, valor_unitario, valor_total, numero_item,
            cest, cfop, unidade, valor_frete, ind_total, ean_trib,
            unidade_trib, quantidade_trib, valor_unitario_trib
        ]);

        const id_item = result.rows[0].id;

        // 2) INSERE OS IMPOSTOS DO ICMS10
        await pool.query(`
        INSERT INTO nfe_item_impostos (
            id_item,
            icms_origem,
            icms_cst,
            icms_mod_bc,
            icms_base,
            icms_aliquota,
            icms_valor,
            icms_mod_bc_st,
            icms_mvast,
            icms_base_st,
            icms_aliq_st,
            icms_valor_st,
            icms_p_red_bc,
            ipi_cenq,
            ipi_cst,
            pis_cst,
            pis_vbc,
            pis_ppis,
            pis_valor,
            cofins_cst,
            cofins_vbc,
            cofins_pcofins,
            cofins_valor,
            valor_total_tributos
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
        )
    `, [
            id_item,
            impostos.icms_origem,
            impostos.icms_cst,
            impostos.icms_mod_bc,
            impostos.icms_base,
            impostos.icms_aliquota,
            impostos.icms_valor,
            impostos.icms_mod_bc_st,
            impostos.icms_mvast,
            impostos.icms_base_st,
            impostos.icms_aliq_st,
            impostos.icms_valor_st,
            impostos.icms_p_red_bc,

            impostos.ipi_cenq,
            impostos.ipi_cst,

            impostos.pis_cst,
            impostos.pis_vbc,
            impostos.pis_ppis,
            impostos.pis_valor,

            impostos.cofins_cst,
            impostos.cofins_vbc,
            impostos.cofins_pcofins,
            impostos.cofins_valor,
            impostos.valor_total_tributos
        ]);

        return id_item;
    }
};

module.exports = NFeImportModel;