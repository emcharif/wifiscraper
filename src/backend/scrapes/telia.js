const puppeteer = require('puppeteer');

(async () => {
    try {
        // Launch a browser instance
        const browser = await puppeteer.launch({ headless: true }); // Set to false if you want to see the browser window
        const page = await browser.newPage();

        // Navigate to a webpage (you can change the URL to any page)
        await page.goto('https://scrapethissite.com');

        // Take a screenshot and save it as 'screenshot.png'
        await page.screenshot({ path: 'screenshot.png', fullPage: true });
        console.log('Screenshot taken and saved as screenshot.png');

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error('Error:', error);
    }
})();
