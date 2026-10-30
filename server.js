const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

// Endpoint Bonus: Settings (Threshold)
app.get('/api/settings', (req, res) => {
    const row = db.prepare('SELECT threshold_suhu FROM settings WHERE id = 1').get();
    res.json(row);
});

app.post('/api/settings', (req, res) => {
    const { threshold_suhu } = req.body;
    if (typeof threshold_suhu !== 'number') return res.status(400).json({error: 'Invalid data'});
    db.prepare('UPDATE settings SET threshold_suhu = ? WHERE id = 1').run(threshold_suhu);
    io.emit('settingsUpdated', { threshold_suhu });
    res.json({ success: true });
});

// 1. Endpoint POST: Menerima data sensor
app.post('/api/readings', (req, res) => {
    const { device_id, suhu, kelembapan } = req.body;
    if (typeof suhu !== 'number' || typeof kelembapan !== 'number') {
        return res.status(400).json({ error: 'Suhu dan kelembapan harus berupa angka' });
    }
    if (suhu < -40 || suhu > 80 || kelembapan < 0 || kelembapan > 100) {
        return res.status(400).json({ error: 'Data di luar rentang valid' });
    }

    const stmt = db.prepare('INSERT INTO readings (device_id, suhu, kelembapan) VALUES (?, ?, ?)');
    const info = stmt.run(device_id, suhu, kelembapan);

    const newData = db.prepare('SELECT * FROM readings WHERE id = ?').get(info.lastInsertRowid);
    
    // Bonus: Real-time update via WebSocket
    io.emit('newData', newData); 
    res.status(201).json(newData);
});

// 2. Endpoint GET Latest
app.get('/api/readings/latest', (req, res) => {
    const { device_id } = req.query;
    let row;
    if (device_id) {
        row = db.prepare('SELECT * FROM readings WHERE device_id = ? ORDER BY id DESC LIMIT 1').get(device_id);
    } else {
        row = db.prepare('SELECT * FROM readings ORDER BY id DESC LIMIT 1').get();
    }
    res.status(200).json(row || {});
});

// 3. Endpoint GET History (limit)
app.get('/api/readings', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const { device_id } = req.query;
    let rows;
    if (device_id) {
        rows = db.prepare('SELECT * FROM readings WHERE device_id = ? ORDER BY id DESC LIMIT ?').all(device_id, limit);
    } else {
        rows = db.prepare('SELECT * FROM readings ORDER BY id DESC LIMIT ?').all(limit);
    }
    res.status(200).json(rows);
});

// 4. Endpoint GET Stats
app.get('/api/stats', (req, res) => {
    const { device_id } = req.query;
    let query = 'SELECT AVG(suhu) as avg_suhu, MIN(suhu) as min_suhu, MAX(suhu) as max_suhu, AVG(kelembapan) as avg_kelembapan, MIN(kelembapan) as min_kelembapan, MAX(kelembapan) as max_kelembapan FROM readings';
    let row;
    if (device_id) {
        query += ' WHERE device_id = ?';
        row = db.prepare(query).get(device_id);
    } else {
        row = db.prepare(query).get();
    }
    res.status(200).json(row);
});

// API Pembantu: Get distinct devices
app.get('/api/devices', (req, res) => {
    const rows = db.prepare('SELECT DISTINCT device_id FROM readings').all();
    res.json(rows.map(r => r.device_id));
});

// Bonus: Export to CSV
app.get('/api/export', (req, res) => {
    const { device_id } = req.query;
    let rows;
    if (device_id) {
        rows = db.prepare('SELECT * FROM readings WHERE device_id = ? ORDER BY id DESC').all(device_id);
    } else {
        rows = db.prepare('SELECT * FROM readings ORDER BY id DESC').all();
    }
    
    let csv = 'id,device_id,suhu,kelembapan,created_at\n';
    rows.forEach(r => {
        csv += `${r.id},${r.device_id},${r.suhu},${r.kelembapan},${r.created_at}\n`;
    });
    
    res.header('Content-Type', 'text/csv');
    res.attachment('riwayat_sensor.csv');
    return res.send(csv);
});

server.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});