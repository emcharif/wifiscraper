module.exports = { cleanData };

async function cleanData(rawData) {
    const cleanedData = [];

    // Regex to extract numerical values (with or without periods/commas)
    const priceRegex = /\d+(?:,\d{1,2})?/;  // Matches numbers like 199, 1000, 1284
    const leastPriceRegex = /\d{3,5}(?:[\.,]?\d{3})*/; // Matches numbers like 1284, 339, 1.442
    const typeRegex = /(?:5G\s*internet|5G|fiber|fibernet|coax\s*forbindelse?)/i; // Matches various types (case insensitive)
    const discountedPriceRegex = /\d+(?:,\d{1,2})?/; // Matches numbers like 199, 129
    const speedRegex = /\d+\/\d+|\d+/; // Matches speed values like 600/100, 1000/1000 or just 1000

    for (let i = 0; i < rawData.length; i += 2) {
        const companyName = rawData[i];
        const subscriptions = rawData[i + 1];

        // Iterate over the subscriptions for the current company
        for (let subscription of subscriptions) {
            
            const priceMatch = subscription.price.match(priceRegex);
            const leastPriceMatch = subscription.leastPrice.match(leastPriceRegex);
            const typeMatch = subscription.type.match(typeRegex);
            const discountedPriceMatch = subscription.discountedPrice.match(discountedPriceRegex);
            const speedMatch = subscription.speed.match(speedRegex);
            
            // Create a new object for each subscription and add the company name
            const subscriptionObj = {
                company: companyName,
                price: priceMatch ? priceMatch[0] : null, // Extracted price value (e.g., 199, 299, etc.)
                type: typeMatch ? typeMatch[0] : null, // Extracted type (e.g., Fiber, 5G, etc.)
                speed: speedMatch ? speedMatch[0] : null, // Extracted speed value (e.g., 600/100, 1000/1000 or 1000)
                leastPrice: leastPriceMatch ? leastPriceMatch[0].replace(/[.,]/g, "") : null, // Extracted leastPrice value (e.g., 1284, 1442)
                discountedPrice: discountedPriceMatch ? discountedPriceMatch[0] : null, // Extracted discountedPrice value (e.g., 199, 129)
            };

            // Handle "op til 1000mbit" cases
            if (subscription.speed.includes("op til")) {
                const speedMatch = subscription.speed.match(/\d+/);
                subscriptionObj.speed = speedMatch ? speedMatch[0] : null;
            }

            // Add the cleaned subscription object to the cleanedData array
            cleanedData.push(subscriptionObj);
        }
    }

    return cleanedData;
}