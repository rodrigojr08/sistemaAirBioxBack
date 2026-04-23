const pool = require("../config/database2");

module.exports = {
  cadastrarCliente: async (cnpj_cpf, nome, razao_social, fantasia, paciente, pacientes) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let result;

      if (!razao_social && !fantasia) {
        result = await client.query(
          `INSERT INTO cliente.registro
          (cpf_cnpj, nome, paciente)
          VALUES ($1, $2, $3)
          RETURNING id
          `,
          [cnpj_cpf, nome, paciente]
        );
      } else {
        result = await client.query(
          `INSERT INTO cliente.registro
          (cpf_cnpj, razao_social, fantasia, paciente)
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [cnpj_cpf, razao_social, fantasia, paciente]
        );
      }

      const idCliente = result.rows[0].id;

      if (Array.isArray(pacientes) && pacientes.length > 0) {
        for (const p of pacientes) {
          await client.query(
            `
            INSERT INTO cliente.paciente (nome, cpf, id_cliente)
            VALUES ($1, $2, $3)
            `,
            [p.nome, p.cpf, idCliente]
          );
        }
      }

      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};