const pool = require('./dbConfig');
const Agendamento = require('../models/agendamento');

const agendamentoDb = {
    create: async (agendamento) => {
        const { cliente_id, profissional_id, servico_id, data_hora, status } = agendamento;
        const [result] = await pool.query(
            'INSERT INTO agendamentos (cliente_id, profissional_id, servico_id, data_hora, status) VALUES (?, ?, ?, ?, ?)',
            [cliente_id, profissional_id, servico_id, data_hora, status]
        );
        return result;
    },

    findAll: async (cliente_id = null) => {
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
        `;
        let params = [];

        if (cliente_id) {
            query += ' WHERE a.cliente_id = ?';
            params.push(cliente_id);
        }

        const [rows] = await pool.query(query, params);
        return rows.map(row => new Agendamento(row.id, row.cliente_id, row.profissional_id, row.servico_id, row.data_hora, row.status));
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
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return new Agendamento(row.id, row.cliente_id, row.profissional_id, row.servico_id, row.data_hora, row.status);
    },

    update: async (id, agendamento) => {
        // Primeiro, obter o agendamento atual para usar valores existentes como fallback
        const [existingRows] = await pool.query('SELECT * FROM agendamentos WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            throw new Error('Agendamento não encontrado');
        }
        const existingAgendamento = existingRows[0];
        
        // Usar valores existentes caso não sejam fornecidos novos valores
        const profissional_id = agendamento.profissional_id !== undefined ? agendamento.profissional_id : existingAgendamento.profissional_id;
        const servico_id = agendamento.servico_id !== undefined ? agendamento.servico_id : existingAgendamento.servico_id;
        const data_hora = agendamento.data_hora !== undefined ? agendamento.data_hora : existingAgendamento.data_hora;
        const status = agendamento.status !== undefined ? agendamento.status : existingAgendamento.status;
        
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

    findConflictingAppointments: async (profissional_id, agendamentoInicio, agendamentoFim) => {
        // Converter datas para o formato adequado para MySQL
        const inicioFormatado = new Date(agendamentoInicio).toISOString().slice(0, 19).replace('T', ' ');
        const fimFormatado = new Date(agendamentoFim).toISOString().slice(0, 19).replace('T', ' ');
        
        const [conflitos] = await pool.query(
            `SELECT a.id, a.cliente_id, a.profissional_id, a.servico_id, a.data_hora, a.status FROM agendamentos a
             JOIN servicos s ON a.servico_id = s.id
             WHERE a.profissional_id = ? AND a.status = 'agendado'
             AND (
                 ? < DATE_ADD(a.data_hora, INTERVAL s.duracao_minutos MINUTE) 
                 AND 
                 ? > a.data_hora
             )`,
            [profissional_id, inicioFormatado, fimFormatado]
        );
        return conflitos.map(row => new Agendamento(row.id, row.cliente_id, row.profissional_id, row.servico_id, row.data_hora, row.status));
    },

    findExistingAppointmentsForProfessional: async (profissional_id, data) => {
        const [agendamentosExistentes] = await pool.query(
            `SELECT a.id, a.cliente_id, a.profissional_id, a.servico_id, a.data_hora, a.status FROM agendamentos a
             WHERE a.profissional_id = ? AND DATE(a.data_hora) = ? AND a.status = 'agendado'`,
            [profissional_id, data]
        );
        return agendamentosExistentes.map(row => new Agendamento(row.id, row.cliente_id, row.profissional_id, row.servico_id, row.data_hora, row.status));
    },

    findAllWithFilters: async (cliente_id = null, status = null, data_inicio = null, data_fim = null, offset = 0, limit = 10) => {
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
        `;
        let params = [];
        const conditions = [];

        // Adicionar condições com base nos filtros
        if (cliente_id) {
            conditions.push('a.cliente_id = ?');
            params.push(cliente_id);
        }

        if (status) {
            conditions.push('a.status = ?');
            params.push(status);
        }

        if (data_inicio) {
            conditions.push('a.data_hora >= ?');
            params.push(data_inicio);
        }

        if (data_fim) {
            conditions.push('a.data_hora <= ?');
            params.push(data_fim);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.data_hora DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        return rows.map(row => new Agendamento(row.id, row.cliente_id, row.profissional_id, row.servico_id, row.data_hora, row.status));
    }
};

module.exports = agendamentoDb;
