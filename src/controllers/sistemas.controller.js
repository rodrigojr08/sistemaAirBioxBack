const SistemaModel = require("../models/sistema.model");

// controllers/sistemas.controller.js
exports.registerPage = (req, res) => {
  res.json({ msg: "Bem-vindo ao registro de usuários!" });
};

// Retorna os sistemas pai do usuário
exports.getSistemas = async (req, res) => {
  try {
    const sistemasPai = await SistemaModel.getSistemasPaiByUser(req.userId);
    res.json(sistemasPai);
  } catch (err) {
    console.error("Erro ao buscar sistemas:", err);
    res.status(500).json({ error: "Erro ao buscar sistemas pai" });
  }
};

// Retorna filhos de um sistema pai
exports.getSistemasFilhos = async (req, res) => {
  try {
    const { parentId } = req.params;
    const filhos = await SistemaModel.getSistemasFilhosByUser(req.userId, parentId);
    res.json(filhos);
  } catch (err) {
    console.error("Erro ao buscar sistemas filhos:", err);
    res.status(500).json({ error: "Erro ao buscar sistemas filhos" });
  }
};

// Verifica permissão de rota
exports.checkPermission = async (req, res) => {
  try {
    const { rota } = req.params;
    const permitido = await SistemaModel.hasPermission(req.userId, "/" + rota);
    if (!permitido) return res.status(403).json({ error: "Acesso negado" });
    res.json({ permitido: true });
  } catch (err) {
    console.error("Erro ao verificar permissão:", err);
    res.status(500).json({ error: "Erro ao verificar permissão" });
  }
};