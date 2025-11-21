const pool = require("../config/database2");

const NotaFiscal = {

    buscarNF: async (idNFe) => {
        return await pool.query(`
            SELECT id, status_sefaz
            FROM nfe_entrada
            WHERE id = $1
        `, [idNFe]);
    },

    cancelarNFe: async (idNFe, motivo) => {
        return await pool.query(`
            UPDATE nfe_entrada
            SET status_sefaz = 'CANCELADA',
                mensagem_sefaz = $2
            WHERE id = $1
        `, [idNFe, motivo]);
    }
};

module.exports = NotaFiscal;