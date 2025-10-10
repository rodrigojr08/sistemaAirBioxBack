const pool = require("../config/database");


async function buscarFuncionarios(page = 1, limit = 10) {
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
}

module.exports = {
  buscarFuncionarios
}