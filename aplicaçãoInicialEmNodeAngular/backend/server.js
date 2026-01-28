require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API do Salão de Beleza no ar!');
});

const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

const servicoRoutes = require('./src/routes/servicoRoutes');
app.use('/api/servicos', servicoRoutes);

const profissionalRoutes = require('./src/routes/profissionalRoutes');
app.use('/api/profissionais', profissionalRoutes);

const profissionalServicoRoutes = require('./src/routes/profissionalServicoRoutes');
app.use('/api/profissionais-servicos', profissionalServicoRoutes);

const horarioTrabalhoRoutes = require('./src/routes/horarioTrabalhoRoutes');
app.use('/api/horarios-trabalho', horarioTrabalhoRoutes);

const agendamentoRoutes = require('./src/routes/agendamentoRoutes');
app.use('/api/agendamentos', agendamentoRoutes);

const systemRoutes = require('./src/routes/systemRoutes');
app.use('/api/system', systemRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});