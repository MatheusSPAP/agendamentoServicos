const profissionalServicoDb = require('../db/profissionalServicoDb');
const ProfissionalServico = require('../models/profissionalServico');

const profissionalServicoController = {
    assignServiceToProfissional: async (req, res) => {
        const { profissional_id, servico_id } = req.body;
        if (!profissional_id || !servico_id) {
            return res.status(400).json({ error: 'ID do profissional e do serviço são obrigatórios.' });
        }
        try {
            const newProfissionalServico = new ProfissionalServico(profissional_id, servico_id);
            await profissionalServicoDb.assign(newProfissionalServico);
            res.status(201).json({ message: 'Associação criada com sucesso.' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Esta associação já existe.' });
            }
            console.error(error);
            res.status(500).json({ error: 'Erro ao associar serviço ao profissional.' });
        }
    },

    unassignServiceFromProfissional: async (req, res) => {
        const { profissional_id, servico_id } = req.body;
        if (!profissional_id || !servico_id) {
            return res.status(400).json({ error: 'ID do profissional e do serviço são obrigatórios.' });
        }
        try {
            const profissionalServicoToDelete = new ProfissionalServico(profissional_id, servico_id);
            const result = await profissionalServicoDb.unassign(profissionalServicoToDelete);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Associação não encontrada.' });
            }
            res.json({ message: 'Associação removida com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao remover associação.' });
        }
    },

    getServicesByProfissional: async (req, res) => {
        try {
            const rows = await profissionalServicoDb.getServicesByProfissional(req.params.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar os serviços do profissional.' });
        }
    },

    getProfissionaisByService: async (req, res) => {
        try {
            const rows = await profissionalServicoDb.getProfissionaisByService(req.params.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar os profissionais para o serviço.' });
        }
    }
};

module.exports = profissionalServicoController;