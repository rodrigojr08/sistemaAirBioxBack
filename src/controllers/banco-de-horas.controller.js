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