class Servico {
    constructor(id, nome, descricao, duracao_minutos, preco) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.duracao_minutos = duracao_minutos;
        this.preco = preco;
    }
}

module.exports = Servico;