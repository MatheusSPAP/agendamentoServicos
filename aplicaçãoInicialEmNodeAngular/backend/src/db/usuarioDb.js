const pool = require('./dbConfig');

const usuarioDb = {
    findByEmail: async (email) => {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows;
    },

    create: async (nome, email, hashedPassword, telefone, tipo = 'cliente') => {
        const [result] = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, tipo) VALUES (?, ?, ?, ?, ?)',
            [nome, email, hashedPassword, telefone, tipo]
        );
        return result;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return row;
    }
};

module.exports = usuarioDb;