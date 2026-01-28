const horarioTrabalhoDb = require('../db/horarioTrabalhoDb');
const HorarioTrabalho = require('../models/horarioTrabalho');

const horarioTrabalhoController = {
    createHorario: async (req, res) => {
        const { profissional_id, dia_semana, hora_inicio, hora_fim } = req.body;
        if (!profissional_id || !dia_semana || !hora_inicio || !hora_fim) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        try {
            const newHorario = new HorarioTrabalho(null, profissional_id, dia_semana, hora_inicio, hora_fim);
            const result = await horarioTrabalhoDb.create(newHorario);
            newHorario.id = result.insertId;
            res.status(201).json(newHorario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar o horário de trabalho.' });
        }
    },

    getHorarios: async (req, res) => {
        const { profissional_id } = req.query;
        try {
            const horarios = await horarioTrabalhoDb.findAll(profissional_id);
            res.json(horarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar os horários de trabalho.' });
        }
    },

    getHorarioById: async (req, res) => {
        try {
            const horario = await horarioTrabalhoDb.findById(req.params.id);
            if (!horario) {
                return res.status(404).json({ error: 'Horário de trabalho não encontrado.' });
            }
            res.json(horario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar o horário de trabalho.' });
        }
    },

    updateHorario: async (req, res) => {
        const { profissional_id, dia_semana, hora_inicio, hora_fim } = req.body;
        try {
            const updatedHorario = new HorarioTrabalho(req.params.id, profissional_id, dia_semana, hora_inicio, hora_fim);
            const result = await horarioTrabalhoDb.update(req.params.id, updatedHorario);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Horário de trabalho não encontrado.' });
            }
            res.json(updatedHorario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar o horário de trabalho.' });
        }
    },

    deleteHorario: async (req, res) => {
        try {
            const result = await horarioTrabalhoDb.delete(req.params.id);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Horário de trabalho não encontrado.' });
            }
            res.json({ message: 'Horário de trabalho removido com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao apagar o horário de trabalho.' });
        }
    }
};

module.exports = horarioTrabalhoController;