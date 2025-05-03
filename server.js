const http = require('http');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const { Server } = require('socket.io');

const indexHtmlFile = fs.readFileSync(path.join(__dirname, 'static', 'index.html'));
const styleCssFile = fs.readFileSync(path.join(__dirname, 'static', 'style.css'));
const scriptJsFile = fs.readFileSync(path.join(__dirname, 'static', 'script.js'));
const server = http.createServer((req, res) => {
    switch(req.url) {
        case '/': return res.end(indexHtmlFile);
        case '/style.css': return res.end(styleCssFile);
        case '/script.js': return res.end(scriptJsFile);
    }
    res.statusCode = 404;
    return res.end('Error 404');
});

server.listen(3000);

const io = new Server(server);
io.on('connection', (socket) => {
    console.log('A user connected. User id - ' + socket.id);
    let userNickname = 'user';

    socket.on('set_nickname', (nickname) => {
        userNickname = nickname;
    })

    socket.on('new_message', (message) => {
        console.log(message);
        io.emit('message', userNickname + ': ' + message);
    });
});