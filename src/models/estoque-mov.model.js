const pool = require("../config/database2");

const EstoqueMovModel = {

    registrarMovimentacao: async (id_produto, tipo, quantidade, origemTipo, origemId) => {
        return await pool.query(`
            INSERT INTO estoque_movimentacao 
            (id_produto, tipo, quantidade, tipo_origem, id_origem)
            VALUES ($1, $2, $3, $4, $5)
        `, [id_produto, tipo, quantidade, origemTipo, origemId]);
    },

    atualizarEstoqueEntrada: async (id_produto, quantidade) => {
        return await pool.query(`
            UPDATE produtos SET estoque = estoque + $1 WHERE id = $2
        `, [quantidade, id_produto]);
    },

    atualizarEstoqueSaida: async (id_produto, quantidade) => {
        return await pool.query(`
            UPDATE produtos SET estoque = estoque - $1 WHERE id = $2
        `, [quantidade, id_produto]);
    }
};

module.exports = EstoqueMovModel;