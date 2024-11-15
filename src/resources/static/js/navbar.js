function generateNavbar() {
    const navbar = document.getElementById("navbar");

    // Create navigation buttons
    const pages = [
        { name: "Forside", link: "/" },
        { name: "Bredbåndssiden", link: "/sammenlign-internet" },
        { name: "Mobil", link: "/sammenlign-mobil" },
        { name: "Strøm", link: "/sammenlign-strom" },
        { name: "TV", link: "/sammenlign-tv" }
    ];

    // Loop through pages and create buttons
    pages.forEach(page => {
        const button = document.createElement("button");
        button.textContent = page.name;
        button.onclick = () => window.location.href = page.link;
        button.classList.add("nav-button"); // Add a CSS class for styling
        navbar.appendChild(button);
    });
}

// Call the function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", generateNavbar);
