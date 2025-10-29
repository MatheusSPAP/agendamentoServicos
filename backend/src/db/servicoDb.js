const pool = require('./dbConfig');
const Servico = require('../models/servico');

const servicoDb = {
    create: async (servico) => {
        const { nome, descricao, duracao_minutos, preco } = servico;
        const [result] = await pool.query(
            'INSERT INTO servicos (nome, descricao, duracao_minutos, preco) VALUES (?, ?, ?, ?)',
            [nome, descricao, duracao_minutos, preco]
        );
        return result;
    },

    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM servicos');
        return rows.map(row => new Servico(row.id, row.nome, row.descricao, row.duracao_minutos, row.preco));
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM servicos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return new Servico(row.id, row.nome, row.descricao, row.duracao_minutos, row.preco);
    },

    update: async (id, servico) => {
        const { nome, descricao, duracao_minutos, preco } = servico;
        const [result] = await pool.query(
            'UPDATE servicos SET nome = ?, descricao = ?, duracao_minutos = ?, preco = ? WHERE id = ?',
            [nome, descricao, duracao_minutos, preco, id]
        );
        return result;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM servicos WHERE id = ?', [id]);
        return result;
    }
};

module.exports = servicoDb;