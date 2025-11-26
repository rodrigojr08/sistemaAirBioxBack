const pool = require("../config/database2");
const ContasPagarModel = require("../models/contas-pagar.model");

exports.lancarConta = async (req, res) => {
    const {
        id_nfe,
        id_especie,
        id_plano_contas,
        descricao,
        documento,
        observacao,
        parcelas
    } = req.body;

    try {
        await pool.query("BEGIN");

        // Buscar fornecedor vinculado à NF-e
        const nf = await ContasPagarModel.buscarFornecedorDaNFe(id_nfe);

        if (nf.rowCount === 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ erro: "NF não encontrada." });
        }

        const id_fornecedor = nf.rows[0].id_fornecedor;

        const valor_total = parcelas.reduce((soma, p) => soma + Number(p.valor), 0);

        // Inserir conta
        const conta = await ContasPagarModel.inserirContaPagar({
            id_fornecedor,
            id_nfe,
            id_especie,
            id_plano_contas,
            descricao,
            documento,
            observacao,
            valor_total
        });

        const id_conta = conta.rows[0].id;

        // Inserir parcelas
        for (const p of parcelas) {
            await ContasPagarModel.inserirParcela(id_conta, p);
        }

        await pool.query("COMMIT");

        res.json({
            sucesso: true,
            mensagem: "Conta lançada com sucesso!",
            id_conta
        });

    } catch (err) {
        await pool.query("ROLLBACK");
        console.error(err);
        res.status(500).json({
            erro: "Erro ao lançar conta a pagar",
            detalhes: err.message
        });
    }
};