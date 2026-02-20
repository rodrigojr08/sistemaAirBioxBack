const PontoDeviceModel = require("../models/ponto-device.model");
const { sha256, randomToken } = require("../utils/crypto");

const PontoDeviceController = {
  enrollDevice: async (req, res) => {
    try {
      const { device_id, activation_code, descricao } = req.body;

      if (!device_id || !activation_code) {
        return res.status(400).json({ message: "device_id e activation_code são obrigatórios." });
      }

      if (!process.env.PONTO_ACTIVATION_CODE) {
        return res.status(500).json({ message: "PONTO_ACTIVATION_CODE não configurado no .env" });
      }

      if (activation_code !== process.env.PONTO_ACTIVATION_CODE) {
        return res.status(401).json({ message: "Código de ativação inválido." });
      }

      const token = randomToken(32);
      const token_hash = sha256(token);

      const device = await PontoDeviceModel.upsertDeviceToken(
        device_id,
        descricao,
        token_hash
      );

      return res.json({
        device_token: token, // token puro só vai pro app
        device_id: device.device_id,
        descricao: device.descricao,
        is_active: device.is_active,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Erro ao ativar dispositivo.",
        error: String(err?.message ?? err),
      });
    }
  },
};

module.exports = PontoDeviceController;