const SyncModel = require("../models/sync.model");

function parseSince(since) {
  if (!since) return null;

  // epoch ms
  if (/^\d+$/.test(String(since))) {
    const ms = Number(since);
    if (!Number.isFinite(ms)) return null;
    return new Date(ms);
  }

  // ISO
  const d = new Date(String(since));
  if (isNaN(d.getTime())) return null;
  return d;
}

exports.syncFuncionarios = async (req, res) => {
  try {
    const sinceRaw = req.query.since;
    const sinceDate = parseSince(sinceRaw) || new Date("1970-01-01T00:00:00.000Z");

    const result = await SyncModel.syncFuncionarios(sinceDate.toISOString());
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao sincronizar funcionarios:", err);
    return res.status(500).json({ error: "Erro ao sincronizar funcionarios" });
  }

};

exports.pushPontos = async (req, res) => {
  try {
    const events = req.body?.events;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "Body inválido. Esperado { events: [...] }" });
    }

    // processa em lote (mas com consistência)
    const acks = await SyncModel.pushPontos(events);

    return res.status(200).json({ acks });
} catch (err) {
  console.error("Erro ao sincronizar pontos:", err);
  console.error("STACK:", err?.stack);
  console.error("BODY:", JSON.stringify(req.body, null, 2));
  return res.status(500).json({ error: "Erro ao sincronizar pontos", details: String(err) });
}
};