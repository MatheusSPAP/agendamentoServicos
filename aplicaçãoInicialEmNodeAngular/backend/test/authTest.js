const jwt = require('jsonwebtoken');

// Simulando funções de middleware para testes
const protect = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            // Extrai o token do cabeçalho
            token = authHeader.split(' ')[1];

            // Verifica o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agendamento_servicos_secret');

            // Anexa o usuário ao request (sem a senha)
            req.user = decoded;
            next();
            return true;
        } catch (error) {
            res.statusCode = 401;
            res.data = { error: 'Não autorizado, token falhou.' };
            return false;
        }
    }

    if (!token) {
        res.statusCode = 401;
        res.data = { error: 'Não autorizado, sem token.' };
        return false;
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.tipo === 'admin') {
        next();
        return true;
    } else {
        res.statusCode = 403;
        res.data = { error: 'Acesso negado. Somente administradores.' };
        return false;
    }
};

// Mock de objetos para simular requisições
const createMockRequest = (token = null, user = null) => {
    return {
        headers: token ? { authorization: `Bearer ${token}` } : {},
        user: user
    };
};

const createMockResponse = () => {
    return {
        statusCode: 200,
        data: null
    };
};

const createMockNext = () => {
    let called = false;
    const nextFunction = () => { called = true; };
    nextFunction.wasCalled = () => called;
    return nextFunction;
};

console.log('=== Testes de Autenticação e Autorização ===\n');

const secret = process.env.JWT_SECRET || 'agendamento_servicos_secret';

// Token válido para testes
const validToken = jwt.sign(
    { id: 1, nome: 'Test User', tipo: 'cliente' },
    secret,
    { expiresIn: '1h' }
);

const validAdminToken = jwt.sign(
    { id: 2, nome: 'Admin User', tipo: 'admin' },
    secret,
    { expiresIn: '1h' }
);

// Teste 1: Deve permitir acesso com token válido de cliente
console.log('Teste 1: Acesso com token válido de cliente');
const req1 = createMockRequest(validToken);
const res1 = createMockResponse();
const next1 = createMockNext();

const result1 = protect(req1, res1, next1);

if (result1 && next1.wasCalled() && req1.user && req1.user.id === 1 && req1.user.tipo === 'cliente') {
    console.log('✅ PASSOU: Acesso permitido com token de cliente válido');
} else {
    console.log('❌ FALHOU: Acesso não permitido com token de cliente válido');
}

// Teste 2: Deve permitir acesso com token válido de admin
console.log('\nTeste 2: Acesso com token válido de admin');
const req2 = createMockRequest(validAdminToken);
const res2 = createMockResponse();
const next2 = createMockNext();

const result2 = protect(req2, res2, next2);

if (result2 && next2.wasCalled() && req2.user && req2.user.id === 2 && req2.user.tipo === 'admin') {
    console.log('✅ PASSOU: Acesso permitido com token de admin válido');
} else {
    console.log('❌ FALHOU: Acesso não permitido com token de admin válido');
}

// Teste 3: Deve negar acesso sem token
console.log('\nTeste 3: Acesso sem token');
const req3 = createMockRequest();
const res3 = createMockResponse();
const next3 = createMockNext();

const result3 = protect(req3, res3, next3);

if (!result3 && res3.statusCode === 401) {
    console.log('✅ PASSOU: Acesso negado sem token');
} else {
    console.log('❌ FALHOU: Acesso não negado sem token');
}

// Teste 4: Deve negar acesso com token inválido
console.log('\nTeste 4: Acesso com token inválido');
const req4 = createMockRequest('invalid_token');
const res4 = createMockResponse();
const next4 = createMockNext();

const result4 = protect(req4, res4, next4);

if (!result4 && res4.statusCode === 401) {
    console.log('✅ PASSOU: Acesso negado com token inválido');
} else {
    console.log('❌ FALHOU: Acesso não negado com token inválido');
}

// Teste 5: Deve permitir acesso para admin usando isAdmin middleware
console.log('\nTeste 5: Acesso admin com middleware isAdmin');
const req5 = createMockRequest(null, { id: 2, nome: 'Admin User', tipo: 'admin' });
const res5 = createMockResponse();
const next5 = createMockNext();

const result5 = isAdmin(req5, res5, next5);

if (result5 && next5.wasCalled()) {
    console.log('✅ PASSOU: Acesso permitido para admin com middleware isAdmin');
} else {
    console.log('❌ FALHOU: Acesso não permitido para admin com middleware isAdmin');
}

// Teste 6: Deve negar acesso para cliente usando isAdmin middleware
console.log('\nTeste 6: Acesso cliente com middleware isAdmin');
const req6 = createMockRequest(null, { id: 1, nome: 'Test User', tipo: 'cliente' });
const res6 = createMockResponse();
const next6 = createMockNext();

const result6 = isAdmin(req6, res6, next6);

if (!result6 && res6.statusCode === 403) {
    console.log('✅ PASSOU: Acesso negado para cliente com middleware isAdmin');
} else {
    console.log('❌ FALHOU: Acesso não negado para cliente com middleware isAdmin');
}

// Teste 7: Deve negar acesso para usuário não autenticado usando isAdmin middleware
console.log('\nTeste 7: Acesso não autenticado com middleware isAdmin');
const req7 = createMockRequest();
const res7 = createMockResponse();
const next7 = createMockNext();

const result7 = isAdmin(req7, res7, next7);

if (!result7 && res7.statusCode === 403) {
    console.log('✅ PASSOU: Acesso negado para usuário não autenticado com middleware isAdmin');
} else {
    console.log('❌ FALHOU: Acesso não negado para usuário não autenticado com middleware isAdmin');
}

// Teste 8: Simulação de fluxo completo de autenticação
console.log('\nTeste 8: Simulação de fluxo completo de autenticação');
const userData = {
    id: 1,
    nome: 'Test User',
    email: 'test@example.com',
    tipo: 'cliente'
};

// Gera token JWT (como é feito no controller de login)
const payload = {
    id: userData.id,
    nome: userData.nome,
    tipo: userData.tipo
};

const token = jwt.sign(payload, secret, { expiresIn: '1h' });
const decoded = jwt.verify(token, secret);

if (decoded.id === userData.id && decoded.nome === userData.nome && decoded.tipo === userData.tipo) {
    console.log('✅ PASSOU: Fluxo completo de autenticação funcionando');
    console.log('   - Token gerado:', token);
    console.log('   - Payload decodificado:', decoded);
} else {
    console.log('❌ FALHOU: Fluxo completo de autenticação falhou');
}

console.log('\n=== Fim dos Testes ===');