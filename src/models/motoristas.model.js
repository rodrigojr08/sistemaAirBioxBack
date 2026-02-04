const pool = require("../config/database");

const MotoristasModel = {
    buscarMotoristas: async () => {
        const result = await pool.query(`select * from funcionarios where cargo = 'Motorista' and ativo = true order by nome`);
        return result.rows;
    }
}

module.exports = MotoristasModel;