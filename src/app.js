const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const sistemaRoutes = require('./routes/sistemas.routes');
const registrosRoutes = require('./routes/registros.routes');
const authenticateToken = require('./middlewares/authenticateToken');
const bancoDeHorasRoutes = require('./routes/banco-de-horas.routes');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:8100",
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rotas
app.use('/auth', authRoutes);   // 🔹 registra rotas de login/register
app.use('/sistemas', authenticateToken, sistemaRoutes);
app.use('/registros', authenticateToken, registrosRoutes);
app.use('/banco-de-horas', authenticateToken, bancoDeHorasRoutes);

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Usuário autenticado: ${req.userId}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});