const BancoDeHoras = require("../models/banco-de-horas.model");

exports.buscarFuncionarios = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await BancoDeHoras.buscarFuncionarios(page, limit);

        res.status(200).json(result);
    } catch (err) {
        console.error("Erro ao buscar funcionários:", err);
        res.status(500).json({ error: "Erro ao buscar funcionários" });
    }
}

exports.buscarRegPontosMesFunc = async (req, res) => {
  try {
    const { idfunc, mes, ano } = req.query;

    if (!idfunc || !mes || !ano) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const result = await BancoDeHoras.buscarRegPontosMesFunc(idfunc, mes, ano);
    res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar pontos registrados:", err);
    res.status(500).json({ error: err.message || "Erro interno ao buscar pontos registrados" });
  }
};