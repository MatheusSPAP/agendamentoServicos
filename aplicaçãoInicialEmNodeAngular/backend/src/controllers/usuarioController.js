const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioDb = require('../db/usuarioDb');
const Usuario = require('../models/usuario');

const usuarioController = {
    register: async (req, res) => {
        const { nome, email, senha, telefone } = req.body;

        const errors = Usuario.validate(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        try {
            const existingUsers = await usuarioDb.findByEmail(email);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'Este email já está em uso.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            const result = await usuarioDb.create(nome, email, hashedPassword, telefone, 'cliente');

            const newUser = new Usuario(result.insertId, nome, email, null, telefone, 'cliente');

            res.status(201).json(newUser.toPublic());

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
            const users = await usuarioDb.findByEmail(email);
            if (users.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            const userRaw = users[0];
            const userInstance = Usuario.fromDatabase(userRaw);

            const isMatch = await bcrypt.compare(senha, userInstance.senha);
            if (!isMatch) {
                return res.status(400).json({ error: 'Credenciais inválidas.' });
            }

            const payload = {
                id: userInstance.id,
                nome: userInstance.nome,
                tipo: userInstance.tipo
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.json({ token });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao fazer login.' });
        }
    },

    createAdmin: async (req, res) => {
        const { nome, email, senha, telefone } = req.body;

        const errors = Usuario.validate(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        try {
            const existingUsers = await usuarioDb.findByEmail(email);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'Este email já está em uso.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(senha, salt);

            const result = await usuarioDb.create(nome, email, hashedPassword, telefone, 'admin');

            const newAdmin = new Usuario(result.insertId, nome, email, null, telefone, 'admin');

            res.status(201).json(newAdmin.toPublic());

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar o administrador.' });
        }
    }
};

module.exports = usuarioController;