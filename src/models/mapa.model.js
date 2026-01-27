const pool = require("../config/database2");

const MapaModel = {
    inserirMapa: async (data, cidade, dados, createdBy, placa, motorista, quantidade_total) => {
        const dadosJson = JSON.stringify(dados);

        const sql = `
    INSERT INTO mapa.registro (data, cidade, dados, created_by, status, placa, motorista, quantidade_total)
    VALUES ($1::date, $2::varchar, $3::jsonb, $4::varchar, 'editavel', $5::varchar, $6::varchar, $7::integer)
    RETURNING id
  `;
        const result = await pool.query(sql, [data, cidade, dadosJson, String(createdBy), placa, motorista, quantidade_total]);
        return result.rows[0].id;
    },
    buscarGases: async () => {
        const result = await pool.query(`SELECT * From mapa.gases order by tipo`);
        return result.rows;
    },
    buscarGas: async (id) => {
        const result = await pool.query(`SELECT * From mapa.gases where id = $1 order by tipo`, [id]);
        return result.rows[0];
    },

    inserirGas: async (tipo, tamanho, unidade_medida, tipo_cilindro) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1️⃣ Insere o gás
            const result = await client.query(
                `INSERT INTO mapa.gases (tipo, tamanho, unidade_medida, tipo_cilindro)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
                [tipo, tamanho, unidade_medida, tipo_cilindro]
            );

            const gasId = result.rows[0].id;

            // 2️⃣ Cria o JSON do gás
            const gasJson = {
                id: gasId,
                tipo,
                tamanho,
                quantidade: 0,
                tipo_cilindro,
                unidade_medida
            };

            // 3️⃣ Insere esse gás em TODOS os registros
            await client.query(
                `
            UPDATE mapa.registro r
            SET dados = COALESCE(r.dados, '[]'::jsonb) || $1::jsonb
            WHERE NOT EXISTS (
                SELECT 1
                FROM jsonb_array_elements(COALESCE(r.dados, '[]'::jsonb)) elem
                WHERE (elem->>'id')::int = $2
            )
            `,
                [JSON.stringify([gasJson]), gasId]
            );

            await client.query('COMMIT');

            return { id: gasId };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    buscarMapas: async () => {
        const result = await pool.query(`SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, 
            created_by, modified_by, atualizado_em, status, placa, motorista, quantidade_total  
            From mapa.registro where status = 'editavel' or status = 'finalizado' order by data`);
        return result.rows;
    },

    buscarMapasConcluidos: async () => {
        const result = await pool.query(`SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, created_by, 
            modified_by, atualizado_em, status, placa, motorista, quantidade_total From mapa.registro where status = 'concluido' order by data`);
        return result.rows;
    },

    buscarMapasConcluidosFiltro: async (data, cidade) => {
        let sql = `SELECT id, data_criacao,  to_char(data::date, 'DD-MM-YYYY') AS data, cidade, dados, created_by, modified_by, atualizado_em, status, placa, motorista, quantidade_total FROM mapa.registro WHERE status = 'concluido' AND data = $1`;
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
        created_by, modified_by, atualizado_em, status, placa, motorista, quantidade_total FROM mapa.registro WHERE status = 'editavel' or status = 'finalizado' AND data = $1`;
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
        created_by, modified_by, atualizado_em, status, placa, motorista, quantidade_total from mapa.registro where id = $1`;
        const result = await pool.query(sql, [id]);
        return result.rows[0];
    },

    atualizarMapa: async (id, data, cidade, dados, modifiedBy, placa, motorista, quantidade_total) => {
        const dadosJson = JSON.stringify(dados);

        const sql = `UPDATE mapa.registro SET data = $1,cidade = $2,dados = $3, atualizado_em = NOW(), modified_by = $5, placa = $6, motorista = $7, quantidade_total = $8 WHERE id = $4 RETURNING id`;
        const result = await pool.query(sql, [
            data,
            cidade,
            dadosJson,
            id,
            modifiedBy,
            placa,
            motorista,
            quantidade_total
        ]);

        return result.rows[0];
    },

    finalizarMapa: async (id, modifiedBy) => {
        const sql = `UPDATE mapa.registro SET atualizado_em = NOW(), status = 'finalizado', modified_by = $2 WHERE id = $1 RETURNING id`;
        const result = await pool.query(sql, [
            id, modifiedBy
        ]);

        return result.rows[0];

    },

    concluirMapa: async (id, modifiedBy) => {
        const sql = `UPDATE mapa.registro SET atualizado_em = NOW(), status = 'concluido', modified_by = $2 WHERE id = $1 RETURNING id`;
        const result = await pool.query(sql, [
            id, modifiedBy
        ]);

        return result.rows[0];

    }

}


module.exports = MapaModel;