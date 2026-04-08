const pool = require("../config/database2");
const pool2 = require("../config/database");

const TabuleiroModalModel = {
    buscarTabuleiros: async (usuario, status) => {
        const userRes = await pool2.query(`select f.nome from funcionarios f inner join users u on f.usuario = u.username where u.id = $1`, [usuario]);

        const result = await pool.query(`select r.*, to_char(r.data::date, 'DD-MM-YYYY') AS data_filtrada, c.total, s.descricao status from tabuleiro.registro r 
            inner join tabuleiro.carga_json c on r.id_carga_json = c.id 
            inner join tabuleiro.status s on s.id = r.id_status 
            where r.motorista = $1 and r.id_status = $2 order by r.data`, [userRes.rows[0].nome, status]);
        return result.rows;
    },

    buscarTabuleirosParaEditar: async (idUser) => {
        const permissaoResult = await pool2.query(`
        select COUNT(s.nome) as permissao
        from users u
        inner join usuario_perfil up on u.username = up.usuario
        inner join sistema_permissao sp on sp.id_perfil = up.id_perfil
        inner join sistema s on s.id = sp.id_sistema
        where u.id = $1 and sp.id_sistema = 36
    `, [idUser]);

        const permissao = Number(permissaoResult.rows[0].permissao);

        if (permissao > 0) {
            const result = await pool.query(`
            select 
                r.id, 
                to_char(r.data::date, 'DD-MM-YYYY') as data, 
                r.cidade, 
                r.placa, 
                r.motorista, 
                s.descricao as status, 
                r.clientes
            from tabuleiro.registro r
            inner join tabuleiro.status s on s.id = r.id_status
            where (r.id_status = 1 or r.id_status = 8 or r.id_status = 9)
              and r.id_mapa is null
        `);

            return result.rows;
        } else {
            throw new Error('Usuário não autorizado');
        }
    },

    selecionarTabuleiro: async (idTabuleiro, idUser) => {
        const permissaoResult = await pool2.query(`
        select COUNT(s.nome) as permissao
        from users u
        inner join usuario_perfil up on u.username = up.usuario
        inner join sistema_permissao sp on sp.id_perfil = up.id_perfil
        inner join sistema s on s.id = sp.id_sistema
        where u.id = $1 and sp.id_sistema = 37 or sp.id_sistema = 38
    `, [idUser]);

        const permissao = Number(permissaoResult.rows[0].permissao);

        if (permissao > 0) {
            const result = await pool.query(`
        SELECT 
            r.*, to_char(r.data_saida::date, 'DD-MM-YYYY') AS data_saida_filtrado, to_char(r.data_retorno::date, 'DD-MM-YYYY') AS data_retorno_filtrado, 
            c.carga AS dados_carga, 
            c.total AS total_carga, 
            vc.dados AS dados_vazio_cheio, 
            vc.total AS total_vazio_cheio,
            v.venda AS dados_venda, 
            v.total AS total_venda, 
            v.id_vendas 
        FROM tabuleiro.registro r 
        LEFT JOIN tabuleiro.carga_json c 
            ON r.id_carga_json = c.id 
        LEFT JOIN tabuleiro.vazio_cheio_json vc 
            ON r.id_vazio_cheio_json = vc.id
        LEFT JOIN tabuleiro.venda_json v 
            ON r.id_venda_json = v.id
        WHERE r.id = $1
    `, [idTabuleiro]);

            if (result.rows.length === 0) return null;

            const row = result.rows[0];

            // 🔹 Coleta os IDs dos conferentes
            const ids = [
                row.conferente_id_finalizacao,
                row.conferente_id_retorno,
                row.conferente_id_saida,
            ].filter((x) => x != null);

            if (ids.length > 0) {
                const nomesRes = await pool2.query(
                    `SELECT id, nome FROM users WHERE id = ANY($1::int[])`,
                    [ids]
                );

                const map = new Map(
                    nomesRes.rows.map((u) => [u.id, u.nome])
                );

                row.conferente_finalizacao_nome =
                    map.get(row.conferente_id_finalizacao)?.trim() ?? null;

                row.conferente_retorno_nome =
                    map.get(row.conferente_id_retorno)?.trim() ?? null;

                row.conferente_saida_nome =
                    map.get(row.conferente_id_saida)?.trim() ?? null;
            } else {
                row.conferente_finalizacao_nome = null;
                row.conferente_retorno_nome = null;
                row.conferente_saida_nome = null;
            }

            return row;
        }
    },

    tabuleiroSelecionadoParaEditar: async (id, idUser) => {
        const permissaoResult = await pool2.query(`
        select COUNT(s.nome) as permissao
        from users u
        inner join usuario_perfil up on u.username = up.usuario
        inner join sistema_permissao sp on sp.id_perfil = up.id_perfil
        inner join sistema s on s.id = sp.id_sistema
        where u.id = $1 and sp.id_sistema = 36
    `, [idUser]);

        const permissao = Number(permissaoResult.rows[0].permissao);

        if (permissao > 0) {
            const result = await pool.query(`select r.id, data, TRIM(r.cidade) AS cidade,
            TRIM(r.placa) AS placa, TRIM(r.motorista) AS motorista, c.carga AS dados, c.total, 
            r.balcao, r.id_status, r.id_carga_json, r.clientes from tabuleiro.registro r
            inner join tabuleiro.carga_json c 
            on r.id_carga_json = c.id
            where r.id = $1;`, [id]);
            return result.rows[0];
        }
    },

    buscarTabuleirosFinalizadosConferente: async (data, cidade, usuario) => {
        const userVigia = await pool2.query('select cargo from funcionarios f inner join users u on f.usuario = u.username where u.id = $1', [usuario])
        const cargo = userVigia.rows[0]?.cargo?.trim() ?? '';
        if (cargo === 'Motorista') {
            throw new Error('Usuário não autorizado');
        }

        let sql = `select r.id, to_char(r.data::date, 'DD-MM-YYYY') AS data, r.cidade, r.placa, r.motorista, s.descricao status, r.clientes from tabuleiro.registro r
        inner join tabuleiro.status s on s.id = r.id_status
        where (conferente_id_finalizacao = $1 or conferente_id_retorno = $1 or conferente_id_saida = $1) AND r.id_status = 7`;

        let params = [usuario];

        if (data) {
            sql += ` AND r.data::date = $${params.length + 1}`;
            params.push(data);
        }

        if (cidade?.trim()) {
            sql += ` AND r.cidade ILIKE $${params.length + 1}`;
            params.push(`%${cidade}%`);
        }

        const result = await pool.query(sql, params);
        return result.rows;

    },

    buscarTodosTabuleiros: async (data, outros, page, pageSize, idUser) => {
        const permissaoResult = await pool2.query(`
        select COUNT(s.nome) as permissao
        from users u
        inner join usuario_perfil up on u.username = up.usuario
        inner join sistema_permissao sp on sp.id_perfil = up.id_perfil
        inner join sistema s on s.id = sp.id_sistema
        where u.id = $1 and sp.id_sistema = 37
    `, [idUser]);

        const permissao = Number(permissaoResult.rows[0].permissao);

        if (permissao > 0) {
            let baseSql = `
    FROM tabuleiro.registro r
    INNER JOIN tabuleiro.status s ON s.id = r.id_status
  `;

            const whereParts = [];
            const params = [];

            if (data) {
                params.push(data);
                whereParts.push(`r.data::date = $${params.length}::date`);
            }

            if (outros?.trim()) {
                const term = `%${outros.trim()}%`;
                params.push(term);
                whereParts.push(`
      (
        r.cidade ILIKE $${params.length}
        OR r.placa ILIKE $${params.length}
        OR r.motorista ILIKE $${params.length}
        OR s.descricao ILIKE $${params.length}
        OR r.clientes::text ILIKE $${params.length}
      )
    `);
            }

            const whereSql = whereParts.length ? ` WHERE ${whereParts.join(" AND ")}` : "";

            // 1) total
            const totalRes = await pool.query(
                `SELECT COUNT(*)::int AS total ${baseSql} ${whereSql}`,
                params
            );
            const total = totalRes.rows[0]?.total ?? 0;

            // 2) itens paginados
            const offset = (Number(page) - 1) * Number(pageSize);

            const params2 = [...params];
            params2.push(pageSize);
            const limitPos = params2.length;

            params2.push(offset);
            const offsetPos = params2.length;

            const dataSql = `
    SELECT
      r.id,
      to_char(r.data::date, 'DD-MM-YYYY') AS data,
      r.cidade,
      r.placa,
      r.motorista,
      s.descricao AS status,
      r.clientes
    ${baseSql}
    ${whereSql}
    ORDER BY r.data DESC, r.id DESC
    LIMIT $${limitPos} OFFSET $${offsetPos}
  `;

            const result = await pool.query(dataSql, params2);

            return {
                page: Number(page),
                pageSize: Number(pageSize),
                total,
                totalPages: Math.ceil(total / Number(pageSize)),
                items: result.rows,
            };
        }
    },

    buscarTodosTabuleirosFinalizados: async (data, outros, page, pageSize, idUser) => {

        const permissaoResult = await pool2.query(`
        select COUNT(s.nome) as permissao
        from users u
        inner join usuario_perfil up on u.username = up.usuario
        inner join sistema_permissao sp on sp.id_perfil = up.id_perfil
        inner join sistema s on s.id = sp.id_sistema
        where u.id = $1 and sp.id_sistema = 38
    `, [idUser]);

        const permissao = Number(permissaoResult.rows[0].permissao);

        if (permissao > 0) {
            let baseSql = `
        FROM tabuleiro.registro r
        INNER JOIN tabuleiro.status s ON s.id = r.id_status
    `;

            const whereParts = [];
            const params = [];

            // filtro fixo de finalizado
            params.push('%finalizado%');
            whereParts.push(`s.descricao ILIKE $${params.length}`);

            if (data) {
                params.push(data);
                whereParts.push(`r.data::date = $${params.length}::date`);
            }

            if (outros?.trim()) {
                const term = `%${outros.trim()}%`;
                params.push(term);
                whereParts.push(`
            (
                r.cidade ILIKE $${params.length}
                OR r.placa ILIKE $${params.length}
                OR r.motorista ILIKE $${params.length}
                OR s.descricao ILIKE $${params.length}
                OR r.clientes::text ILIKE $${params.length}
            )
        `);
            }

            const whereSql = whereParts.length ? ` WHERE ${whereParts.join(" AND ")}` : "";

            const totalRes = await pool.query(
                `SELECT COUNT(*)::int AS total ${baseSql} ${whereSql}`,
                params
            );
            const total = totalRes.rows[0]?.total ?? 0;

            const offset = (Number(page) - 1) * Number(pageSize);

            const params2 = [...params];
            params2.push(pageSize);
            const limitPos = params2.length;

            params2.push(offset);
            const offsetPos = params2.length;

            const dataSql = `
        SELECT
            r.id,
            to_char(r.data::date, 'DD-MM-YYYY') AS data,
            r.cidade,
            r.placa,
            r.motorista,
            s.descricao AS status,
            r.clientes
        ${baseSql}
        ${whereSql}
        ORDER BY r.data DESC, r.id DESC
        LIMIT $${limitPos} OFFSET $${offsetPos}
    `;

            const result = await pool.query(dataSql, params2);

            return {
                page: Number(page),
                pageSize: Number(pageSize),
                total,
                totalPages: Math.ceil(total / Number(pageSize)),
                items: result.rows,
            };
        }
    },

    buscarTabuleiroFinalizadoConferente: async (id_tabuleiro) => {
        const balcao = await pool.query(
            `select balcao from tabuleiro.registro where id = $1`,
            [id_tabuleiro]
        );

        const ehBalcao = Boolean(balcao.rows[0]?.balcao);

        let sql;
        if (ehBalcao) {
            sql = `
      SELECT r.id, r.id_carga_json, r.id_venda_json, r.id_vazio_cheio_json,
        to_char(r.data::date, 'DD-MM-YYYY') AS data,
        r.horario_saida, r.horario_retorno, r.conferente_id_saida, r.motorista, r.cidade, r.placa,
        to_char(r.data_saida::date, 'DD-MM-YYYY') AS data_saida,
        to_char(r.data_retorno::date, 'DD-MM-YYYY') AS data_retorno,
        to_char(r.data_finalizacao::date, 'DD-MM-YYYY') AS data_finalizacao,
        r.horario_finalizacao, r.balcao,
        r.conferente_id_retorno, r.conferente_id_finalizacao,
        c.total AS total_carga,
        v.total AS total_vendas,
        v.venda AS dados,
        v.id_vendas AS id_vendas,
        r.clientes
      FROM tabuleiro.registro r
      INNER JOIN tabuleiro.carga_json c ON r.id_carga_json = c.id
      INNER JOIN tabuleiro.venda_json v ON r.id_venda_json = v.id
      WHERE r.id = $1
    `;
        } else {
            sql = `
      SELECT r.id, r.id_carga_json, r.id_venda_json, r.id_vazio_cheio_json,
        to_char(r.data::date, 'DD-MM-YYYY') AS data,
        r.horario_saida, r.horario_retorno, r.conferente_id_saida, r.motorista, r.cidade, r.placa,
        to_char(r.data_saida::date, 'DD-MM-YYYY') AS data_saida,
        to_char(r.data_retorno::date, 'DD-MM-YYYY') AS data_retorno,
        to_char(r.data_finalizacao::date, 'DD-MM-YYYY') AS data_finalizacao,
        r.horario_finalizacao, r.balcao,
        r.conferente_id_retorno, r.conferente_id_finalizacao,
        c.total AS total_carga,
        vc.total AS total_vazio_cheio,
        v.total AS total_vendas,
        v.venda AS dados,
        v.id_vendas AS id_vendas,
        r.clientes
      FROM tabuleiro.registro r
      INNER JOIN tabuleiro.carga_json c ON r.id_carga_json = c.id
      INNER JOIN tabuleiro.vazio_cheio_json vc ON r.id_vazio_cheio_json = vc.id
      INNER JOIN tabuleiro.venda_json v ON r.id_venda_json = v.id
      WHERE r.id = $1
    `;
        }

        const result = await pool.query(sql, [id_tabuleiro]);
        if (result.rows.length === 0) return [];

        const row = result.rows[0];

        const ids = [
            row.conferente_id_finalizacao,
            row.conferente_id_retorno,
            row.conferente_id_saida,
        ].filter((x) => x != null);

        if (ids.length > 0) {
            const nomesRes = await pool2.query(
                `SELECT id, nome FROM users WHERE id = ANY($1::int[])`,
                [ids]
            );

            const map = new Map(nomesRes.rows.map((u) => [u.id, u.nome]));

            row.conferente_finalizacao_nome = map.get(row.conferente_id_finalizacao)?.trim() ?? null;
            row.conferente_retorno_nome = map.get(row.conferente_id_retorno)?.trim() ?? null;
            row.conferente_saida_nome = map.get(row.conferente_id_saida)?.trim() ?? null;
        } else {
            row.conferente_finalizacao_nome = null;
            row.conferente_retorno_nome = null;
            row.conferente_saida_nome = null;
        }

        return row;
    },

    buscarTabuleiroParaEditar: async (id, usuario) => {
        const result = await pool.query(`select r.*, vc.total, s.descricao status, vc.dados from tabuleiro.registro r 
            inner join tabuleiro.vazio_cheio_json vc on r.id_vazio_cheio_json = vc.id 
            inner join tabuleiro.status s on s.id = r.id_status 
            where r.motorista_id = $2 and r.id_status = 4 and r.id = $1 order by r.data`, [id, usuario]);
        return result.rows[0];
    },

    buscarTabuleirosDoConferente: async (status, user_id) => {
        const userVigia = await pool2.query('select cargo from funcionarios f inner join users u on f.usuario = u.username where u.id = $1', [user_id])
        const cargo = userVigia.rows[0]?.cargo?.trim() ?? '';
        if (cargo === 'Motorista') {
            throw new Error('Usuário não autorizado');
        }

        const result = await pool.query(`select r.id, r.cidade, to_char(r.data::date, 'DD-MM-YYYY') AS data, r.motorista, r.placa, c.total, s.descricao status, r.clientes from tabuleiro.registro r
            inner join tabuleiro.carga_json c on r.id_carga_json = c.id
            inner join tabuleiro.status s on s.id = r.id_status
            where r.id_status = $1 order by r.data`, [status]);
        return result.rows;
    },

    buscarTabuleiroPorId: async (id) => {

        const result = await pool.query(`select r.*, c.total, s.descricao status, c.carga dados from tabuleiro.registro r 
            inner join tabuleiro.carga_json c on r.id_carga_json = c.id 
            inner join tabuleiro.status s on s.id = r.id_status 
            where r.id = $1 order by r.data`, [id]);
        return result.rows;
    },

    buscarTabuleiroDoConferentePorIdSaida: async (id) => {

        const result = await pool.query(`select r.*, to_char(r.data::date, 'DD-MM-YYYY') AS data_venda_retorno, c.total, s.descricao status, c.carga dados from tabuleiro.registro r 
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

    buscarTabuleirosNaoFinalizado: async (idUser) => {
        const result = await pool.query(`select r.id, to_char(r.data::date, 'DD-MM-YYYY') AS data, 
            TRIM(r.cidade) AS cidade, TRIM(r.placa) AS placa, TRIM(r.motorista) AS motorista, TRIM(s.descricao) AS status from tabuleiro.registro r inner join tabuleiro.status s on s.id = r.id_status
            where (id_status != 7 AND id_status != 6 AND id_status != 10 and id_status != 1) and motorista_id = $1::integer`, [idUser])
        return result.rows;
    },

    inserirTabuleiro: async (
        data, cidade, dados, createdBy, placa, motorista,
        quantidade_total, balcao, venda_retorno, clientes
    ) => {
        const permissaoResult = await pool2.query(`
        select COUNT(s.nome) as permissao
        from users u
        inner join usuario_perfil up on u.username = up.usuario
        inner join sistema_permissao sp on sp.id_perfil = up.id_perfil
        inner join sistema s on s.id = sp.id_sistema
        where u.id = $1 and sp.id_sistema = 35
    `, [createdBy]);

        const permissao = Number(permissaoResult.rows[0].permissao);

        if (permissao > 0) {
            const client = await pool.connect();
            try {
                await client.query("BEGIN");

                const dadosJson = JSON.stringify(dados);

                const sql_json_carga = `
      INSERT INTO tabuleiro.carga_json (carga, total)
      VALUES ($1::jsonb, $2::integer)
      RETURNING id;
    `;
                const result_json_carga = await client.query(sql_json_carga, [dadosJson, quantidade_total]);
                const carga_json_id = result_json_carga.rows[0].id;

                const isBalcao = !!balcao; // true/false garantido

                // clientes (se for coluna jsonb)
                const jsonClientes = clientes != null ? JSON.stringify(clientes) : null;

                let sql;
                let params;

                if (!isBalcao) {
                    sql = `
        INSERT INTO tabuleiro.registro
          (data, cidade, id_carga_json, created_by, placa, motorista, created_date, balcao, clientes)
        VALUES
          ($1::date, $2::varchar, $3::integer, $4::varchar, $5::varchar, $6::varchar, NOW(), $7::boolean, $8::jsonb)
        RETURNING id;
      `;
                    params = [data, cidade, carga_json_id, String(createdBy), placa, motorista, isBalcao, jsonClientes];
                } else {
                    const status = (venda_retorno === "Retorno") ? 9 : 8;

                    sql = `
        INSERT INTO tabuleiro.registro
          (data, cidade, id_carga_json, created_by, placa, motorista, created_date, balcao, id_status, clientes)
        VALUES
          ($1::date, $2::varchar, $3::integer, $4::varchar, $5::varchar, $6::varchar, NOW(), $7::boolean, $8::integer, $9::jsonb)
        RETURNING id;
      `;
                    params = [data, cidade, carga_json_id, String(createdBy), placa, motorista, isBalcao, status, jsonClientes];
                }

                const result = await client.query(sql, params);

                await client.query("COMMIT");
                return result.rows[0].id;
            } catch (e) {
                await client.query("ROLLBACK");
                throw e;
            } finally {
                client.release();
            }
        }
    },

    atualizarRetornoCarga: async (dados, idTabuleiro, total) => {
        // 1) Busca o id do json vinculado ao registro
        const idRes = await pool.query(
            `SELECT id_vazio_cheio_json
     FROM tabuleiro.registro
     WHERE id = $1`,
            [idTabuleiro]
        );

        const idVazioCheioJson = idRes.rows[0]?.id_vazio_cheio_json;
        if (!idVazioCheioJson) {
            throw new Error("Registro não encontrado ou sem id_vazio_cheio_json.");
        }

        // 2) Atualiza o json + total
        const dadosJson = JSON.stringify(dados);

        const upd = await pool.query(
            `UPDATE tabuleiro.vazio_cheio_json
     SET dados = $1::jsonb,
         total = $2::integer
     WHERE id = $3::integer
     RETURNING id`,
            [dadosJson, total, idVazioCheioJson]
        );

        return upd.rows[0].id;
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

    salvarConferenciaTabuleiro: async (
        id,
        dados,
        total_venda,
        total_carga,
        total_vazio_cheio,
        observacao,
        id_vendas,
        userConferencia
    ) => {
        const dadosJson = JSON.stringify(dados);
        const vendasJson = JSON.stringify(id_vendas);

        const result_conferencia = await pool.query(
            `INSERT INTO tabuleiro.conferencia_json
      (conferencia, total_carga, id_vendas, observacoes, total_venda, total_vazio_cheio) 
     VALUES
      ($1::jsonb, $2::integer, $3::jsonb, $4::text, $5::integer, $6::integer)
     RETURNING id`,
            [dadosJson, total_carga, vendasJson, observacao, total_venda, total_vazio_cheio]
        );

        const result_update_tabuleiro = await pool.query(
            `UPDATE tabuleiro.registro
     SET id_usuario_conferencia = $1,
         id_conferencia_json = $2,
         data_conferencia = NOW(),
         id_status = 10
     WHERE id = $3
     RETURNING *`,
            [userConferencia, result_conferencia.rows[0].id, id]
        );

        return result_update_tabuleiro.rows[0];
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

    salvarAlteracaoTabuleiro: async (id, data, cidade, placa, motorista, balcao, quantidade_total, id_carga_json, dados, clientes) => {
        const dadosClientesJson = JSON.stringify(clientes);
        const sql = `UPDATE tabuleiro.registro SET data = $2, cidade = $3, placa = $4, motorista = $5, balcao = $6, clientes = $7 Where id = $1 RETURNING *`;
        const result = await pool.query(sql, [id, data, cidade, placa, motorista, balcao, dadosClientesJson]);

        const dadosJson = JSON.stringify(dados);

        const sql2 = `UPDATE tabuleiro.carga_json SET carga = $2::jsonb, total = $3::integer where id = $1::integer RETURNING *`;
        await pool.query(sql2, [id_carga_json, dadosJson, quantidade_total]);

        return result.rows[0];
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

    finalizarTabuleiro: async (idTabuleiro, dados, total_venda, userConferente, id_vendas) => {
        const dadosJson = JSON.stringify(dados);
        const jsonVendas = JSON.stringify(id_vendas);
        const sql_json_venda = await pool.query(`INSERT INTO tabuleiro.venda_json (venda, total, id_vendas) VALUES ($1::jsonb, $2::integer, $3::jsonb) RETURNING id`,
            [dadosJson, total_venda, jsonVendas]);
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