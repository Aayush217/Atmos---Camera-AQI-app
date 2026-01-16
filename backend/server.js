const express = require('express');
const cors = require('cors');
const axios = require('axios');
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

// Analyze Image/Location
app.post('/api/analyze', async (req, res) => {
    const { latitude, longitude, userId } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    try {
        // 1. Fetch Real AQI from Open-Meteo
        const meteoUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

        const [aqiResponse, weatherResponse] = await Promise.all([
            axios.get(meteoUrl),
            axios.get(weatherUrl)
        ]);

        const currentAQI = aqiResponse.data.current.us_aqi;
        const pollutants = {
            pm10: aqiResponse.data.current.pm10,
            pm2_5: aqiResponse.data.current.pm2_5,
            no2: aqiResponse.data.current.nitrogen_dioxide,
            so2: aqiResponse.data.current.sulphur_dioxide,
            o3: aqiResponse.data.current.ozone
        };

        const weather = {
            temp: weatherResponse.data.current.temperature_2m,
            hum: weatherResponse.data.current.relative_humidity_2m,
            wind: weatherResponse.data.current.wind_speed_10m
        };

        // 2. Get User Profile
        const targetUserId = userId || 1;

        const getUser = () => new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", [targetUserId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        let user = await getUser();
        let userAge = 25;
        let userDisease = "None";

        if (user) {
            userAge = user.age;
            try {
                const conds = JSON.parse(user.conditions);
                if (Array.isArray(conds) && conds.length > 0) {
                    userDisease = conds.join(", ");
                }
            } catch (e) { }
        }

        // 3. Call Python Service for Advice
        let advice = "Could not generate advice.";
        try {
            const adviceResponse = await axios.post('http://localhost:5000/predict', {
                aqi: currentAQI,
                age: userAge,
                disease: userDisease
            });
            advice = adviceResponse.data.advice;
        } catch (pyError) {
            console.error("Python Service Error:", pyError.message);
            advice = "AI Service temporarily unavailable. Please rely on standard health guidelines.";
        }

        // 4. Construct Response Object
        const analysisResult = {
            visual: {
                aqi: currentAQI,
                color: getAQIColor(currentAQI),
                description: getAQIDescription(currentAQI),
                recommendation: advice
            },
            satellite: null,
            location: { latitude, longitude },
            weather: weather,
            components: pollutants,
            full_advice: advice
        };

        // 5. Save to DB
        const sql = `INSERT INTO scans (user_id, aqi, location, ai_analysis) VALUES (?, ?, ?, ?)`;
        const analysisStr = JSON.stringify(analysisResult);
        db.run(sql, [targetUserId, currentAQI, JSON.stringify({ latitude, longitude }), analysisStr], (err) => {
            if (err) console.error("Auto-save failed:", err.message);
        });

        res.json(analysisResult);

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Failed to analyze location data." });
    }
});

function getAQIColor(aqi) {
    if (aqi <= 50) return "#00E400";
    if (aqi <= 100) return "#FFFF00";
    if (aqi <= 150) return "#FF7E00";
    if (aqi <= 200) return "#FF0000";
    if (aqi <= 300) return "#99004C";
    return "#7E0023";
}

function getAQIDescription(aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
}

// Get Recent Scans
app.get('/api/scans', (req, res) => {
    const sql = `SELECT * FROM scans ORDER BY timestamp DESC LIMIT 10`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(row => {
            try { row.ai_analysis = JSON.parse(row.ai_analysis); } catch (e) { }
            try { row.location = JSON.parse(row.location); } catch (e) { }
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
