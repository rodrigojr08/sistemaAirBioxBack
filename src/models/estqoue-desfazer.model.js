const pool = require("../config/database2");

const EstoqueDesfazerModel = {

    buscarMovimentacao: async (idMov) => {
        return await pool.query(`
            SELECT id_produto, tipo, quantidade
            FROM estoque_movimentacao
            WHERE id = $1
        `, [idMov]);
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

    deletarMovimentacao: async (idMov) => {
        return await pool.query(`
            DELETE FROM estoque_movimentacao WHERE id = $1
        `, [idMov]);
    }
};

module.exports = EstoqueDesfazerModel;