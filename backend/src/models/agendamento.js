class Agendamento {
    constructor(id, cliente_id, profissional_id, servico_id, data_hora, status) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.profissional_id = profissional_id;
        this.servico_id = servico_id;
        this.data_hora = data_hora;
        this.status = status;
    }
}

module.exports = Agendamento;