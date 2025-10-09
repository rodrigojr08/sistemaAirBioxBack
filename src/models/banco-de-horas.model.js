const pool = require("../config/database"); 


async function buscarFuncionarios() {
  try {
    const query = `SELECT * FROM funcionarios`;
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error("Erro ao buscar funcionários:", err);
    throw err;
  }
}

module.exports = {
    buscarFuncionarios
}