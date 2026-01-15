const express = require('express');
const cors = require('cors');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Atmos Backend is running' });
});

// --- User Profile Routes ---

// Create or Update User Profile
app.post('/api/user', (req, res) => {
    const { name, age, conditions, sensitivity_level } = req.body;
    const conditionsStr = JSON.stringify(conditions || []);

    // Simple single-user logic for MVP (always updates ID 1 or inserts)
    // In a real app, we'd handle auth. 
    // Here we'll just check if a user exists, if so update, else insert.

    db.get("SELECT id FROM users LIMIT 1", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Update
            const sql = `UPDATE users SET name = ?, age = ?, conditions = ?, sensitivity_level = ? WHERE id = ?`;
            db.run(sql, [name, age, conditionsStr, sensitivity_level, row.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Profile updated", userId: row.id });
            });
        } else {
            // Insert
            const sql = `INSERT INTO users (name, age, conditions, sensitivity_level) VALUES (?, ?, ?, ?)`;
            db.run(sql, [name, age, conditionsStr, sensitivity_level], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Profile created", userId: this.lastID });
            });
        }
    });
});

// Get User Profile
app.get('/api/user', (req, res) => {
    db.get("SELECT * FROM users LIMIT 1", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            row.conditions = JSON.parse(row.conditions);
            res.json(row);
        } else {
            res.json(null); // No user yet
        }
    });
});


// --- Scan Routes ---

// Save Scan Result
app.post('/api/scan', (req, res) => {
    const { userId, aqi, location, ai_analysis } = req.body;
    const analysisStr = JSON.stringify(ai_analysis);

    const sql = `INSERT INTO scans (user_id, aqi, location, ai_analysis) VALUES (?, ?, ?, ?)`;
    db.run(sql, [userId, aqi, JSON.stringify(location), analysisStr], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Scan saved", scanId: this.lastID });
    });
});

// Get Recent Scans
app.get('/api/scans', (req, res) => {
    const sql = `SELECT * FROM scans ORDER BY timestamp DESC LIMIT 10`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(row => {
            row.ai_analysis = JSON.parse(row.ai_analysis);
            row.location = JSON.parse(row.location);
        });
        res.json(rows);
    });
});

// --- ML Data Collection Route ---
app.post('/api/ml/collect', (req, res) => {
    const { image_base64, predicted_aqi, actual_aqi } = req.body;
    // Save to training_data table or filesystem
    // For MVP, we'll log it.
    console.log("Received ML Training Data");
    res.json({ message: "Data collected" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
