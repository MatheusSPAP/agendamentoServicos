const pool = require('./dbConfig');

const servicoDb = {
    create: async (nome, descricao, duracao_minutos, preco) => {
        const [result] = await pool.query(
            'INSERT INTO servicos (nome, descricao, duracao_minutos, preco) VALUES (?, ?, ?, ?)',
            [nome, descricao, duracao_minutos, preco]
        );
        return result;
    },

    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM servicos');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM servicos WHERE id = ?', [id]);
        return rows;
    },

    update: async (id, nome, descricao, duracao_minutos, preco) => {
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