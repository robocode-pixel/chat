const http = require('http');
const path = require('path');
const fs = require('fs');
const db = require('./database');
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
            case '/': return res.end(indexHtmlFile);
            case '/style.css': return res.end(styleCssFile);
            case '/script.js': return res.end(scriptJsFile);
            case '/auth.js': return res.end(authFile);
            case '/register': return res.end(registerFile);
            case '/login': return res.end(loginFile);
        }
    }
    if (req.method == 'POST') {
        switch(req.url) {
            case '/api/register': return registerUser(req, res);
            case '/api/login': return login(req, res);
        }
    }
    res.statusCode = 404;
    return res.end('Error 404');
});

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
io.on('connection', async (socket) => {
    console.log('A user connected. User id - ' + socket.id);
    
    let messages = await db.getMessages();
    socket.emit('all_messages', messages);

    socket.on('new_message', (message) => {
        db.addMessage(message, 1);
        io.emit('message', message);
    });
});