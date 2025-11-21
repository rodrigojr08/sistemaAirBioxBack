const pool = require("../config/database2");

const EstoqueNFeModel = {

    buscarMovimentacoesPorNFe: async (idNFe) => {
        return await pool.query(`
            SELECT em.id, em.id_produto, em.tipo, em.quantidade
            FROM estoque_movimentacao em
            WHERE em.tipo_origem = 'NFE_ENTRADA'
            AND em.id_origem IN (
                SELECT id FROM nfe_itens WHERE id_nfe = $1
            )
        `, [idNFe]);
    },

    atualizarEstoqueSubtrair: async (id_produto, quantidade) => {
        return await pool.query(`
            UPDATE produtos SET estoque = estoque - $1 WHERE id = $2
        `, [quantidade, id_produto]);
    },

    atualizarEstoqueSomar: async (id_produto, quantidade) => {
        return await pool.query(`
            UPDATE produtos SET estoque = estoque + $1 WHERE id = $2
        `, [quantidade, id_produto]);
    },

    deletarMovimentacoesPorNFe: async (idNFe) => {
        return await pool.query(`
            DELETE FROM estoque_movimentacao
            WHERE tipo_origem = 'NFE_ENTRADA'
            AND id_origem IN (
                SELECT id FROM nfe_itens WHERE id_nfe = $1
            )
        `, [idNFe]);
    }
};

module.exports = EstoqueNFeModel;