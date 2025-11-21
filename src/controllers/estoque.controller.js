const pool = require("../config/database2");
const EstoqueModel = require("../models/estoque.model");

exports.registrarMovManual = async (req, res) => {
    const {
        id_produto,
        id_tipo_mov,
        quantidade,
        quantidade_fisica,
        motivo,
        usuario
    } = req.body;

    try {
        await pool.query("BEGIN");

        const tipoRes = await EstoqueModel.buscarTipoMov(id_tipo_mov);

        if (tipoRes.rowCount === 0) {
            throw new Error("Tipo de movimentação inválido.");
        }

        const tipo = tipoRes.rows[0];

        await EstoqueModel.registrarMovManual({
            id_produto,
            id_tipo_mov,
            quantidade,
            quantidade_fisica,
            motivo,
            usuario
        });

        if (tipo.altera_estoque) {

            if (tipo.operacao === "ENTRADA") {
                await EstoqueModel.atualizarEstoqueEntrada(id_produto, quantidade);
            }

            if (tipo.operacao === "SAIDA") {
                await EstoqueModel.atualizarEstoqueSaida(id_produto, quantidade);
            }

            if (tipo.operacao === "AJUSTE") {
                await EstoqueModel.atualizarPorAjuste(id_produto, quantidade_fisica);
            }
        }

        await pool.query("COMMIT");

        res.status(200).json({ sucesso: true, mensagem: "Movimentação registrada com sucesso" });

    } catch (err) {
        await pool.query("ROLLBACK");
        res.status(400).json({ sucesso: false, mensagem: err.message });
    }
};