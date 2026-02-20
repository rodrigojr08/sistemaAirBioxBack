const PontoDeviceModel = require("../models/ponto-device.model");
const { sha256 } = require("../utils/crypto");

async function authenticateDevice(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ message: "Token do dispositivo ausente." });
    }

    const token_hash = sha256(token);

    const device = await PontoDeviceModel.findByTokenHash(token_hash);
    if (!device || !device.is_active) {
      return res.status(401).json({ message: "Dispositivo não autorizado." });
    }

    // Atualiza last_seen sem travar o fluxo
    PontoDeviceModel.touchLastSeen(device.id).catch(() => {});

    req.device = device; // disponível nos controllers
    return next();
  } catch (err) {
    return res.status(500).json({
      message: "Erro ao autenticar dispositivo.",
      error: String(err?.message ?? err),
    });
  }
}

module.exports = authenticateDevice;