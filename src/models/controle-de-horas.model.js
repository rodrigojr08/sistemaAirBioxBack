const pool = require("../config/database");

const ControleDeHoras = {
    async buscarBancoDeHorasGeral(page = 1, limit = 10, mesAno) {

        if (!mesAno) {
            throw new Error("O parâmetro 'mesAno' é obrigatório.");
        }

        const offset = (page - 1) * limit;

        const query = `
      SELECT id, nome_funcionario, saldo_banco_final
      FROM relatorio_banco_horas
      WHERE mes_referencia = $3
      ORDER BY id
      LIMIT $1 OFFSET $2
    `;
        const result = await pool.query(query, [limit, offset, mesAno]);

        const countQuery = `
      SELECT COUNT(*) AS total
      FROM relatorio_banco_horas 
      WHERE mes_referencia = $1
    `;
        const countResult = await pool.query(countQuery, [mesAno]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return {
            data: result.rows,
            total,
            totalPages,
            page,
            limit
        };
    },
};

module.exports = ControleDeHoras;