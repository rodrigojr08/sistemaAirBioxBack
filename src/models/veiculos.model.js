const pool = require("../config/database2");

const VeiculosModel = {
    buscarVeiculos: async () => {
        const result = await pool.query(`SELECT * From veiculos order by id`);
        return result.rows;
    }
}

module.exports = VeiculosModel;