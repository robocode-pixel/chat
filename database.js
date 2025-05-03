const fs = require("fs");

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
                password TEXT
                );`
            );
        } else {
            console.log(await db.all("SELECT * FROM user"));
        }
    } catch(dbError) {
        console.log(dbError);
    }
})