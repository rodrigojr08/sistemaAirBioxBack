const Produto = require("../models/produtos.model");

exports.listar = async (req, res) => {
    try {
        const result = await Produto.listar();
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.buscar = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Produto.buscarPorId(id);

        if (result.rowCount === 0)
            return res.status(404).json({ erro: "Produto não encontrado" });

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

exports.criar = async (req, res) => {
    try {
        const dados = req.body;

        const result = await Produto.criar(dados);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
};

exports.atualizar = async (req, res) => {
    try {
        const id = req.params.id;
        const dados = req.body;

        const result = await Produto.atualizar(id, dados);

        if (result.rowCount === 0)
            return res.status(404).json({ erro: "Produto não encontrado" });

        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
};

exports.excluir = async (req, res) => {
    try {
        const id = req.params.id;

        await Produto.excluir(id);

        res.json({ sucesso: true, mensagem: "Produto excluído com sucesso" });
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
};