const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '..', 'resources')));
app.use(express.static(path.join(__dirname, '..', 'resources', 'static', 'css')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'resources', 'templates', 'frontpage.html'));
});

app.get('/sammenlign-internet', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'resources', 'templates', 'broadband.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});