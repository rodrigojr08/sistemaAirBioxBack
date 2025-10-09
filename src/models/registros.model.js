const pool = require("../config/database"); 

const Registros = {
  async inserir(registros) {
    let inseridos = 0;

    for (const r of registros) {
      const result = await pool.query(
        `INSERT INTO registro_pontos (idfunc, nome, data, hora)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (idfunc, nome, data, hora) DO NOTHING`,
        [r.id, r.nome, r.data, r.hora]
      );

      if (result.rowCount > 0) {
        inseridos++;
      }
    }

    return { sucesso: true, inseridos };
  }
};

module.exports = Registros;