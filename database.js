const fs = require("fs");
const crypto = require("crypto");

const dbFile = "./chat.db";
const exist = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

dbWrapper
.open({
    filename: dbFile,
    driver: sqlite3.Database
})
.then(async dBase => {
    db = dBase;
    try {
        if (!exist) {
            await db.run(
                `CREATE TABLE user(
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                login TEXT,
                password TEXT,
                salt TEXT
                );`
            );

            await db.run(
                `CREATE TABLE message(
                msg_id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT,
                author INTEGER,
                FOREIGN KEY(author) REFERENCES user(user_id)
                );`
            );
        } else {
            console.log(await db.all("SELECT * FROM user"));
        }
    } catch(dbError) {
        console.log(dbError);
    }
})

module.exports = {
    getMessages: async () => {
        try {
            return await db.all(
                `SELECT msg_id, content, login, user_id FROM message
                JOIN user ON message.author = user.user_id`
            );
        } catch(dbError) {
            console.error(dbError);
        }
    },
    addMessage: async (msg, userid) => {
        await db.run(
            `INSERT INTO message (content, author) VALUES (?, ?)`,
            [msg, userid]
        );
    },
    isUserExist: async (login) => {
        const candidate = await db.all(`SELECT * FROM user WHERE login = ?`, [login]);
        return !!candidate.length;
    },
    addUser: async (user) => {
        const salt = crypto.randomBytes(16).toString('hex');
        const password = crypto.pbkdf2Sync(user.password, salt, 1000, 64, `sha512`).toString(`hex`);
        await db.run(
            `INSERT INTO user (login, password, salt) VALUES (?, ?, ?)`,
            [user.login, password, salt]
        );
    },
    getAuthToken: async (user) => {
        const candidate = await db.all(`SELECT * FROM user WHERE login = ?`, [user.login]);
        if (!candidate.length) {
            throw 'Wrong login';
        }
        const {user_id, login, password, salt} = candidate[0];
        const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, `sha512`).toString(`hex`);
        if (password !== hash) {
            throw 'Wrong password';
        }
        return user_id + '.' + login + '.' + crypto.randomBytes(20).toString('hex');
    }
};