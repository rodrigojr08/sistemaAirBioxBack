const pool = require("../config/database2");
const EstoqueDesfazerModel = require("../models/estqoue-desfazer.model");

exports.desfazerMovimentacao = async (req, res) => {
    const { idMovimentacao } = req.body;

    try {
        await pool.query("BEGIN");

        const movRes = await EstoqueDesfazerModel.buscarMovimentacao(idMovimentacao);

        if (movRes.rowCount === 0) {
            throw new Error("Movimentação não encontrada.");
        }

        const { id_produto, tipo, quantidade } = movRes.rows[0];

        if (tipo === "ENTRADA") {
            await EstoqueDesfazerModel.atualizarEstoqueSubtrair(id_produto, quantidade);
        }
        else if (tipo === "SAIDA") {
            await EstoqueDesfazerModel.atualizarEstoqueSomar(id_produto, quantidade);
        }

        await EstoqueDesfazerModel.deletarMovimentacao(idMovimentacao);

        await pool.query("COMMIT");

        res.status(200).json({ sucesso: true, mensagem: "Movimentação desfeita com sucesso." });

    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(400).json({ sucesso: false, mensagem: error.message });
    }
};