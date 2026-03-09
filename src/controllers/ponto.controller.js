const PontoModel = require("../models/ponto.model")

exports.stateToday = async (req, res) => {
  try {
    const idfunc = Number(req.query.idfunc);
    if (!idfunc) {
      return res.status(400).json({ error: "idfunc é obrigatório" });
    }

    const result = await PontoModel.stateToday(idfunc);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar state today:", err);
    return res.status(500).json({ error: "Erro ao buscar state today" });
  }
};