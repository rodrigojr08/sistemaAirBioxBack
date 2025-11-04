const pool = require("../config/database");

const ControleDeHoras = {
    async buscarBancoDeHorasGeral(mesAno) {

        if (!mesAno) {
            throw new Error("O parâmetro 'mesAno' é obrigatório.");
        }

        const query = `
        SELECT r.nome_funcionario, saldo_banco_final
        FROM relatorio_banco_horas r
		inner join funcionarios f on r.idfunc = f.id
		WHERE r.mes_referencia = $1
	    AND f.cargo = 'Motorista'
	    ORDER BY r.id
    `;
        const result = await pool.query(query, [mesAno]);

        return {
            data: result.rows,
        };
    },
};

module.exports = ControleDeHoras;