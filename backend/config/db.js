import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'learning_system_db'
});

db.connect(err => {
    if (err) console.error('❌ DB Connection Failed:', err);
    else console.log('✅ Connected to MySQL DB');
});

export default db;