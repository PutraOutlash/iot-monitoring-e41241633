const Database = require('better-sqlite3');
const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    suhu REAL NOT NULL,
    kelembapan REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    threshold_suhu REAL NOT NULL
  );
  INSERT OR IGNORE INTO settings (id, threshold_suhu) VALUES (1, 35.0);
`);
module.exports = db;