class Usuario {
    constructor(id, nome, email, senha, telefone, tipo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.telefone = telefone;
        this.tipo = tipo;
    }
}

module.exports = Usuario;