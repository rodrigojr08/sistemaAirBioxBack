const pool = require("../config/database");

const BancoDeHoras = {
  // 🔹 Busca funcionários paginados
  async buscarFuncionarios(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // busca paginada
    const query = `
      SELECT * FROM funcionarios 
      WHERE ativo = true
      ORDER BY id
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);

    // conta total de registros ativos
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM funcionarios 
      WHERE ativo = true
    `;
    const countResult = await pool.query(countQuery);

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

  // 🔹 Busca registros de pontos de um funcionário em um mês/ano
  async buscarRegPontosMesFunc(idfunc, mes, ano) {
    try {
      if (!idfunc || !mes || !ano) {
        throw new Error("Parâmetros inválidos: idfunc, mes e ano são obrigatórios.");
      }

      const primeiroDia = new Date(ano, mes - 1, 1);
      const ultimoDia = new Date(ano, mes, 0);

      const formatar = (data) => data.toISOString().split("T")[0];
      const dataInicio = formatar(primeiroDia);
      const dataFim = formatar(ultimoDia);

      const query = `
        SELECT id, idfunc, nome, data, hora, tipo_ponto, localizacao_nome
        FROM registro_pontos
        WHERE idfunc = $1
          AND data BETWEEN $2 AND $3
        ORDER BY data ASC, hora ASC
      `;

      const result = await pool.query(query, [idfunc, dataInicio, dataFim]);
      return result.rows;

    } catch (error) {
      throw error;
    }
  },

  async inserirHorario({ idfunc, nome, data, hora, tipo_ponto, createdBy }) {
    const query = `
      INSERT INTO registro_pontos 
        (idfunc, nome, data, hora, tipo_ponto, latitude, longitude, localizacao_nome, created_by, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, NULL, NULL, 'Airbiox', $6, NOW())
      RETURNING id;
    `;

    const values = [idfunc, nome, data, hora, tipo_ponto, createdBy];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async atualizarHorario({ id, hora, modifiedBy }) {
    const query = `
      UPDATE registro_pontos
      SET hora = $1,
          modified_by = $2,
          modified_at = NOW()
      WHERE id = $3
      RETURNING id, hora, modified_by, modified_at;
    `;

    const values = [hora, modifiedBy, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  },
};

module.exports = BancoDeHoras;