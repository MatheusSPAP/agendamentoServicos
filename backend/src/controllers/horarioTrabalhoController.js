const horarioTrabalhoDb = require('../db/horarioTrabalhoDb'); // Import the new DAO

const horarioTrabalhoController = {
    createHorario: async (req, res) => {
        const { profissional_id, dia_semana, hora_inicio, hora_fim } = req.body;
        if (!profissional_id || !dia_semana || !hora_inicio || !hora_fim) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        try {
            const result = await horarioTrabalhoDb.create(profissional_id, dia_semana, hora_inicio, hora_fim);
            res.status(201).json({ id: result.insertId, ...req.body });
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
            const horarios = await horarioTrabalhoDb.findById(req.params.id);
            if (horarios.length === 0) {
                return res.status(404).json({ error: 'Horário de trabalho não encontrado.' });
            }
            res.json(horarios[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar o horário de trabalho.' });
        }
    },

    updateHorario: async (req, res) => {
        const { profissional_id, dia_semana, hora_inicio, hora_fim } = req.body;
        try {
            const result = await horarioTrabalhoDb.update(req.params.id, profissional_id, dia_semana, hora_inicio, hora_fim);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Horário de trabalho não encontrado.' });
            }
            res.json({ id: req.params.id, ...req.body });
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