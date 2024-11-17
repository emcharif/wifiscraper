import { generateSubscriptionCard } from './internetGenerateCard.js';

document.getElementById('addressForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const address = document.getElementById('addressField').value.trim();
    console.log("Address entered:", address);

    if (!address) {
        console.error('Address is required');
        return;
    }

    const encodedAddress = encodeURIComponent(address);
    console.log("Encoded Address:", encodedAddress);

    try {
        const response = await fetch('/searchingAvailableConnections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: encodedAddress })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Server Response:', data);

        // Assuming the data is an array of subscription objects
        const subscriptionContainer = document.getElementById('outputContents'); // Make sure this container exists in the HTML
        subscriptionContainer.innerHTML = ''; // Clear previous results

        // Loop over the subscriptions and create cards
        data.forEach(async (subscription) => {
            // Check if the required properties exist and handle errors
            if (!subscription.price || !subscription.type || !subscription.discountedPrice || !subscription.leastPrice) {
                console.log("Error: Subscription data is incomplete.");
                return; // Skip this subscription if important data is missing
            }

            // Generate the subscription card
            const subscriptionCard = await generateSubscriptionCard(subscription);

            // Append the card to the container
            if (subscriptionCard instanceof Node) {
                subscriptionContainer.appendChild(subscriptionCard);
            } else {
                console.error("Generated card is not a valid node.");
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
});
