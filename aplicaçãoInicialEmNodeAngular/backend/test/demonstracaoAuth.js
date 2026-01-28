// Script para demonstrar o funcionamento do sistema de autenticação JWT
const jwt = require('jsonwebtoken');

// Simulando a geração de tokens como é feito no controller de login
const gerarToken = (userId, nome, tipo) => {
    const payload = {
        id: userId,
        nome: nome,
        tipo: tipo
    };
    
    // Em produção, usaria process.env.JWT_SECRET
    const secret = 'agendamento_servicos_secret'; // Apenas para testes
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    
    console.log(`\nToken gerado para usuário: ${nome} (ID: ${userId}, Tipo: ${tipo})`);
    console.log(`Token: ${token}`);
    
    return { token, secret };
};

// Simulando a verificação de token como é feito no middleware protect
const verificarToken = (token, secret) => {
    try {
        const decoded = jwt.verify(token, secret);
        console.log(`\nToken válido!`);
        console.log(`ID: ${decoded.id}`);
        console.log(`Nome: ${decoded.nome}`);
        console.log(`Tipo: ${decoded.tipo}`);
        return decoded;
    } catch (error) {
        console.log(`\nToken inválido: ${error.message}`);
        return null;
    }
};

// Simulando a verificação de admin como é feito no middleware isAdmin
const verificarAdmin = (decodedToken) => {
    if (decodedToken && decodedToken.tipo === 'admin') {
        console.log(`\nUsuário é administrador - acesso concedido`);
        return true;
    } else {
        console.log(`\nAcesso negado - não é administrador`);
        return false;
    }
};

console.log("=== Demonstração do Sistema de Autenticação ===");

// Teste 1: Cliente se autentica
console.log("\n1. Cliente se autentica:");
const cliente = gerarToken(1, "João Silva", "cliente");
const dadosCliente = verificarToken(cliente.token, cliente.secret);
console.log("É administrador?", verificarAdmin(dadosCliente));

// Teste 2: Administrador se autentica
console.log("\n2. Administrador se autentica:");
const admin = gerarToken(2, "Maria Admin", "admin");
const dadosAdmin = verificarToken(admin.token, admin.secret);
console.log("É administrador?", verificarAdmin(dadosAdmin));

// Teste 3: Token inválido
console.log("\n3. Tentativa com token inválido:");
verificarToken("token_invalido_aqui", admin.secret);

// Teste 4: Demonstração de como o sistema verifica permissões em uma rota
console.log("\n4. Simulando verificação de acesso a rota de admin:");
const rotaExigeAdmin = (decodedToken) => {
    if (!decodedToken) {
        return "Acesso negado: token inválido";
    }
    
    if (decodedToken.tipo !== 'admin') {
        return "Acesso negado: apenas administradores podem acessar esta rota";
    }
    
    return "Acesso concedido: você é administrador";
};

console.log("Cliente tentando acessar rota de admin:", rotaExigeAdmin(dadosCliente));
console.log("Admin tentando acessar rota de admin:", rotaExigeAdmin(dadosAdmin));

// Teste 5: Simulando diferentes níveis de acesso
console.log("\n5. Simulando diferentes níveis de acesso:");
const verificarAcesso = (decodedToken, tipoRota) => {
    switch(tipoRota) {
        case 'publica':
            return "Acesso concedido: rota pública";
        case 'autenticada':
            if (decodedToken) return "Acesso concedido: rota autenticada";
            else return "Acesso negado: autenticação necessária";
        case 'admin':
            if (decodedToken && decodedToken.tipo === 'admin') return "Acesso concedido: rota de admin";
            else return "Acesso negado: apenas administradores";
        default:
            return "Tipo de rota desconhecido";
    }
};

console.log("Cliente em rota pública:", verificarAcesso(dadosCliente, 'publica'));
console.log("Cliente em rota autenticada:", verificarAcesso(dadosCliente, 'autenticada'));
console.log("Cliente em rota admin:", verificarAcesso(dadosCliente, 'admin'));
console.log("Admin em rota admin:", verificarAcesso(dadosAdmin, 'admin'));

console.log("\n=== Fim da Demonstração ===");