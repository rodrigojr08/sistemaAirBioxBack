const Registros = require("../models/registros.model");

exports.salvarRegistros = async (req, res) => {
  try {
    const registros = req.body;

    if (!Array.isArray(registros)) {
      return res.status(400).json({ sucesso: false, mensagem: "Payload inválido" });
    }

    const resultado = await Registros.inserir(registros);

    res.json(resultado);
  } catch (err) {
    console.error("Erro ao salvar registros:", err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
};