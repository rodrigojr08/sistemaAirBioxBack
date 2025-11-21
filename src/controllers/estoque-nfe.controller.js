const pool = require("../config/database2");
const EstoqueNFeModel = require("../models/estoqueNFe.model");

exports._desfazerMovimentacoesInterno = async (idNFe) => {

    const movRes = await EstoqueNFeModel.buscarMovimentacoesPorNFe(idNFe);

    if (movRes.rowCount === 0)
        throw new Error("Nenhuma movimentação encontrada para esta NF.");

    for (const mov of movRes.rows) {
        const { id_produto, tipo, quantidade } = mov;

        if (tipo === "ENTRADA") {
            await EstoqueNFeModel.atualizarEstoqueSubtrair(id_produto, quantidade);
        }
        else if (tipo === "SAIDA") {
            await EstoqueNFeModel.atualizarEstoqueSomar(id_produto, quantidade);
        }
    }

    return await EstoqueNFeModel.deletarMovimentacoesPorNFe(idNFe);
};