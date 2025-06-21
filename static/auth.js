const registerForm = document.getElementById('register_form');
const loginForm = document.getElementById('login_form');
const loginBtn = document.getElementById('login-btn');

loginBtn?.addEventListener('click', (e) => {
    location.assign('/login');
})

registerForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const {login, password, passwordRepeat} = registerForm;
    if (login.value.length < 3) {
        return alert('The login is too short');
    }
    if (password.value !== passwordRepeat.value) {
        return alert('The passwords do not match');
    }
    if (password.value.length < 4) {
        return alert('The password is too short');
    }
    const user = JSON.stringify({
        login: login.value,
        password: password.value,
        avatar: avatar.value
    });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/register');
    xhr.send(user);
    xhr.onload = () => alert(xhr.response);
});

loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const {login, password} = loginForm;
    const user = JSON.stringify({
        login: login.value,
        password: password.value
    });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/login');
    xhr.send(user);
    xhr.onload = () => {
        if (xhr.status === 200) {
            const token = xhr.response;
            document.cookie = `token=${token}`;
            window.location.assign('/');
        } else {
            return alert(xhr.response);
        }
    };
});