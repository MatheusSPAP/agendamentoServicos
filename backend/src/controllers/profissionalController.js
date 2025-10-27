const profissionalDb = require('../db/profissionalDb'); // Import the new DAO

const profissionalController = {
    createProfissional: async (req, res) => {
        const { nome, especialidade } = req.body;
        if (!nome) {
            return res.status(400).json({ error: 'O nome é obrigatório.' });
        }
        try {
            const result = await profissionalDb.create(nome, especialidade);
            res.status(201).json({ id: result.insertId, ...req.body });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar o profissional.' });
        }
    },

    getProfissionais: async (req, res) => {
        try {
            const profissionais = await profissionalDb.findAll();
            res.json(profissionais);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar os profissionais.' });
        }
    },

    getProfissionalById: async (req, res) => {
        try {
            const profissionais = await profissionalDb.findById(req.params.id);
            if (profissionais.length === 0) {
                return res.status(404).json({ error: 'Profissional não encontrado.' });
            }
            res.json(profissionais[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar o profissional.' });
        }
    },

    updateProfissional: async (req, res) => {
        const { nome, especialidade } = req.body;
        try {
            const result = await profissionalDb.update(req.params.id, nome, especialidade);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Profissional não encontrado.' });
            }
            res.json({ id: req.params.id, ...req.body });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar o profissional.' });
        }
    },

    deleteProfissional: async (req, res) => {
        try {
            const result = await profissionalDb.delete(req.params.id);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Profissional não encontrado.' });
            }
            res.json({ message: 'Profissional removido com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao apagar o profissional.' });
        }
    }
};

module.exports = profissionalController;