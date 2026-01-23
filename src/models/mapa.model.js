const pool = require("../config/database2");

const MapaModel = {
    inserirMapa: async (data, cidade, dados, createdBy, placa, motorista) => {
        const dadosJson = JSON.stringify(dados);

        const sql = `
    INSERT INTO mapa.registro (data, cidade, dados, created_by, status, placa, motorista)
    VALUES ($1::date, $2::varchar, $3::jsonb, $4::varchar, 'editavel', $5::varchar, $6::varchar)
    RETURNING id
  `;
        const result = await pool.query(sql, [data, cidade, dadosJson, String(createdBy), placa, motorista]);
        return result.rows[0].id;
    },
    buscarGases: async () => {
        const result = await pool.query(`SELECT * From mapa.gases`);
        return result.rows;
    },

    inserirGas: async (tipo, tamanho, unidade_medida, tipo_cilindro) => {
        const result = await pool.query(`INSERT INTO mapa.gases(tipo, tamanho, unidade_medida, tipo_cilindro) VALUES($1, $2, $3, $4)
            RETURNING id`, [tipo, tamanho, unidade_medida, tipo_cilindro]);
        return result.rows[0].id;
    },

    buscarMapas: async () => {
        const result = await pool.query(`SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, 
            created_by, modified_by, atualizado_em, status, placa, motorista  From mapa.registro where status = 'editavel' order by data`);
        return result.rows;
    },

    buscarMapasFinalizados: async () => {
        const result = await pool.query(`SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, created_by, 
            modified_by, atualizado_em, status, placa, motorista From mapa.registro where status = 'finalizado' order by data`);
        return result.rows;
    },

    buscarMapasFinalizadosFiltro: async (data, cidade) => {
        let sql = `SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, created_by, modified_by, atualizado_em, status, placa, motorista FROM mapa.registro WHERE status = 'finalizado' AND data = $1`;
        const params = [data];
        if (cidade != null && cidade != '' && cidade != 'null') {
            params.push(`%${cidade}%`);
            sql += ` AND cidade ILIKE $${params.length}`;
        }
        const result = await pool.query(sql, params);
        return result.rows;
    },

    buscarMapasFiltro: async (data, cidade) => {
        let sql = `SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, 
        created_by, modified_by, atualizado_em, status, placa, motorista FROM mapa.registro WHERE status = 'editavel' AND data = $1`;
        const params = [data];
        if (cidade != null && cidade != '' && cidade != 'null') {
            params.push(`%${cidade}%`);
            sql += ` AND cidade ILIKE $${params.length}`;
        }
        const result = await pool.query(sql, params);
        return result.rows;
    },

    buscarMapa: async (id) => {
        let sql = `SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, 
        created_by, modified_by, atualizado_em, status, placa, motorista from mapa.registro where id = $1`;
        const result = await pool.query(sql, [id]);
        return result.rows[0];
    },

    atualizarMapa: async (id, data, cidade, dados, modifiedBy, placa, motorista) => {
        const dadosJson = JSON.stringify(dados);

        const sql = `UPDATE mapa.registro SET data = $1,cidade = $2,dados = $3, atualizado_em = NOW(), modified_by = $5, placa = $6, motorista = $7 WHERE id = $4 RETURNING id`;
        const result = await pool.query(sql, [
            data,
            cidade,
            dadosJson,
            id,
            modifiedBy,
            placa,
            motorista
        ]);

        return result.rows[0];
    },

    finalizarMapa: async (id, modifiedBy) => {
        const sql = `UPDATE mapa.registro SET atualizado_em = NOW(), status = 'finalizado', modified_by = $2 WHERE id = $1 RETURNING id`;
        const result = await pool.query(sql, [
            id, modifiedBy
        ]);

        return result.rows[0];
    }

}


module.exports = MapaModel;