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

   async excluirHorario(id) {
    const query = `DELETE FROM registro_pontos WHERE id = $1`;
    return await pool.query(query, [id]);
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

  async buscarRelatorioSalvo(idfunc, mesReferencia) {
    try {
      const query = `
      SELECT id, json_relatorio, saldo_banco_final, horas_pagas_holerite, mes_referencia,
             created_by, created_at, modified_by, modified_at
      FROM relatorio_banco_horas
      WHERE idfunc = $1 AND mes_referencia = $2
      LIMIT 1;
    `;
      const result = await pool.query(query, [idfunc, mesReferencia]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Erro ao buscar relatório salvo:", error);
      throw error;
    }
  },

  async atualizarRelatorio({
    id,
    jsonRelatorio,
    saldoBancoFinal,
    horasPagasHolerite,
    modifiedBy,
  }) {
    try {
      const query = `
      UPDATE relatorio_banco_horas
      SET json_relatorio = $1,
          saldo_banco_final = $2,
          horas_pagas_holerite = $3,
          modified_by = $4,
          modified_at = NOW()
      WHERE id = $5
      RETURNING id;
    `;

      const values = [
        JSON.stringify(jsonRelatorio),
        saldoBancoFinal,
        horasPagasHolerite,
        modifiedBy,
        id,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar relatório:", error);
      throw error;
    }
  },

  async salvarRelatorio({
    idfunc,
    nomeFuncionario,
    jsonRelatorio,
    saldoBancoFinal,
    horasPagasHolerite,
    mesReferencia,
    createdBy,
  }) {
    const query = `
      INSERT INTO relatorio_banco_horas
        (idfunc, nome_funcionario, json_relatorio, saldo_banco_final, horas_pagas_holerite, mes_referencia, created_by, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id;
    `;

    const values = [
      idfunc,
      nomeFuncionario,
      JSON.stringify(jsonRelatorio),
      saldoBancoFinal,
      horasPagasHolerite,
      mesReferencia,
      createdBy
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },
};


module.exports = BancoDeHoras;