const ControleDeHoras = require("../models/controle-de-horas.model");

exports.buscarBancoDeHorasGeral = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const mesAno = req.query.mesAno;

    if (!mesAno) {
      return res.status(400).json({ error: "O parâmetro 'mesAno' é obrigatório." });
    }

    const result = await ControleDeHoras.buscarBancoDeHorasGeral(page, limit, mesAno);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error("Erro ao buscar banco de horas:", err);
    res.status(500).json({ error: "Erro ao buscar banco de horas" });
  }
};