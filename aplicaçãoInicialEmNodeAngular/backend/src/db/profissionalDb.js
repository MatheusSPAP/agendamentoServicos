const pool = require('./dbConfig');
const Profissional = require('../models/profissional');

const profissionalDb = {
    create: async (profissional) => {
        const { nome, especialidade } = profissional;
        const [result] = await pool.query(
            'INSERT INTO profissionais (nome, especialidade) VALUES (?, ?)',
            [nome, especialidade]
        );
        return result;
    },

    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM profissionais');
        return rows.map(row => new Profissional(row.id, row.nome, row.especialidade));
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM profissionais WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return new Profissional(row.id, row.nome, row.especialidade);
    },

    update: async (id, profissional) => {
        const { nome, especialidade } = profissional;
        const [result] = await pool.query(
            'UPDATE profissionais SET nome = ?, especialidade = ? WHERE id = ?',
            [nome, especialidade, id]
        );
        return result;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM profissionais WHERE id = ?', [id]);
        return result;
    }
};

module.exports = profissionalDb;