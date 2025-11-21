const pool = require("../config/database2");
const EstoqueMovModel = require("../models/estoque-mov.model");

exports.movimentarEstoque = async (req, res) => {
    const { id_produto, tipo, quantidade, origemTipo, origemId } = req.body;

    try {
        await pool.query("BEGIN");

        await EstoqueMovModel.registrarMovimentacao(
            id_produto,
            tipo,
            quantidade,
            origemTipo,
            origemId
        );

        if (tipo === "ENTRADA") {
            await EstoqueMovModel.atualizarEstoqueEntrada(id_produto, quantidade);
        }
        else if (tipo === "SAIDA") {
            await EstoqueMovModel.atualizarEstoqueSaida(id_produto, quantidade);
        }

        await pool.query("COMMIT");

        res.status(200).json({ sucesso: true, mensagem: "Estoque movimentado com sucesso." });

    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(400).json({ sucesso: false, mensagem: error.message });
    }
};