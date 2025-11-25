const pool = require("../config/database2");

module.exports = {
    // Buscar produto pelo EAN da NF-e
    buscarPorEAN: async (ean) => {
        return await pool.query(`
            SELECT * FROM produtos 
            WHERE ean = $1
        `, [ean]);
    },

    // Atualizar dados do produto via NF-e
    atualizarProdutoPorXml: async (id, dados) => {
        const campos = Object.keys(dados);
        const valores = Object.values(dados);
        const sets = campos.map((c, i) => `${c} = $${i + 1}`).join(",");

        return await pool.query(
            `UPDATE produtos 
             SET ${sets}, atualizado_em = NOW()
             WHERE id = $${campos.length + 1}
             RETURNING *`,
            [...valores, id]
        );
    },

    // Cadastrar novo produto vindo do XML
    criarProdutoPorXml: async (dados) => {
        const campos = Object.keys(dados);             // ean, descricao, ncm, unidade, custo, id_fornecedor
        const valores = Object.values(dados);
        const params = campos.map((_, i) => `$${i + 1}`).join(",");

        return await pool.query(
            `INSERT INTO produtos (
            codigo_interno,
            ${campos.join(",")}
        )
        VALUES (
            (SELECT COALESCE(MAX(codigo_interno), 0) + 1 FROM produtos),
            ${params}
        )
        RETURNING *`,
            valores
        );
    }
};