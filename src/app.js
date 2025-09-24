const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const sistemaRoutes = require('./routes/sistemas.routes');
const authenticateToken = require('./middlewares/authenticateToken');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Rotas
app.use('/auth', authRoutes);
app.use('/sistemas', authenticateToken, sistemaRoutes);

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Usuário autenticado: ${req.userId}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});