const http = require('http');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const cookie = require('cookie');
const { Server } = require('socket.io');

const validAuthToken = [];

const indexHtmlFile = fs.readFileSync(path.join(__dirname, 'static', 'index.html'));
const styleCssFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'));
const scriptJsFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'));
const authFile = fs.readFileSync(path.join(__dirname, 'static', 'auth.js'));
const registerFile = fs.readFileSync(path.join(__dirname, 'static', 'register.html'));
const loginFile = fs.readFileSync(path.join(__dirname, 'static', 'login.html'));

const server = http.createServer((req, res) => {
    if (req.method == 'GET') {
        switch(req.url) {
            case '/style.css': return res.end(styleCssFile);
            case '/auth.js': return res.end(authFile);
            case '/register': return res.end(registerFile);
            case '/login': return res.end(loginFile);
            default: return guarded(req, res);
        }
    }
    if (req.method == 'POST') {
        switch(req.url) {
            case '/api/register': return registerUser(req, res);
            case '/api/login': return login(req, res);
            default: return guarded(req, res);
        }
    }
});

function guarded(req, res) {
    const credentionals = getCredetionals(req.headers?.cookie);
    if (!credentionals) {
        res.writeHead(302, {'Location': '/register'});
        return res.end();
    }
    if (req.method === 'GET') {
        switch(req.url) {
            case '/': return res.end(indexHtmlFile);
            case '/script.js': return res.end(scriptJsFile);
        }
    }
    res.statusCode = 404;
    return res.end('Error 404');
};

function getCredetionals(c = '') {
    const cookies = cookie.parse(c);
    const token = cookies?.token;
    if (!token || !validAuthToken.includes(token)) {
        return null;
    }
    const [user_id, login] = token.split('.');
    if (!user_id || !login) {
        return null;
    }
    return {user_id, login};
};

function registerUser(req, res) {
    let data = '';
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', async function() {
        try {
            const user = JSON.parse(data);
            if (await db.isUserExist(user.login)) {
                return res.end('User already exist');
            }
            await db.addUser(user);
            return res.end('Registration is successful');
        } catch(e) {
            return res.end('Error: ' + e);
        }
    });
};

function login(req, res) {
    let data = '';
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', async function() {
        try {
            const user = JSON.parse(data);
            const token = await db.getAuthToken(user);
            validAuthToken.push(token);
            res.writeHead(200);
            res.end(token);
        }
        catch(e) {
            res.writeHead(500);
            return res.end('Error: ' + e);
        }
    });
};

server.listen(3000);

const io = new Server(server);

io.use((socket, next) => {
    const cookie = socket.handshake.auth.cookie;
    const credentionals = getCredetionals(cookie);
    if (!credentionals) {
        next(new Error("no auth"));
    }
    socket.credentionals = credentionals;
    next();
});

io.on('connection', async (socket) => {
    console.log('A user connected. User id - ' + socket.id);

    let userNickname = socket.credentionals?.login;
    let userId = socket.credentionals?.user_id;
    
    let messages = await db.getMessages();
    socket.emit('all_messages', messages);

    socket.on('new_message', async (message) => {
        db.addMessage(message, userId);
        let avatar = await db.getAvatar(userId);
        io.emit('message', avatar, userNickname + ': ' + message);
    });
});