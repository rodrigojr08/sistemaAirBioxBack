const pool = require("../config/database2");
const ClienteModel = require("../models/cliente.model");


exports.cadastrarCliente = async (req, res) => {
    try{
        const { cnpj_cpf, nome, razao_social, fantasia, paciente, pacientes } = req.body;


        const result = await ClienteModel.cadastrarCliente(cnpj_cpf, nome, razao_social, fantasia, paciente, pacientes);

        res.status(200).json({
            success: true,
            message: "Cliente cadastrado com sucesso",
            data: result
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao cadastrar cliente",
            data: error
        });
    }
}

