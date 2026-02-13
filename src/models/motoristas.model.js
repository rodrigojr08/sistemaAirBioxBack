const pool = require("../config/database");

const MotoristasModel = {
    buscarMotoristas: async () => {
        const result = await pool.query(`select id, TRIM(nome) AS nome, TRIM(email) AS email, TRIM(cargo) AS cargo, 
            TRIM(usuario) AS usuario from funcionarios where cargo = 'Motorista' and ativo = true order by nome`);
        return result.rows;
    }
}

module.exports = MotoristasModel;