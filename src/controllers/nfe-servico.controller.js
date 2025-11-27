const ServicoModel = require("../models/nfe-servico.model");

exports.criarServico = async (req, res) => {
    try {
        const { id_nfe, descricao, valor_total } = req.body;

        const id = await ServicoModel.criarServico({
            id_nfe,
            descricao,
            valor_total
        });

        res.json({ sucesso: true, id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao criar serviço" });
    }
};

exports.uploadDocumento = async (req, res) => {
    try {
        const { id_servico, tipo_documento, descricao, valor } = req.body;

        const arquivo = req.file; // PDF vindo do multipart/form-data

        if (!arquivo) {
            return res.status(400).json({ erro: "Nenhum arquivo enviado" });
        }

        const id = await ServicoModel.inserirDocumento(id_servico, {
            tipo_documento,
            descricao,
            valor,
            pdf: arquivo.buffer,
            nome_arquivo: arquivo.originalname
        });

        res.json({ sucesso: true, id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao enviar documento" });
    }
};

exports.listarDocumentos = async (req, res) => {
    try {
        const { id_servico } = req.params;

        const docs = await ServicoModel.listarDocumentos(id_servico);

        res.json(docs.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar documentos" });
    }
};

exports.deletarDocumento = async (req, res) => {
    try {
        const { id } = req.params;

        await ServicoModel.deletarDocumento(id);

        res.json({ sucesso: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao excluir documento" });
    }
};