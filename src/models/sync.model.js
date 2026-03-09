const pool = require("../config/database");

const MIN_ALMOCO_MINUTES = 72;

function toDateYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getLastPontoOfDay(client, idfunc, ymd) {
  const sql = `
    SELECT
      id,
      tipo_ponto,
      (data::timestamp + hora) AS ts
    FROM registro_pontos
    WHERE idfunc = $1 AND data = $2::date
    ORDER BY hora DESC, id DESC
    LIMIT 1;
  `;
  const r = await client.query(sql, [idfunc, ymd]);
  return r.rows[0] || null;
}

function inferNextTipo(lastTipo) {
  if (!lastTipo) return "ENTRADA";
  if (lastTipo === "ENTRADA") return "SAIDA_ALMOCO";
  if (lastTipo === "SAIDA_ALMOCO") return "VOLTA_ALMOCO";
  if (lastTipo === "VOLTA_ALMOCO") return "SAIDA_FINAL";
  return null; // já fechou
}

function addMinutes(dateObj, minutes) {
  return new Date(dateObj.getTime() + minutes * 60 * 1000);
}

const SyncModel = {
  syncFuncionarios: async (sinceIso) => {
    const sql = `
      SELECT
        f.id,
        TRIM(f.nome) AS nome,
        f.email,
        f.cargo,
        f.ativo,
        f.usuario,
        f.nfc_usuario,
        f.foto_file,
        f.updated_at
      FROM funcionarios f
      WHERE f.updated_at > $1::timestamptz
      ORDER BY f.updated_at ASC
      LIMIT 1000;
    `;
    const result = await pool.query(sql, [sinceIso]);
    return result.rows;
  },

  pushPontos: async (events) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const acks = [];

      for (const ev of events) {
        const event_id = ev?.event_id ?? null;

        await client.query("SAVEPOINT sp_event");

        try {
          const idfunc = Number(ev?.idfunc);
          const tsDevice = ev?.timestamp_device;   // ✅ GARANTE QUE EXISTE AQUI
          const device_id = ev?.device_id;

          if (!event_id || !idfunc || !tsDevice || !device_id) {
            acks.push({
              event_id,
              ok: false,
              error: "Campos obrigatórios: event_id, idfunc, timestamp_device, device_id",
            });
            await client.query("ROLLBACK TO SAVEPOINT sp_event");
            await client.query("RELEASE SAVEPOINT sp_event");
            continue;
          }

          const nowDevice = new Date(tsDevice);    // ✅ USO DEPOIS DO CONST
          if (isNaN(nowDevice.getTime())) {
            acks.push({ event_id, ok: false, error: "timestamp_device inválido" });
            await client.query("ROLLBACK TO SAVEPOINT sp_event");
            await client.query("RELEASE SAVEPOINT sp_event");
            continue;
          }

          const ymd = toDateYMD(nowDevice);
          const hora = nowDevice.toTimeString().slice(0, 8);

          // idempotência
          const exists = await client.query(
            `SELECT id, tipo_ponto, created_at FROM registro_pontos WHERE event_id = $1 LIMIT 1;`,
            [event_id]
          );
          if (exists.rows.length > 0) {
            const row = exists.rows[0];
            acks.push({
              event_id,
              ok: true,
              id: row.id,
              tipo_ponto: row.tipo_ponto,
              server_created_at: row.created_at,
            });
            await client.query("RELEASE SAVEPOINT sp_event");
            continue;
          }

          // pega último ponto do dia e decide
          const last = await getLastPontoOfDay(client, idfunc, ymd);
          const nextTipo = inferNextTipo(last?.tipo_ponto || null);

          if (!nextTipo) {
            acks.push({ event_id, ok: false, error: "Dia já finalizado (já existe SAIDA_FINAL)" });
            await client.query("RELEASE SAVEPOINT sp_event");
            continue;
          }

          if (nextTipo === "VOLTA_ALMOCO") {
            if (!last || last.tipo_ponto !== "SAIDA_ALMOCO") {
              acks.push({ event_id, ok: false, error: "Sequência inválida. Esperado SAIDA_ALMOCO antes." });
              await client.query("RELEASE SAVEPOINT sp_event");
              continue;
            }
            const minReturn = addMinutes(new Date(last.ts), MIN_ALMOCO_MINUTES);
            if (nowDevice.getTime() < minReturn.getTime()) {
              acks.push({
                event_id,
                ok: false,
                error: `Retorno do almoço antes do mínimo de 1h12. Mínimo: ${minReturn.toISOString()}`,
              });
              await client.query("RELEASE SAVEPOINT sp_event");
              continue;
            }
          }

          const r = await client.query(
            `
          INSERT INTO registro_pontos
            (idfunc, nome, data, hora, tipo_ponto, latitude, longitude, localizacao_nome,
             created_by, created_at, modified_by, modified_at, event_id, device_id)
          VALUES
            ($1,
            (SELECT TRIM(nome) FROM funcionarios WHERE id=$1),
            $2::date,
            $3::time,
            $4,
            $5,
            $6,
            $7,
            'app',
            NOW(),
            NULL,
            NULL,
            $8,
            $9)
          RETURNING id, tipo_ponto, created_at;
          `,
            [
            idfunc,
            ymd,
            hora,
            nextTipo,
            ev.latitude ?? null,
            ev.longitude ?? null,
            ev.localizacao_nome ?? "Airbiox",
            event_id,
            device_id,
            ]
          );

          acks.push({
            event_id,
            ok: true,
            id: r.rows[0].id,
            tipo_ponto: r.rows[0].tipo_ponto,
            server_created_at: r.rows[0].created_at,
          });

          await client.query("RELEASE SAVEPOINT sp_event");
        } catch (e) {
          await client.query("ROLLBACK TO SAVEPOINT sp_event");
          await client.query("RELEASE SAVEPOINT sp_event");

          console.error("Erro no evento pushPontos:", event_id, e?.stack ?? e);

          acks.push({
            event_id,
            ok: false,
            error: String(e?.message ?? e),
          });
        }
      }

      await client.query("COMMIT");
      return acks;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};

module.exports = SyncModel;