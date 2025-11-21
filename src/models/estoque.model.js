const pool = require("../config/database2");

const EstoqueModel = {

    buscarTipoMov: async (id) => {
        return await pool.query(
            `SELECT * FROM tipo_movimentacao WHERE id = $1`,
            [id]
        );
    },

    registrarMovManual: async ({ id_produto, id_tipo_mov, quantidade, quantidade_fisica, motivo, usuario }) => {
        return await pool.query(`
            INSERT INTO estoque_movimentacao_manual
            (id_produto, id_tipo_mov, quantidade, quantidade_fisica, motivo, usuario)
            VALUES ($1,$2,$3,$4,$5,$6)
        `, [
            id_produto,
            id_tipo_mov,
            quantidade,
            quantidade_fisica,
            motivo,
            usuario
        ]);
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
    },

    buscarSaldoAtual: async (id_produto) => {
        return await pool.query(`
            SELECT estoque FROM produtos WHERE id = $1
        `, [id_produto]);
    },

    atualizarPorAjuste: async (id_produto, quantidade_fisica) => {
        return await pool.query(`
            UPDATE produtos SET estoque = $1 WHERE id = $2
        `, [quantidade_fisica, id_produto]);
    }
};

module.exports = EstoqueModel;