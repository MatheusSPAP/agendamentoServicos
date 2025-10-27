const pool = require('./dbConfig');

const agendamentoDb = {
    create: async (cliente_id, profissional_id, servico_id, data_hora, status) => {
        const [result] = await pool.query(
            'INSERT INTO agendamentos (cliente_id, profissional_id, servico_id, data_hora, status) VALUES (?, ?, ?, ?, ?)',
            [cliente_id, profissional_id, servico_id, data_hora, status]
        );
        return result;
    },

    findAll: async (cliente_id = null) => {
        let query = `
            SELECT 
                a.id, a.data_hora, a.status,
                c.nome AS cliente_nome, c.email AS cliente_email,
                p.nome AS profissional_nome, p.especialidade AS profissional_especialidade,
                s.nome AS servico_nome, s.descricao AS servico_descricao, s.preco AS servico_preco
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN profissionais p ON a.profissional_id = p.id
            JOIN servicos s ON a.servico_id = s.id
        `;
        let params = [];

        if (cliente_id) {
            query += ' WHERE a.cliente_id = ?';
            params.push(cliente_id);
        }

        const [rows] = await pool.query(query, params);
        return rows;
    },

    findById: async (id) => {
        let query = `
            SELECT 
                a.id, a.data_hora, a.status, a.cliente_id,
                c.nome AS cliente_nome, c.email AS cliente_email,
                p.nome AS profissional_nome, p.especialidade AS profissional_especialidade,
                s.nome AS servico_nome, s.descricao AS servico_descricao, s.preco AS servico_preco
            FROM agendamentos a
            JOIN usuarios c ON a.cliente_id = c.id
            JOIN profissionais p ON a.profissional_id = p.id
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows;
    },

    update: async (id, profissional_id, servico_id, data_hora, status) => {
        const [result] = await pool.query(
            'UPDATE agendamentos SET profissional_id = ?, servico_id = ?, data_hora = ?, status = ? WHERE id = ?',
            [profissional_id, servico_id, data_hora, status, id]
        );
        return result;
    },

    cancel: async (id, cliente_id = null) => {
        let query = 'UPDATE agendamentos SET status = "cancelado" WHERE id = ?';
        let params = [id];

        if (cliente_id) {
            query += ' AND cliente_id = ?';
            params.push(cliente_id);
        }

        const [result] = await pool.query(query, params);
        return result;
    },

    findConflictingAppointments: async (profissional_id, agendamentoFim, agendamentoInicio) => {
        const [conflitos] = await pool.query(
            `SELECT a.id FROM agendamentos a
             JOIN servicos s ON a.servico_id = s.id
             WHERE a.profissional_id = ? AND a.status = 'agendado'
             AND (
                 (a.data_hora < ? AND DATE_ADD(a.data_hora, INTERVAL s.duracao_minutos MINUTE) > ?) OR
                 (? < DATE_ADD(a.data_hora, INTERVAL s.duracao_minutos MINUTE) AND ? > a.data_hora)
             )`,
            [profissional_id, agendamentoFim, agendamentoInicio, agendamentoInicio, agendamentoFim]
        );
        return conflitos;
    },

    findExistingAppointmentsForProfessional: async (profissional_id, data) => {
        const [agendamentosExistentes] = await pool.query(
            `SELECT data_hora, servico_id FROM agendamentos 
             WHERE profissional_id = ? AND DATE(data_hora) = ? AND status = 'agendado'`,
            [profissional_id, data]
        );
        return agendamentosExistentes;
    }
};

module.exports = agendamentoDb;
