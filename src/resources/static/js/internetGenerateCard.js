export async function generateSubscriptionCard(subscription) {
    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('broadbandCards');

    // Create section 1: Logo
    const section1 = document.createElement('div');
    section1.classList.add('section1');
    const img = document.createElement('img');
    console.log(subscription.company);
    img.setAttribute('src', `../img/${subscription.company}Logo.png`);  // Add logo URL dynamically
    img.setAttribute('alt', `${subscription.company} logo`);
    section1.appendChild(img);
    cardContainer.appendChild(section1);

    // Create section 2: Subscription info
    const section2 = document.createElement('div');
    section2.classList.add('section2');
    const infoItems = [
        { label: 'Type', value: subscription.type },
        { label: 'Rabat pris', value: subscription.discountedPrice },
        { label: 'Fast pris', value: subscription.price }
    ];

    infoItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.label}: ${item.value}`;
        section2.appendChild(listItem);
    });
    
    cardContainer.appendChild(section2);

    // Create section 3: Speed info
    const section3 = document.createElement('div');
    section3.classList.add('section3');
    const speedItem = document.createElement('li');
    speedItem.textContent = `Speed: ${subscription.speed}`;
    section3.appendChild(speedItem);

    cardContainer.appendChild(section3);

    // Create section 4: Order button and Least Price
    const section4 = document.createElement('div');
    section4.classList.add('section4');
    
    const orderButton = document.createElement('button');
    orderButton.textContent = 'Bestil/se mere';
    section4.appendChild(orderButton);

    const leastPriceItem = document.createElement('li');
    leastPriceItem.textContent = `Mindste Pris: ${subscription.leastPrice}`;
    section4.appendChild(leastPriceItem);

    cardContainer.appendChild(section4);

    return cardContainer;
}
