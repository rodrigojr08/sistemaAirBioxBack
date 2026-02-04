const TabuleiroModal = require("../models/tabuleiro.model");

exports.buscarTabuleiros = async (req, res) => {
    try {
        const status = req.params.status;
        const usuario = req.userId;
        const result = await TabuleiroModal.buscarTabuleiros(usuario, status);
        return res.status(200).json(result);
    } catch (err) {
        console.error("Erro ao buscar tabuleiros:", err);
        return res.status(500).json({ error: "Erro ao buscar tabuleiros" });
    }

};

exports.buscarTabuleirosDoConfenrete = async (req, res) => {
  try {
    const status = req.params.status;
    const usuario = req.userId;
    const result = await TabuleiroModal.buscarTabuleirosDoConferente(status, usuario);
    return res.status(200).json(result);
  }catch(err) {
    console.error("Erro ao buscar tabuleiros: ", err);
    return res.status(500).json({ error: "Erro ao buscar tabuleiros"});
  }
};

exports.buscarTabuleiroPorId = async (req, res) => {
  try {
    const usuario = req.userId;
    const result = await TabuleiroModal.buscarTabuleiroPorId(usuario, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Erro ao buscar tabuleiro por ID:", err);
    return res.status(500).json({ error: "Erro ao buscar tabuleiro por ID" });
  }
};

exports.buscarTabuleiroDoConferentePorIdSaida = async (req, res) => {
  try{
    const result = await TabuleiroModal.buscarTabuleiroDoConferentePorIdSaida(req.params.id);
    return res.status(200).json(result);
  }catch (err){
    console.error("Erro ao buscar tabuleiro por ID:", err);
    return res.status(500).json({error: "Erro ao buscar tabuleiro por ID"});
  }
};

exports.buscarTabuleiroDoConferentePorIdRetorno = async (req, res) => {
  try{
    const result = await TabuleiroModal.buscarTabuleiroDoConferentePorIdRetorno(req.params.id);
    return res.status(200).json(result);
  }catch (err){
    console.error("Erro ao buscar tabuleiro por ID:", err);
    return res.status(500).json({error: "Erro ao buscar tabuleiro por ID"});
  }
};

exports.buscarTabuleiroAFinalizar = async (req, res) => {
  try{
    const result = await TabuleiroModal.buscarTabuleiroAFinalizar(req.params.id);
    return res.status(200).json(result);
  }
  catch(err){
    console.error("Erro ao buscar tabuleiro por ID:", err);
    return res.status(500).json({error: "Erro ao buscar tabuleiro não finalizado"});
  }
};

exports.verificarSenhaAssinatura = async (req, res) => {
  try {
    const user_id = req.userId;
    const senha = Number(req.params.senha);

    const valido = await TabuleiroModal.verificarSenhaAssinatura(user_id, senha); // já retorna boolean
    return res.json(valido); // true/false
  } catch (e) {
    console.error("Erro verificarSenhaAssinatura:", e);
    return res.status(500).json(false);
  }
};

exports.inserirTabuleiro = async (req, res) => {
  try {
    const { data, cidade, dados, placa, motorista, quantidade_total } = req.body;

    if (!data || !cidade || !dados || !placa || !motorista || !quantidade_total) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const createdBy = req.userId;

    const id = await TabuleiroModal.inserirTabuleiro(data, cidade, dados, createdBy, placa, motorista, quantidade_total);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Tabuleiro inserido com sucesso!",
      id
    });
  } catch (error) {
    console.error("Erro ao inserir tabuleiro:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao inserir tabuleiro." });
  }
};

exports.inserirRetornoCarga = async (req, res) =>{
try {
    const { id, dados, quantidade_total } = req.body;

    if (!id || !dados || !quantidade_total ) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes." });
    }

    const retorno = await TabuleiroModal.inserirRetornoCarga(id, dados, quantidade_total);
    return res.status(201).json({
      sucesso: true,
      mensagem: "Retorno de carga inserido com sucesso!",
      retorno
    });
  } catch (error) {
    console.error("Erro ao inserir retorno de carga:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao inserir retorno de carga." });
  }
};

exports.salvarConferenciaSaidaConferente = async (req, res) => {
  try{
    const {idTabuleiro} = req.body;
    const userConferente = req.userId;
    if(!idTabuleiro){
      return res.status(400).json({error: "Parâmetro 'id' é obrigadtório"});
    }
    const resultado = await TabuleiroModal.salvarConferenciaSaidaConferente(idTabuleiro, userConferente);
    return res.status(200).json({
      sucesso: true,
      mensagem: "Conferência do motorista salvo com sucesso!",
      resultado
    });

    }catch (error){
      console.error("Erro ao salvar conferência do motorista:", error);
      return res.status(500).json({error: error.message || "Erro interno ao salvar conferência do motorista" });
    }
};

exports.salvarConferenciaRetornoConferente = async (req, res) => {
  try{
    const {idTabuleiro} = req.body;
    const userConferente = req.userId;
    if(!idTabuleiro){
      return res.status(400).json({error: "Parâmetro 'id' é obrigatório"});
    }
    const resultado = await TabuleiroModal.salvarConferenciaRetornoConferente(idTabuleiro, userConferente);
    return res.status(200).json({
      sucesso: true,
      mensagem: "Conferência do motorista salvo com sucesso!",
      resultado
    })
  }catch (error){
    console.error("Erro ao salvar conferência do motorista:", error);
    return res.status(500).json({error: error.message || "Erro interno ao salvar conferência do motorista" });
  }
};

exports.salvarConferenciaMotorista = async (req, res) => {
  try {
    const { idTabuleiro } = req.body;
    if (!idTabuleiro) {
      return res.status(400).json({ error: "Parâmetro 'id' é obrigatório." });
    }

    userMotorista = req.userId;

    const resultado = await TabuleiroModal.salvarConferenciaMotorista(idTabuleiro, userMotorista);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Conferência do motorista salva com sucesso!",
      resultado
    });
  } catch (error) {
    console.error("Erro ao salvar conferência do motorista:", error);
    return res.status(500).json({ error: error.message || "Erro interno ao salvar conferência do motorista." });
  }
};

exports.finalizarTabuleiro = async (req, res) => {
  try {
    const {idTabuleiro, dados, total_vendas } = req.body;
    const userConferente = req.userId;

    if(!idTabuleiro || !dados || !total_vendas){
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes."});
    }

    const resultado = await TabuleiroModal.finalizarTabuleiro(idTabuleiro, dados, total_vendas, userConferente);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Tabuleiro finalizado com sucesso!",
      resultado
    });
  } catch(error) {
    console.error("Erro ao finalizar tabuleiro", error);
    return res.status(500).json({ error: error.message || "Erro interno ao inserir mapa."});
  }
};
