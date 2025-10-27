const pool = require('./dbConfig');

const profissionalDb = {
    create: async (nome, especialidade) => {
        const [result] = await pool.query(
            'INSERT INTO profissionais (nome, especialidade) VALUES (?, ?)',
            [nome, especialidade]
        );
        return result;
    },

    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM profissionais');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM profissionais WHERE id = ?', [id]);
        return rows;
    },

    update: async (id, nome, especialidade) => {
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