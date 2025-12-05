const pool = require("../config/database2");

module.exports = {
    listar: async () => {
        return await pool.query(`
            SELECT * FROM produtos 
            ORDER BY id DESC
        `);
    },

    buscarPorId: async (id) => {
        return await pool.query(`
            SELECT * FROM produtos WHERE id = $1
        `, [id]);
    },

    buscarNCMs: async () => {
        return await pool.query(`SELECT * from ncm_lista ORDER BY descricao`);
    },

    buscarNCMCodigo: async (codigo) => {
        return await pool.query('Select * from ncm_lista Where codigo = $1', [codigo]);
    },

    buscarFabricantes: async () => {
        return await pool.query('SELECT * from marcas_produto where ativo = true');
    },

    buscarUidades: async () => {
        return await pool.query('SELECT * from unidades_comerciais');
    },

    buscarSetores: async () => {
        return await pool.query('SELECT * from setor_produto');
    },

    buscarGrupos: async () => {
        return await pool.query('SELECT * from grupo_produto');
    },

    criar: async (dados) => {
        const campos = Object.keys(dados);
        const valores = Object.values(dados);
        const params = campos.map((_, i) => `$${i+1}`).join(",");

        return await pool.query(
            `INSERT INTO produtos (${campos.join(",")})
             VALUES (${params})
             RETURNING *`,
            valores
        );
    },

    atualizar: async (id, dados) => {
        const campos = Object.keys(dados);
        const valores = Object.values(dados);
        const sets = campos.map((c, i) => `${c} = $${i+1}`).join(",");

        return await pool.query(
            `UPDATE produtos 
             SET ${sets}, atualizado_em = NOW()
             WHERE id = $${campos.length + 1}
             RETURNING *`,
            [...valores, id]
        );
    },

    excluir: async (id) => {
        return await pool.query(`
            DELETE FROM produtos WHERE id = $1
        `, [id]);
    }
};