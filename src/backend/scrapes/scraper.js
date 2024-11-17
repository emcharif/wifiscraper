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
            await wait(2);

            await page.click(confirmAddress)
        } catch (e) {
            await page.keyboard.press("Enter");
            console.error("Error navigating and interacting with the page:", e.message);
        }
        
        try {
            const results = await extractInformation(page, data, { visible: true, timeout: 3000 });
            allSubscriptions.push(company, results);
        } catch (error) {
            console.error("Der er sket en fejl:", error.message);
        }
    }
    await browser.close();
    return allSubscriptions;
}



async function extractInformation(page, xPathsData) {
    const internetKeys = Object.keys(xPathsData).filter(key => key.startsWith('internet'));
    const isPageLoadedDependancy = xPathsData.general.pageLoadedBody;
    let subscriptions = [];

    await page.waitForSelector(isPageLoadedDependancy, { visible: true });
    
    await checkForProviderAvailability(page, xPathsData);

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
            
            if (scrapedData !== null) {
                subscriptions.push(scrapedData);
            }
        } catch (e) {
            console.error(`Error extracting data for ${internetKeys[i]}:`, e.message);
        }
    }
    return subscriptions;
}

async function checkForProviderAvailability(page, xPathsData){
    let noAvailableConnection = xPathsData.general.noConnectionFoundSelector;
    console.log("noAvailableConnection: >", noAvailableConnection, "<");

    if(noAvailableConnection != "alwaysConnectionAvailableOnTheWebsite__"){
        try {
            await page.waitForSelector(noAvailableConnection, { visible: true, timeout: 2000 });

            const errorMessages = await page.$$eval(noAvailableConnection, (elements) => {
                return elements.map(el => el.textContent.trim());
            });

            const expectedText = xPathsData.general.noConnectionFound;
            const foundMessage = errorMessages.find(text => text.includes(expectedText));

            if (foundMessage) {
                console.log("Match between foundMessage:", foundMessage);
                return [];
            }
        } catch (error) {
            console.error("Error while checking connection availability:", error.message);
        }
    }
    return [true];
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
        const data = await fs.readFile(`./data/${company}XPaths.json`, 'utf8');
        const totalXPaths = JSON.parse(data);
        return totalXPaths;
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        return null;
    }
}

// "Alexander Foss Gade 14D, 1 3, 9000"     Forbindelse der både kan få fiber og 5G
// "Park Alle 44, 9220"                     Forbindelse der ikke kan få internet fra Telia


// TODO
    // Hver anden side skal åbnes i en ny page
    // Fikse catch or error statements
    //