const socket = io({
    auth: {
        cookie: document.cookie
    }
});
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const logoutBtn = document.getElementById('log-out-btn');

logoutBtn.addEventListener('click', (e) => {
    document.cookie = 'token=; Mac-Age=0';
    location.assign('/login');
});

socket.on('all_messages', function(msgArray) {
    msgArray.forEach(message => {
        printMessage(message.avatar, message.login + ': ' + message.content);
    });
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('new_message', input.value);
        input.value = '';
    }
})

socket.on('message', function(avatar, msg) {
    printMessage(avatar, msg);
});

function printMessage(avatar, text) {
    var img = document.createElement('img');
    img.className = 'avatar';
    img.src = avatar;
    img.alt = "Avatar";

    var span = document.createElement('span');
    span.className = 'msg';
    span.textContent = text;

    var item = document.createElement('li');
    item.appendChild(img);
    item.appendChild(span);
    
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}
