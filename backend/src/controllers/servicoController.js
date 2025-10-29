const servicoDb = require('../db/servicoDb');
const Servico = require('../models/servico');

const servicoController = {
    createServico: async (req, res) => {
        const { nome, descricao, duracao_minutos, preco } = req.body;
        if (!nome || !duracao_minutos || !preco) {
            return res.status(400).json({ error: 'Nome, duração e preço são obrigatórios.' });
        }
        try {
            const newServico = new Servico(null, nome, descricao, duracao_minutos, preco);
            const result = await servicoDb.create(newServico);
            newServico.id = result.insertId;
            res.status(201).json(newServico);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar o serviço.' });
        }
    },

    getServicos: async (req, res) => {
        try {
            const servicos = await servicoDb.findAll();
            res.json(servicos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar os serviços.' });
        }
    },

    getServicoById: async (req, res) => {
        try {
            const servico = await servicoDb.findById(req.params.id);
            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            res.json(servico);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar o serviço.' });
        }
    },

    updateServico: async (req, res) => {
        const { nome, descricao, duracao_minutos, preco } = req.body;
        try {
            const updatedServico = new Servico(req.params.id, nome, descricao, duracao_minutos, preco);
            const result = await servicoDb.update(req.params.id, updatedServico);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            res.json(updatedServico);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar o serviço.' });
        }
    },

    deleteServico: async (req, res) => {
        try {
            const result = await servicoDb.delete(req.params.id);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            res.json({ message: 'Serviço removido com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao apagar o serviço.' });
        }
    }
};

module.exports = servicoController;