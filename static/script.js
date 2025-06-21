const socket = io({
    auth: {
        cookie: document.cookie
    }
});
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

socket.on('all_messages', function(msgArray) {
    msgArray.forEach(message => {
        console.log(message);
        
        var img = document.createElement('img');
        img.className = 'avatar';
        img.src = avatar;
        img.alt = "Avatar";

        var span = document.createElement('span');
        span.className = 'msg';
        span.textContent = msg;

        var item = document.createElement('li');
        item.appendChild(img);
        item.appendChild(span);
    
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
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
    var img = document.createElement('img');
    img.className = 'avatar';
    img.src = avatar;
    img.alt = "Avatar";

    var span = document.createElement('span');
    span.className = 'msg';
    span.textContent = msg;

    var item = document.createElement('li');
    item.appendChild(img);
    item.appendChild(span);
    
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
