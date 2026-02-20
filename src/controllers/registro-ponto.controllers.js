const PontoRegistroModel = require("../models/registro-ponto.model");
const pool = require("../config/database");

const MIN_ALMOCO_MIN = 72;

function nextTipoPorUltimo(ultimo) {
    if (!ultimo) return "ENTRADA";
    if (ultimo === "ENTRADA") return "SAIDA_ALMOCO";
    if (ultimo === "SAIDA_ALMOCO") return "RETORNO_ALMOCO";
    if (ultimo === "RETORNO_ALMOCO") return "SAIDA_FINAL";
    return null; // SAIDA_FINAL já foi
}

const PontoRegistroController = {
    registrar: async (req, res) => {
        const client = await pool.connect();
        try {
            // Dados vindos do app (offline-friendly)
            const {
                idfunc,
                nome,
                latitude,
                longitude,
                localizacao_nome,
                event_id
            } = req.body;

            if (!idfunc || !nome) {
                return res.status(400).json({ message: "idfunc e nome são obrigatórios." });
            }

            if (!event_id) {
                return res.status(400).json({ message: "event_id é obrigatório (UUID do app)." });
            }

            await client.query("BEGIN");

            // trava o "dia do funcionário" pra evitar duplicidade por concorrência
            const lockKey = `PONTO:${idfunc}:${new Date().toISOString().slice(0, 10)}`;
            await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [lockKey]);

            // usa horário do servidor (mais confiável)
            const nowRes = await client.query(`SELECT CURRENT_DATE AS data, LOCALTIME(0) AS hora, now() AS ts`);
            const dataAtual = nowRes.rows[0].data; // YYYY-MM-DD
            const horaAtual = nowRes.rows[0].hora; // HH:MM:SS
            const tsAtual = nowRes.rows[0].ts;

            // pega pontos do dia e trava linhas
            const pontos = await PontoRegistroModel.buscarPontosDoDia(client, idfunc, dataAtual);

            if (pontos.length >= 4) {
                throw new Error("Limite de 4 batidas de ponto por dia já foi atingido.");
            }

            const ultimoTipo = pontos.length ? pontos[pontos.length - 1].tipo_ponto : null;
            const proximoTipo = nextTipoPorUltimo(ultimoTipo);

            if (!proximoTipo) {
                throw new Error("Ponto do dia já finalizado (SAIDA_FINAL).");
            }

            // regra almoço: retorno só após 72 min da SAIDA_ALMOCO
            if (proximoTipo === "RETORNO_ALMOCO") {
                const saidaAlmoco = pontos.find(p => p.tipo_ponto === "SAIDA_ALMOCO");
                if (!saidaAlmoco) throw new Error("Sequência inválida: falta SAIDA_ALMOCO.");

                const diffRes = await client.query(
                    `SELECT EXTRACT(EPOCH FROM ($1::timestamp - $2::timestamp))/60 AS diff_min`,
                    [tsAtual, saidaAlmoco.ts_ponto]
                );
                const diffMin = Number(diffRes.rows[0].diff_min);
                if (diffMin < MIN_ALMOCO_MIN) {
                    const faltam = Math.ceil(MIN_ALMOCO_MIN - diffMin);
                    throw new Error(`Retorno do almoço permitido apenas após 1h12. Faltam ~${faltam} min.`);
                }
            }
            // auditoria: device vem do middleware authenticateDevice
            const device_id = req.device?.device_id ?? null;
            const created_by = device_id ?? "ponto-app";

            // insere
            const row = await PontoRegistroModel.inserirPonto(client, {
                idfunc,
                nome,
                data: dataAtual,
                hora: horaAtual,
                tipo_ponto: proximoTipo,
                latitude,
                longitude,
                localizacao_nome,
                created_by,
                device_id,
                event_id: event_id ?? null,
            });

            await client.query("COMMIT");

            return res.json({
                ok: true,
                registro: row,
                status: "SYNCED",
            });

        } catch (err) {
            await client.query("ROLLBACK");

            // erro de unique index (duplicado)
            if (err?.code === "23505") {
                // se veio event_id repetido (reenvio do sync), devolve o registro existente como sucesso
                try {
                    const existing = await pool.query(
                        `SELECT id, idfunc, nome, data, hora, tipo_ponto, created_at, event_id
         FROM registro_pontos
         WHERE event_id = $1
         LIMIT 1`,
                        [event_id]
                    );

                    if (existing.rowCount > 0) {
                        return res.json({
                            ok: true,
                            registro: existing.rows[0],
                            status: "SYNCED",
                            duplicate: true
                        });
                    }
                } catch (e2) {
                    // se a consulta falhar por algum motivo, cai no retorno 409 abaixo
                }

                return res.status(409).json({
                    message: "Registro duplicado (unique constraint).",
                    detail: String(err?.detail ?? "")
                });
            }

            return res.status(400).json({ message: String(err?.message ?? err) });
        } finally {
            client.release();
        }
    }
};

module.exports = PontoRegistroController;