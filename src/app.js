const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const sistemaRoutes = require('./routes/sistemas.routes');
const registrosRoutes = require('./routes/registros.routes');
const authenticateToken = require('./middlewares/authenticateToken');
const bancoDeHorasRoutes = require('./routes/banco-de-horas.routes');
const controleDeHorasRoutes = require('./routes/controle-de-horas.routes');
require('dotenv').config();

const app = express(); 
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:8100",         // quando estiver testando local
    "http://192.168.20.50",          // IP do frontend na sua rede
    "http://192.168.20.50:8100",     // caso use Ionic/Angular rodando na porta 8100
    "http://sistema.airbiox.com"      
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Rotas
app.use('/auth', authRoutes);   // 🔹 registra rotas de login/register
app.use('/sistemas', authenticateToken, sistemaRoutes);
app.use('/registros', authenticateToken, registrosRoutes);
app.use('/banco-de-horas', authenticateToken, bancoDeHorasRoutes);
app.use('/controle-de-horas', authenticateToken, controleDeHorasRoutes);

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Usuário autenticado: ${req.userId}` });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor disponível em:`);
  console.log(`➡ Local: http://localhost:${PORT}`);
  console.log(`➡ Rede:  http://${process.env.SERVER_IP || "192.168.20.30"}:${PORT}`);
});