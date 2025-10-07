const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, createUser, saveRefreshToken, findRefreshToken } = require('../models/auth.model');
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

        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '18h' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        await saveRefreshToken(
            user.id,
            refreshToken,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        );

        res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
}

async function refreshToken(req, res) {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Token é obrigatório' });
    }

    try {
        const dbToken = await findRefreshToken(token);
        if (!dbToken) {
            return res.status(403).json({ error: 'Token inválido' });
        }

        jwt.verify(token, JWT_REFRESH_SECRET, (err, payload) => {
            if (err) {
                return res.status(403).json({ error: 'Token expirado' });
            }

            const accessToken = jwt.sign(
                { userId: payload.userId },
                JWT_SECRET,
                { expiresIn: '18h' }
            );

            return res.json({ accessToken });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
}

module.exports = { register, login, refreshToken };