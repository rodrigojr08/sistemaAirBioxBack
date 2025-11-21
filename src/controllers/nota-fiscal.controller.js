const pool = require("../config/database2");
const NotaFiscal = require("../models/notaFiscal.model");
const EstoqueNFeController = require("./estoqueNFe.controller");

exports.cancelarNFeEntrada = async (req, res) => {
    const { idNFe, motivo = "Cancelamento manual" } = req.body;

    try {
        await pool.query("BEGIN");

        const nfRes = await NotaFiscal.buscarNF(idNFe);

        if (nfRes.rowCount === 0) {
            throw new Error("NF-e não encontrada.");
        }

        if (nfRes.rows[0].status_sefaz === "CANCELADA") {
            throw new Error("NF-e já está cancelada.");
        }

        await EstoqueNFeController._desfazerMovimentacoesInterno(idNFe);

        await NotaFiscal.cancelarNFe(idNFe, motivo);

        await pool.query("COMMIT");

        res.status(200).json({
            sucesso: true,
            mensagem: "NF-e cancelada e estoque revertido."
        });

    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(400).json({ sucesso: false, mensagem: error.message });
    }
};