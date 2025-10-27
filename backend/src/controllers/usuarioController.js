const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioDb = require('../db/usuarioDb'); // Import the new DAO

const usuarioController = {
    register: async (req, res) => {
        // O campo 'tipo' é removido do body para segurança.
        // O valor padrão no banco de dados será 'cliente'.
        const { nome, email, senha, telefone } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
        }

        try {
            // Verificar se o email já existe
            const users = await usuarioDb.findByEmail(email);
            if (users.length > 0) {
                return res.status(400).json({ error: 'Este email já está em uso.' });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            // Inserir usuário no banco. O 'tipo' será 'cliente' por padrão.
            const result = await usuarioDb.create(nome, email, hashedPassword, telefone);

            // Retornar o novo usuário criado (sem a senha)
            const newUser = {
                id: result.insertId,
                nome,
                email,
                telefone,
                tipo: 'cliente' // Explicitamente informa o tipo no retorno
            };

            res.status(201).json(newUser);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao registrar o usuário.' });
        }
    },
    login: async (req, res) => {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
        }

        try {
            // Encontrar usuário pelo email
            const users = await usuarioDb.findByEmail(email);
            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const user = users[0];

            // Comparar senhas
            const isMatch = await bcrypt.compare(senha, user.senha);
            if (!isMatch) {
                return res.status(400).json({ error: 'Credenciais inválidas.' });
            }

            // Gerar token JWT
            const payload = {
                id: user.id,
                nome: user.nome,
                tipo: user.tipo
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ token });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao fazer login.' });
        }
    },
    createAdmin: async (req, res) => {
        // Esta é uma rota protegida, então já sabemos que o requisitante é um admin.
        const { nome, email, senha, telefone } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
        }

        try {
            // Verificar se o email já existe
            const users = await usuarioDb.findByEmail(email);
            if (users.length > 0) {
                return res.status(400).json({ error: 'Este email já está em uso.' });
            }

            // Hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            // Inserir usuário no banco com o tipo 'admin'
            const result = await usuarioDb.create(nome, email, hashedPassword, telefone, 'admin');

            const newAdmin = {
                id: result.insertId,
                nome,
                email,
                telefone,
                tipo: 'admin'
            };

            res.status(201).json(newAdmin);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar o administrador.' });
        }
    }
};

module.exports = usuarioController;