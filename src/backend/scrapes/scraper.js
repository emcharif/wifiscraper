const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const { writeError } = require("../services/errorWriting");

module.exports = {internetScrapingContents};

async function internetScrapingContents(addressParsed) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    let cookiesElement, addressParsingInput, url, confirmAddress;
    const allSubscriptions = [];

    let allCompanies = ["telia", "telenor"];

    for (let i = 0; i < allCompanies.length; i++) {
        let company = allCompanies[i];
        let data = await unpackingXPaths(company);

        cookiesElement = data.general.cookiesElement;
        addressParsingInput = data.general.addressInputElement;
        url = data.general.url;
        confirmAddress = data.general.dropdownFirstOption;
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await IDingCookiesAndTextElement(cookiesElement, addressParsingInput, page);
            await page.waitForSelector(addressParsingInput, { visible: true });
            
            await page.type(addressParsingInput, addressParsed, { visible: true, delay: 10 }); 
            await wait(3);

            await page.click(confirmAddress)
        } catch (e) {
            await page.keyboard.press("Enter");
            console.error("Error navigating and interacting with the page:", e.message);
        }
        
        try {
            const results = await extractInformation(page, data.internet0.name, { visible: true, timeout: 3000 });
            allSubscriptions.push(results);
        } catch (error) {
            console.error("Der er sket en fejl:", error.message);
        }
    }
    await browser.close();
    return allSubscriptions;
}

async function wait(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

async function IDingCookiesAndTextElement(cookiesElement, addressParsingInput, page) {
    try {
        await page.waitForSelector(cookiesElement);
        await page.click(cookiesElement);
    } catch (e) {
        console.log("No cookies consent found or couldn't click the element.");
    }

    try {
        await page.waitForSelector(addressParsingInput);
    } catch (e) {
        console.log("Address input element not found.");
    }
}

async function unpackingXPaths(company) {
    try {
        const data = await fs.readFile(`../data/${company}XPaths.json`, 'utf8');
        const totalXPaths = JSON.parse(data);
        return totalXPaths;
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        return null;
    }
}

async function extractInformation(page, company) {
    const xPathsData = await unpackingXPaths(company);
    const internetKeys = Object.keys(xPathsData).filter(key => key.startsWith('internet'));
    let subscriptions = [];

    const isPageLoadedDependancy = xPathsData[internetKeys[0]]?.xpaths.dependancy;

    try {
        await page.waitForSelector(isPageLoadedDependancy, { visible: true });
    } catch (error) {
        console.error(`Main dependency element not found within the timeout: ${error.message}`);
        return;
    }

    const isConnectionFound = await page.$(xPathsData.general.noConnectionFound);

    if (isConnectionFound) {
        console.log("No internet connection available at this address.");
    } else {
        console.log("Internet connection is available.");
    }


    for (let i = 0; i < internetKeys.length; i++) {
        try {
            const internetKey = internetKeys[i];
            const dependancy = xPathsData[internetKey].xpaths.dependancy;
            
            const selectorForPrice = xPathsData[internetKey].xpaths.price;
            const selectorForType = xPathsData[internetKey].xpaths.type;
            const selectorForSpeed = xPathsData[internetKey].xpaths.speed;
            const selectorForLeastPrice = xPathsData[internetKey].xpaths.leastPrice;
            const selectorForDiscountPrice = xPathsData[internetKey].xpaths.discountedPrice;
        
            const scrapedData = await page.evaluate(
                (dependancy, selectorForPrice, selectorForType, selectorForSpeed, selectorForLeastPrice, selectorForDiscountPrice) => {
                    const parentElement = document.querySelector(dependancy);
                    
                    if (!parentElement) {return null;}
                    
                    const price = parentElement.querySelector(selectorForPrice)?.textContent.trim() || null;
                    const type = parentElement.querySelector(selectorForType)?.textContent.trim() || null;
                    const speed = parentElement.querySelector(selectorForSpeed)?.textContent.trim() || null;
                    const leastPrice = parentElement.querySelector(selectorForLeastPrice)?.textContent.trim() || null;
                    const discountedPrice = parentElement.querySelector(selectorForDiscountPrice)?.textContent.trim() || null;
                    
                    return { price, type, speed, leastPrice, discountedPrice };
                },
                dependancy, selectorForPrice, selectorForType, selectorForSpeed, selectorForLeastPrice, selectorForDiscountPrice
            );
            if(scrapedData !== null){
                subscriptions.push(scrapedData);
            }
            
        } catch (e) {
            console.error(`Error extracting data for ${internetKeys[i]}:`, e.message);
        }
    }
    console.log("START", subscriptions, "SLUT");
    return subscriptions;
}

internetScrapingContents("Park alle 44, 9220");

//                                                 "Alexander Foss Gade 14D, 1 3, 9000"
// Forbindelse der ikke kan få internet fra Telia: "Park alle 44, 9220"