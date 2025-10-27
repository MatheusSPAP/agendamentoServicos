const profissionalServicoDb = require('../db/profissionalServicoDb'); // Import the new DAO

const profissionalServicoController = {
    assignServiceToProfissional: async (req, res) => {
        const { profissional_id, servico_id } = req.body;
        if (!profissional_id || !servico_id) {
            return res.status(400).json({ error: 'ID do profissional e do serviço são obrigatórios.' });
        }
        try {
            await profissionalServicoDb.assign(profissional_id, servico_id);
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
            const result = await profissionalServicoDb.unassign(profissional_id, servico_id);
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