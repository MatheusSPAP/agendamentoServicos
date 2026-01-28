class Usuario {
    constructor(id, nome, email, senha, telefone, tipo) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.telefone = telefone;
        this.tipo = tipo;
    }

    // Método para validar dados obrigatórios
    static validate(data) {
        const errors = [];

        if (!data.nome || data.nome.trim() === '') {
            errors.push('Nome é obrigatório');
        }

        if (!data.email || data.email.trim() === '') {
            errors.push('Email é obrigatório');
        }

        if (!data.senha || data.senha.trim() === '') {
            errors.push('Senha é obrigatória');
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            errors.push('Email deve ter um formato válido');
        }

        return errors;
    }

    // Método para criar instância a partir de dados do banco
    static fromDatabase(row) {
        return new Usuario(
            row.id,
            row.nome,
            row.email,
            row.senha,
            row.telefone,
            row.tipo
        );
    }

    // Método para converter para objeto simples (sem senha)
    toPublic() {
        return {
            id: this.id,
            nome: this.nome,
            email: this.email,
            telefone: this.telefone,
            tipo: this.tipo
        };
    }
}

module.exports = Usuario;