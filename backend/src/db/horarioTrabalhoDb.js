const pool = require('./dbConfig');
const HorarioTrabalho = require('../models/horarioTrabalho');

const horarioTrabalhoDb = {
    create: async (horarioTrabalho) => {
        const { profissional_id, dia_semana, hora_inicio, hora_fim } = horarioTrabalho;
        const [result] = await pool.query(
            'INSERT INTO horarios_trabalho (profissional_id, dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?, ?)',
            [profissional_id, dia_semana, hora_inicio, hora_fim]
        );
        return result;
    },

    findAll: async (profissional_id = null) => {
        let query = 'SELECT * FROM horarios_trabalho';
        let params = [];
        if (profissional_id) {
            query += ' WHERE profissional_id = ?';
            params.push(profissional_id);
        }
        const [rows] = await pool.query(query, params);
        return rows.map(row => new HorarioTrabalho(row.id, row.profissional_id, row.dia_semana, row.hora_inicio, row.hora_fim));
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM horarios_trabalho WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return new HorarioTrabalho(row.id, row.profissional_id, row.dia_semana, row.hora_inicio, row.hora_fim);
    },

    update: async (id, horarioTrabalho) => {
        const { profissional_id, dia_semana, hora_inicio, hora_fim } = horarioTrabalho;
        const [result] = await pool.query(
            'UPDATE horarios_trabalho SET profissional_id = ?, dia_semana = ?, hora_inicio = ?, hora_fim = ? WHERE id = ?',
            [profissional_id, dia_semana, hora_inicio, hora_fim, id]
        );
        return result;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM horarios_trabalho WHERE id = ?', [id]);
        return result;
    }
};

module.exports = horarioTrabalhoDb;