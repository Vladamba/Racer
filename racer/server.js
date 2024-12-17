const express = require('express');
const path = require('path');
const fs = require('fs');
const recordsPath = path.join(__dirname, 'records.json');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Отправляем index.html
});

app.get('/api/records', (req, res) => {
    const data = loadRecords();
    res.json(data.records);
});

app.post('/api/records', (req, res) => {
    const { time } = req.body;

    if (typeof time !== 'number') {
        return res.status(400);
    }

    const data = loadRecords();
    let records = data.records;

    records.push(time);
    records.sort((a, b) => a - b);
    records = records.slice(0, 10);

    fs.writeFileSync(recordsPath, JSON.stringify({ records }, null, 2));
    res.status(201);
});

function loadRecords() {
    if (!fs.existsSync(recordsPath)) {
        return { records: [] };
    }
    const data = fs.readFileSync(recordsPath, 'utf8');

    return JSON.parse(data);
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
