const agendamentoDb = require('../db/agendamentoDb');
const servicoDb = require('../db/servicoDb');
const profissionalDb = require('../db/profissionalDb');
const horarioTrabalhoDb = require('../db/horarioTrabalhoDb');
const profissionalServicoDb = require('../db/profissionalServicoDb');
const Agendamento = require('../models/agendamento');

const agendamentoController = {
    // @desc    Obter horários disponíveis
    // @route   GET /api/agendamentos/available-slots
    // @access  Public
    getAvailableSlots: async (req, res) => {
        const { servico_id, profissional_id, data } = req.query; // data format YYYY-MM-DD

        if (!servico_id || !data) {
            return res.status(400).json({ error: 'ID do serviço e data são obrigatórios.' });
        }

        try {
            // 1. Obter detalhes do serviço
            const servico = await servicoDb.findById(servico_id);
            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            const duracaoServico = servico.duracao_minutos;

            let profissionaisDisponiveis = [];

            if (profissional_id) {
                // Se um profissional específico for fornecido, verificar se ele oferece o serviço
                const profs = await profissionalServicoDb.getProfissionaisByService(servico_id);
                profissionaisDisponiveis = profs.filter(p => p.id == profissional_id);
            } else {
                // Se nenhum profissional específico for fornecido, buscar todos que oferecem o serviço
                profissionaisDisponiveis = await profissionalServicoDb.getProfissionaisByService(servico_id);
            }

            if (profissionaisDisponiveis.length === 0) {
                return res.status(404).json({ error: 'Nenhum profissional encontrado para este serviço.' });
            }

            const diaSemana = new Date(data).getDay(); // 0 = Domingo, 1 = Segunda, etc.
            const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
            const nomeDiaSemana = dias[diaSemana];

            const slotsDisponiveisPorProfissional = {};

            for (const prof of profissionaisDisponiveis) {
                // Obter horários de trabalho do profissional para o dia
                const horariosTrabalho = await horarioTrabalhoDb.findAll(prof.id);
                const horarioDoDia = horariosTrabalho.find(h => h.dia_semana === nomeDiaSemana);

                if (!horarioDoDia) {
                    continue; // Profissional não trabalha neste dia
                }

                const { hora_inicio, hora_fim } = horarioDoDia;

                // Obter agendamentos existentes para o profissional no dia
                const agendamentosExistentes = await agendamentoDb.findExistingAppointmentsForProfessional(prof.id, data);

                const inicioTrabalho = new Date(`${data}T${hora_inicio}`);
                const fimTrabalho = new Date(`${data}T${hora_fim}`);

                let currentSlot = new Date(inicioTrabalho);
                const slotsProfissional = [];

                while (currentSlot.getTime() + duracaoServico * 60 * 1000 <= fimTrabalho.getTime()) {
                    let isAvailable = true;
                    const slotFim = new Date(currentSlot.getTime() + duracaoServico * 60 * 1000);

                    // Verificar conflitos com agendamentos existentes
                    for (const agendamento of agendamentosExistentes) {
                        const agendamentoInicio = new Date(agendamento.data_hora);
                        const agendamentoServico = await servicoDb.findById(agendamento.servico_id);
                        const agendamentoFim = new Date(agendamentoInicio.getTime() + agendamentoServico.duracao_minutos * 60 * 1000);

                        // Conflito se os horários se sobrepõem
                        if (
                            (currentSlot < agendamentoFim && slotFim > agendamentoInicio)
                        ) {
                            isAvailable = false;
                            break;
                        }
                    }

                    if (isAvailable) {
                        slotsProfissional.push({
                            inicio: currentSlot.toISOString(),
                            fim: slotFim.toISOString()
                        });
                    }
                    currentSlot = new Date(currentSlot.getTime() + duracaoServico * 60 * 1000); // Próximo slot
                }
                slotsDisponiveisPorProfissional[prof.id] = {
                    profissional: prof,
                    slots: slotsProfissional
                };
            }

            res.json(slotsDisponiveisPorProfissional);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar horários disponíveis.' });
        }
    },

    // @desc    Criar um novo agendamento
    // @route   POST /api/agendamentos
    // @access  Private (Cliente ou Admin)
    createAgendamento: async (req, res) => {
        const { profissional_id, servico_id, data_hora } = req.body;
        const cliente_id = req.user.id; // ID do cliente logado

        if (!profissional_id || !servico_id || !data_hora) {
            return res.status(400).json({ error: 'Profissional, serviço e data/hora são obrigatórios.' });
        }

        try {
            const servico = await servicoDb.findById(servico_id);
            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            const duracaoServico = servico.duracao_minutos;
            const agendamentoInicio = new Date(data_hora);
            
            // Validação: não permitir agendamentos para datas passadas
            const agora = new Date();
            if (agendamentoInicio < agora) {
                return res.status(400).json({ error: 'Não é possível agendar para uma data/hora passada.' });
            }
            
            // Validação: não permitir agendamentos muito distantes no futuro (ex: mais de 2 meses)
            const doisMesesAPartirDeAgora = new Date();
            doisMesesAPartirDeAgora.setMonth(agora.getMonth() + 2);
            if (agendamentoInicio > doisMesesAPartirDeAgora) {
                return res.status(400).json({ error: 'Não é possível agendar com mais de 2 meses de antecedência.' });
            }
            
            const agendamentoFim = new Date(agendamentoInicio.getTime() + duracaoServico * 60 * 1000);

            const conflitos = await agendamentoDb.findConflictingAppointments(profissional_id, agendamentoInicio, agendamentoFim);

            if (conflitos.length > 0) {
                return res.status(409).json({ error: 'Horário indisponível. Conflito com outro agendamento.' });
            }

            const formattedDataHora = new Date(data_hora).toISOString().slice(0, 19).replace('T', ' ');

            const newAgendamento = new Agendamento(null, cliente_id, profissional_id, servico_id, formattedDataHora, 'agendado');
            const result = await agendamentoDb.create(newAgendamento);
            newAgendamento.id = result.insertId;
            res.status(201).json(newAgendamento);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar o agendamento.' });
        }
    },

    // @desc    Listar agendamentos (todos para admin, próprios para cliente)
    // @route   GET /api/agendamentos
    // @access  Private (Cliente ou Admin)
    getAgendamentos: async (req, res) => {
        try {
            // Parâmetros de filtro e paginação
            const { status, data_inicio, data_fim, page = 1, limit = 10 } = req.query;
            
            // Calcular offset para paginação
            const offset = (page - 1) * limit;
            
            // Obter agendamentos com filtros
            const agendamentos = await agendamentoDb.findAllWithFilters(
                req.user.tipo === 'cliente' ? req.user.id : null,
                status,
                data_inicio,
                data_fim,
                offset,
                limit
            );
            
            res.json(agendamentos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
        }
    },

    // @desc    Obter agendamento por ID
    // @route   GET /api/agendamentos/:id
    // @access  Private (Cliente ou Admin)
    getAgendamentoById: async (req, res) => {
        try {
            const agendamento = await agendamentoDb.findById(req.params.id);
            if (!agendamento) {
                return res.status(404).json({ error: 'Agendamento não encontrado.' });
            }

            // Se for cliente, verificar se é o próprio agendamento
            if (req.user.tipo === 'cliente' && agendamento.cliente_id !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            res.json(agendamento);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar agendamento.' });
        }
    },

    // @desc    Atualizar agendamento
    // @route   PUT /api/agendamentos/:id
    // @access  Private/Admin
    updateAgendamento: async (req, res) => {
        const { profissional_id, servico_id, data_hora, status } = req.body;
        try {
            if (req.user.tipo !== 'admin') {
                return res.status(403).json({ error: 'Acesso negado. Somente administradores podem atualizar agendamentos.' });
            }

            const existingAgendamento = await agendamentoDb.findById(req.params.id);
            if (!existingAgendamento) {
                return res.status(404).json({ error: 'Agendamento não encontrado.' });
            }
            
            const updatedAgendamento = new Agendamento(
                req.params.id, 
                existingAgendamento.cliente_id, 
                profissional_id || existingAgendamento.profissional_id,
                servico_id || existingAgendamento.servico_id,
                data_hora || existingAgendamento.data_hora,
                status || existingAgendamento.status
            );
            const result = await agendamentoDb.update(req.params.id, updatedAgendamento);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Agendamento não encontrado.' });
            }
            res.json(updatedAgendamento);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
        }
    },

    // @desc    Cancelar agendamento
    // @route   DELETE /api/agendamentos/:id
    // @route   DELETE /api/agendamentos/:id
    // @access  Private (Cliente ou Admin)
    cancelAgendamento: async (req, res) => {
        try {
            // Obter informações do agendamento para verificar a política de cancelamento
            const agendamento = await agendamentoDb.findById(req.params.id);
            if (!agendamento) {
                return res.status(404).json({ error: 'Agendamento não encontrado.' });
            }
            
            // Verificar se o usuário tem permissão para cancelar
            if (req.user.tipo === 'cliente' && agendamento.cliente_id !== req.user.id) {
                return res.status(403).json({ error: 'Acesso negado. Você não pode cancelar este agendamento.' });
            }
            
            // Verificar política de cancelamento (não pode cancelar com menos de 24h de antecedência, exceto para admins)
            const dataAgendamento = new Date(agendamento.data_hora);
            const agora = new Date();
            const horasDeAntecedencia = (dataAgendamento - agora) / (1000 * 60 * 60); // diferença em horas
            
            // Se for cliente e tentar cancelar com menos de 24h de antecedência
            if (req.user.tipo === 'cliente' && horasDeAntecedencia < 24) {
                return res.status(400).json({ error: 'Não é possível cancelar o agendamento com menos de 24 horas de antecedência.' });
            }
            
            const result = await agendamentoDb.cancel(req.params.id, req.user.tipo === 'cliente' ? req.user.id : null);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Agendamento não encontrado ou não autorizado para cancelar.' });
            }
            res.json({ message: 'Agendamento cancelado com sucesso.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao cancelar agendamento.' });
        }
    }
};

module.exports = agendamentoController;
