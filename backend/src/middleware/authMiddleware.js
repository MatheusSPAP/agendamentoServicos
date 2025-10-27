const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            // Extrai o token do cabeçalho
            token = authHeader.split(' ')[1];

            // Verifica o token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Anexa o usuário ao request (sem a senha)
            req.user = decoded;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Não autorizado, sem token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.tipo === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado. Somente administradores.' });
    }
};

module.exports = { protect, isAdmin };