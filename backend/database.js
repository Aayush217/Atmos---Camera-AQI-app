const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'atmos.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Initialize Tables
        db.serialize(() => {
            // Users/Health Profile Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                age INTEGER,
                conditions TEXT, -- JSON string of conditions like ["Asthma", "Dust Allergy"]
                sensitivity_level TEXT -- "High", "Medium", "Low"
            )`);

            // Scans/History Table
            db.run(`CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                aqi INTEGER,
                location TEXT,
                image_hash TEXT, -- For future de-duplication
                ai_analysis TEXT, -- JSON string of the full Gemini response
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);

            // ML Training Data Table
            db.run(`CREATE TABLE IF NOT EXISTS training_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image_base64 TEXT, -- Might be heavy, reconsider for prod (store path instead)
                actual_aqi INTEGER, -- User corrected value
                predicted_aqi INTEGER,
                visual_features TEXT
            )`);
        });
    }
});

module.exports = db;
