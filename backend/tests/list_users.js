const Database = require('better-sqlite3');
const db = new Database('./dev.db');
const users = db.prepare('SELECT id, email, name, role, createdAt FROM User').all();
console.table(users);
db.close();
