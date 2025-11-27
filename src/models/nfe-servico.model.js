const pool = require("../config/database2");

module.exports = {
    criarServico: async ({ id_nfe, descricao, valor_total }) => {
        const result = await pool.query(`
            INSERT INTO nfe_servico
            (id_nfe, descricao, valor_total)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [id_nfe, descricao, valor_total]);

        return result.rows[0].id;
    },

    inserirDocumento: async (id_servico, doc) => {
        const result = await pool.query(`
            INSERT INTO nfe_servico_documento
            (id_servico, tipo_documento, descricao, valor, pdf, nome_arquivo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [
            id_servico,
            doc.tipo_documento,
            doc.descricao,
            doc.valor,
            doc.pdf,
            doc.nome_arquivo
        ]);
        return result.rows[0].id;
    },

    listarServicos: async () => {
        return pool.query(`
            SELECT * FROM nfe_servico ORDER BY id DESC
        `);
    },

    listarDocumentos: async (id_servico) => {
        return pool.query(`
            SELECT * FROM nfe_servico_documento
            WHERE id_servico = $1
            ORDER BY id
        `, [id_servico]);
    },

    deletarDocumento: async (id) => {
        return pool.query(`
            DELETE FROM nfe_servico_documento WHERE id = $1
        `, [id]);
    }
};
