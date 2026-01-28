const pool = require('./dbConfig');
const ProfissionalServico = require('../models/profissionalServico');
const Servico = require('../models/servico');
const Profissional = require('../models/profissional');

const profissionalServicoDb = {
    assign: async (profissionalServico) => {
        const { profissional_id, servico_id } = profissionalServico;
        const [result] = await pool.query(
            'INSERT INTO profissionais_servicos (profissional_id, servico_id) VALUES (?, ?)',
            [profissional_id, servico_id]
        );
        return result;
    },

    unassign: async (profissionalServico) => {
        const { profissional_id, servico_id } = profissionalServico;
        const [result] = await pool.query(
            'DELETE FROM profissionais_servicos WHERE profissional_id = ? AND servico_id = ?',
            [profissional_id, servico_id]
        );
        return result;
    },

    getServicesByProfissional: async (profissional_id) => {
        const [rows] = await pool.query(
            `SELECT s.id, s.nome, s.descricao, s.duracao_minutos, s.preco 
             FROM servicos s
             JOIN profissionais_servicos ps ON s.id = ps.servico_id
             WHERE ps.profissional_id = ?`,
            [profissional_id]
        );
        return rows.map(row => new Servico(row.id, row.nome, row.descricao, row.duracao_minutos, row.preco));
    },

    getProfissionaisByService: async (servico_id) => {
        const [rows] = await pool.query(
            `SELECT p.id, p.nome, p.especialidade 
             FROM profissionais p
             JOIN profissionais_servicos ps ON p.id = ps.profissional_id
             WHERE ps.servico_id = ?`,
            [servico_id]
        );
        return rows.map(row => new Profissional(row.id, row.nome, row.especialidade));
    }
};

module.exports = profissionalServicoDb;