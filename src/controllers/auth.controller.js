const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
    findUserByUsername,
    createUser,
    saveRefreshToken,
    findRefreshToken,
    buscarUsuariosModel,
    resetUserPassword,
    getUserPasswordHash,
    updateUserPassword,
    revokeRefreshToken
} = require('../models/auth.model');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/jwt');

async function register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(username, email, hashedPassword);
        res.status(201).json({ newUser });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
}

async function buscarUsuarios(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await buscarUsuariosModel(page, limit);

        res.status(200).json(result);
    } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }

}

async function resetPassword(req, res) {
    const { id } = req.params;
    const novaSenha = '123456';

    try {
        const hashedPassword = await bcrypt.hash(novaSenha, 10);
        const user = await resetUserPassword(id, hashedPassword);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.status(200).json({
            message: 'Senha redefinida com sucesso para 123456!',
            user,
        });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ error: 'Erro ao redefinir senha' });
    }
}

async function login(req, res) {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        if (typeof password !== 'string' || typeof user.hashed_password !== 'string') {
            return res.status(400).json({ error: 'Credenciais inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.hashed_password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const accessToken = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
            { userId: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: '30d' }
        );

        await saveRefreshToken(
            user.id,
            refreshToken,
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );

        res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
}

async function changePassword(req, res) {
    const userId = req.userId; // vem do token
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    try {
        const senhaHash = await getUserPasswordHash(userId);
        if (!senhaHash) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const senhaCorreta = await bcrypt.compare(senhaAtual, senhaHash);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

        const atualizado = await updateUserPassword(userId, novaSenhaHash);
        if (!atualizado) {
            return res.status(500).json({ error: 'Erro ao atualizar senha.' });
        }

        res.status(200).json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ error: 'Erro interno ao alterar senha.' });
    }
}

async function refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: "refreshToken é obrigatório" });
    }

    try {
        const dbToken = await findRefreshToken(refreshToken);

        if (!dbToken) {
            return res.status(403).json({ error: "Token inválido ou expirado" });
        }

        jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, payload) => {
            if (err) {
                console.log("JWT VERIFY ERROR:", err.name, err.message);

                return res.status(403).json({ error: "Token expirado" });
            }

            // 🔁 ROTACIONA TOKEN
            await revokeRefreshToken(refreshToken);

            const newAccessToken = jwt.sign(
                { userId: payload.userId },
                JWT_SECRET,
                { expiresIn: "1h" }
            );

            const newRefreshToken = jwt.sign(
                { userId: payload.userId },
                JWT_REFRESH_SECRET,
                { expiresIn: "30d" }
            );

            await saveRefreshToken(
                payload.userId,
                newRefreshToken,
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            );

            return res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro no servidor" });
    }
}

module.exports = { register, login, refreshToken, resetPassword, changePassword, buscarUsuarios };