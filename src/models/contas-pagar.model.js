const pool = require("../config/database2");

module.exports = {

    buscarFornecedorDaNFe: async (id_nfe) => {
        return pool.query(`
            SELECT id_fornecedor 
            FROM nfe_entrada 
            WHERE id = $1
        `, [id_nfe]);
    },

    inserirContaPagar: async (dados) => {
        const {
            id_fornecedor,
            id_nfe,
            id_especie,
            id_plano_contas,
            descricao,
            documento,
            observacao,
            valor_total
        } = dados;

        return pool.query(`
            INSERT INTO contas_pagar
            (id_fornecedor, id_nfe, id_especie, id_plano_contas,
             descricao, documento, observacao, valor_total)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id
        `, [
            id_fornecedor, id_nfe,
            id_especie, id_plano_contas,
            descricao, documento, observacao, valor_total
        ]);
    },

    inserirParcela: async (id_conta, parcela) => {
        return pool.query(`
            INSERT INTO contas_pagar_parcelas
            (id_conta, numero_parcela, valor, vencimento)
            VALUES ($1,$2,$3,$4)
        `, [
            id_conta,
            parcela.numero,
            parcela.valor,
            parcela.vencimento
        ]);
    }
};