const profissionalDb = require('../db/profissionalDb');
const Profissional = require('../models/profissional');

const profissionalController = {
    createProfissional: async (req, res) => {
        const { nome, especialidade } = req.body;
        if (!nome) {
            return res.status(400).json({ error: 'O nome é obrigatório.' });
        }
        try {
            const newProfissional = new Profissional(null, nome, especialidade);
            const result = await profissionalDb.create(newProfissional);
            newProfissional.id = result.insertId;
            res.status(201).json(newProfissional);
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
            const profissional = await profissionalDb.findById(req.params.id);
            if (!profissional) {
                return res.status(404).json({ error: 'Profissional não encontrado.' });
            }
            res.json(profissional);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar o profissional.' });
        }
    },

    updateProfissional: async (req, res) => {
        const { nome, especialidade } = req.body;
        try {
            const updatedProfissional = new Profissional(req.params.id, nome, especialidade);
            const result = await profissionalDb.update(req.params.id, updatedProfissional);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Profissional não encontrado.' });
            }
            res.json(updatedProfissional);
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