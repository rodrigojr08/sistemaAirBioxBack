const pool = require("../config/database2");

const FornecedorModel = {
    buscarPorCNPJ: async (cnpj) => {
        return await pool.query(
            "SELECT * FROM fornecedores WHERE cnpj = $1",
            [cnpj]
        );
    },

    criar: async (dados) => {
        const {
            razao_social, nome_fantasia, cnpj, ie,
            email, telefone, cep, endereco, numero,
            bairro, cidade, uf
        } = dados;

        const result = await pool.query(`
            INSERT INTO fornecedores
            (razao_social, nome_fantasia, cnpj, ie,
             email, telefone, cep, endereco, numero,
             bairro, cidade, uf)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING id
        `, [
            razao_social, nome_fantasia, cnpj, ie,
            email, telefone, cep, endereco, numero,
            bairro, cidade, uf
        ]);

        return result.rows[0].id;
    }
};

module.exports = FornecedorModel;