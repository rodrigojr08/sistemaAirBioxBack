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

exports.inserirHorario = async (req, res) => {
  try {
    const { idfunc, nome, data, hora, tipo_ponto } = req.body;

    if (!idfunc || !nome || !data || !hora || !tipo_ponto) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const createdBy = req.userId;

    const result = await BancoDeHoras.inserirHorario({
      idfunc,
      nome,
      data,
      hora,
      tipo_ponto,
      createdBy,
    });

    res.status(201).json({
      sucesso: true,
      mensagem: "Horário inserido com sucesso!",
      id: result.id,
    });
  } catch (error) {
    console.error("Erro ao inserir horário:", error);
    res.status(500).json({ error: error.message || "Erro interno ao inserir horário." });
  }
};

exports.atualizarHorario = async (req, res) => {
  try {
    const { id, hora } = req.body;

    if (!id || !hora) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes (id e hora)." });
    }

    const modifiedBy = req.userId; // ✅ agora usa o mesmo padrão do seu middleware

    const resultado = await BancoDeHoras.atualizarHorario({
      id,
      hora,
      modifiedBy,
    });

    res.status(200).json({
      sucesso: true,
      mensagem: "Horário atualizado com sucesso!",
      resultado,
    });
  } catch (error) {
    console.error("Erro ao atualizar horário:", error);
    res.status(500).json({
      sucesso: false,
      erro: error.message || "Erro interno ao atualizar horário.",
    });
  }
};


