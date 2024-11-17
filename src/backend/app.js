const express = require('express');
const app = express();
const path = require('path');
const { internetScrapingContents } = require('./scrapes/scraper'); 
const { cleanData } = require('./services/internetCleanData');

app.use(express.static(path.join(__dirname, '..', 'resources')));
app.use(express.static(path.join(__dirname, '..', 'resources', 'static', 'css')));
app.use(express.json());

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

app.post('/searchingAvailableConnections', async (req, res) => {
    try {
        // Extract the encoded address from the request body
        const { address } = req.body;
        console.log('Received encoded address:', address);

        // Decode the address (if necessary) before using it
        const decodedAddress = decodeURIComponent(address);

        // Call the scraping function with the decoded address
        const scrapedData = await internetScrapingContents(decodedAddress);
        const cleansedData = await cleanData(scrapedData);
        console.log(cleansedData);
        res.json(cleansedData);  // Send the scraped data back to the client
    
    } catch (error) {
        console.error("Error in POST request:", error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});