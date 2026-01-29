const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const LOG_FILE = 'activity.log';
const JSON_FILE = 'events.json';

const getTime = () => new Date().toISOString();

app.post('/api/log', (req, res) => {
    const { action, step, stepTitle } = req.body;
    const timestamp = getTime();

    const logLine = `[${timestamp}] ACTION: ${action} | STEP: ${step} ("${stepTitle}")\n`;
    
    fs.appendFile(LOG_FILE, logLine, (err) => {
        if (err) console.error("Error writing to log file:", err);
    });

    let events = [];
    if (fs.existsSync(JSON_FILE)) {
        try {
            events = JSON.parse(fs.readFileSync(JSON_FILE));
        } catch (e) { events = []; }
    }
    
    events.push({ timestamp, action, step, stepTitle });
    fs.writeFileSync(JSON_FILE, JSON.stringify(events, null, 2));

    console.log(`📝 Logged: ${action} at step ${step}`);
    res.json({ success: true });
});

app.get('/logs', (req, res) => {
    if (fs.existsSync(LOG_FILE)) {
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        res.send(`<pre>${content}</pre>`);
    } else {
        res.send("No logs yet.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});