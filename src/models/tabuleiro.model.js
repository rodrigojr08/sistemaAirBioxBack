const pool = require("../config/database2");
const pool2 = require("../config/database");

const TabuleiroModalModel = {
    buscarTabuleiros: async (usuario, status) => {
        const userRes = await pool2.query(`select f.nome from funcionarios f inner join users u on f.usuario = u.username where u.id = $1`, [usuario]);

        const result = await pool.query(`select r.*, c.total, s.descricao status from tabuleiro.registro r 
            inner join tabuleiro.carga_json c on r.id_carga_json = c.id 
            inner join tabuleiro.status s on s.id = r.id_status 
            where r.motorista = $1 and r.id_status = $2 order by r.data`, [userRes.rows[0].nome, status]);
        return result.rows;
    },

    buscarTabuleirosDoConferente: async (status, user_id) => {
        const userVigia = await pool2.query('select cargo from funcionarios f inner join users u on f.usuario = u.username where u.id = $1', [user_id])
        const cargo = userVigia.rows[0]?.cargo?.trim() ?? '';
        if (cargo != 'Vigia Diurno' && cargo != 'T.I' && cargo != 'Proprietario') {
            throw new Error('Usuário não autorizado');
        }

        const result = await pool.query(`select r.*, c.total, s.descricao status from tabuleiro.registro r
            inner join tabuleiro.carga_json c on r.id_carga_json = c.id
            inner join tabuleiro.status s on s.id = r.id_status
            where r.id_status = $1 order by r.data`, [status]);
        return result.rows;
    },

    buscarTabuleiroPorId: async (id) => {

        const result = await pool.query(`select r.*, c.total, s.descricao status, c.carga dados from tabuleiro.registro r 
            inner join tabuleiro.carga_json c on r.id_carga_json = c.id 
            inner join tabuleiro.status s on s.id = r.id_status 
            where r.id = $2 order by r.data`, [id]);
        return result.rows;
    },

    buscarTabuleiroDoConferentePorIdSaida: async (id) => {

        const result = await pool.query(`select r.*, c.total, s.descricao status, c.carga dados from tabuleiro.registro r 
            inner join tabuleiro.carga_json c on r.id_carga_json = c.id 
            inner join tabuleiro.status s on s.id = r.id_status 
            where r.id = $1 order by r.data`, [id])
        return result.rows;
    },

    buscarTabuleiroDoConferentePorIdRetorno: async (id) => {

        const result = await pool.query(`select r.*, vc.total, s.descricao status, vc.dados from tabuleiro.registro r 
            inner join tabuleiro.vazio_cheio_json vc on r.id_vazio_cheio_json = vc.id 
            inner join tabuleiro.status s on s.id = r.id_status 
            where r.id = $1 order by r.data`, [id])
        return result.rows;
    },

    buscarTabuleiroAFinalizar: async (id) => {
                const result = await pool.query(`select r.*, vc.total total_vazio_cheio, s.descricao status, vc.dados vazio_cheio, c.total total_carga, c.carga from tabuleiro.registro r 
            inner join tabuleiro.vazio_cheio_json vc on r.id_vazio_cheio_json = vc.id 
			inner join tabuleiro.carga_json c on r.id_carga_json = c.id
            inner join tabuleiro.status s on s.id = r.id_status  
            where r.id = $1 order by r.data`, [id])
        return result.rows[0];
    },

    inserirTabuleiro: async (data, cidade, dados, createdBy, placa, motorista, quantidade_total) => {
        const dadosJson = JSON.stringify(dados);

        const sql_json_carga = ` INSERT INTO tabuleiro.carga_json (carga, total)
    VALUES ($1::jsonb, $2::integer)
    RETURNING id`;
        const result_json_carga = await pool.query(sql_json_carga, [dadosJson, quantidade_total]);
        const carga_json_id = result_json_carga.rows[0].id;

        const sql = `
    INSERT INTO tabuleiro.registro (data, cidade, id_carga_json, created_by, placa, motorista,  created_date)
    VALUES ($1::date, $2::varchar, $3::integer, $4::varchar, $5::varchar, $6::varchar, NOW())
    RETURNING id
  `;
        const result = await pool.query(sql, [data, cidade, carga_json_id, String(createdBy), placa, motorista]);
        return result.rows[0].id;
    },

    verificarSenhaAssinatura: async (user_id, senha) => {
        const senhaAssinaturaCorreta = await pool2.query(
            `select count(*) 
     from users 
     where id = $1::integer 
       and senha_assinatura = $2::integer`,
            [user_id, senha]
        );

        return Number(senhaAssinaturaCorreta.rows[0]?.count ?? 0) > 0;
    },

    salvarConferenciaMotorista: async (id, userMotorista) => {
        const statusAtual = await pool.query(`SELECT id_status from tabuleiro.registro WHERE id = $1`, [id]);
        if (statusAtual.rows.length === 0) {
            throw new Error("Registro não encontrado.");
        }

        const sql = `UPDATE tabuleiro.registro SET id_status = 2, assinatura_motorista_saida = true, motorista_id = $2 WHERE id = $1`;
        await pool.query(sql, [id, userMotorista]);
    },

    salvarConferenciaSaidaConferente: async (id, userConferente) => {
        const statusAtual = await pool.query(`SELECT id_status from tabuleiro.registro WHERE id = $1`, [id]);
        if (statusAtual.rows.length === 0) {
            throw new Error("Registro não encontrado.");
        }

        const now = new Date();
        const horaAtual = now.toTimeString().slice(0, 8);

        const sql = `UPDATE tabuleiro.registro SET id_status = 3, assinatura_conferente_saida = true, conferente_id_saida = $2, horario_saida = $3, data_saida = NOW()  WHERE id = $1`;
        await pool.query(sql, [id, userConferente, horaAtual]);
    },

    salvarConferenciaRetornoConferente: async (id, userConferente) => {
        const now = new Date();
        const horaAtual = now.toTimeString().slice(0, 8);

        const sql = `UPDATE tabuleiro.registro SET id_status = 5, assinatura_conferente_retorno = true, horario_retorno = $2, data_retorno = NOW(), conferente_id_retorno = $3 WHERE id = $1`;
        await pool.query(sql, [id, horaAtual, userConferente]);
    },


    inserirRetornoCarga: async (id, dados, quantidade) => {
        const dadosJson = JSON.stringify(dados);

        const sql_json_carga = await pool.query(`INSERT INTO tabuleiro.vazio_cheio_json (dados, total)
    VALUES ($1::jsonb, $2::integer)
    RETURNING id`, [dadosJson, quantidade]);
        const id_carga_json = sql_json_carga.rows[0].id;


        const sql = `UPDATE tabuleiro.registro SET id_status = 4, id_vazio_cheio_json = $2, assinatura_motorista_retorno = true WHERE id = $1`;
        const result = await pool.query(sql, [id, id_carga_json]);
        return result.rows[0];
    },

    finalizarTabuleiro: async (idTabuleiro, dados, total_venda, userConferente) =>{
        const dadosJson = JSON.stringify(dados);

        const sql_json_venda = await pool.query(`INSERT INTO tabuleiro.venda_json (venda, total) VALUES ($1::jsonb, $2::integer) RETURNING id`, 
            [dadosJson, total_venda]);
        const id_venda_json = sql_json_venda.rows[0].id;

        const now = new Date();
        const horaAtual = now.toTimeString().slice(0, 8);

        const sql = `UPDATE tabuleiro.registro SET id_status = 7, id_venda_json= $2, conferente_id_finalizacao = $3, data_finalizacao = NOW(),
        horario_finalizacao = $4  WHERE id = $1`

        const result = await pool.query(sql, [idTabuleiro, id_venda_json, userConferente, horaAtual]);
        return result.rows[0];

    }
}


module.exports = TabuleiroModalModel;