// script.js - Gestion de l'affichage, du DOM et des événements (filtres, clics)

// Variable globale pour stocker les projets et pouvoir les filtrer facilement
window.allWorks = [];

/**
 * Affiche les projets dans la galerie HTML
 * @param {Array} works - Le tableau des projets à afficher
 */
function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    
    // On vide la galerie avant de la remplir pour éviter les doublons
    gallery.innerHTML = "";

    // On utilise .map() pour transformer chaque projet en balise HTML, puis .join("") pour tout injecter d'un coup
    gallery.innerHTML = works.map(work => `
        <figure>
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        </figure>
    `).join("");
}

/**
 * Affiche les boutons de filtres dynamiquement
 * @param {Array} categories - Le tableau des catégories récupérées de l'API
 */
function displayFilters(categories) {
    const filters = document.querySelector(".filters");

    // 1. Création manuelle du bouton "Tous" par défaut
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-button", "active");
    allButton.addEventListener("click", () => {
        displayWorks(window.allWorks);
        setActiveButton(allButton);
    });
    filters.appendChild(allButton);

    // 2. Création dynamique des boutons pour chaque catégorie de l'API
    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-button");
        
        // Au clic sur un filtre, on filtre les projets correspondants
        button.addEventListener("click", () => {
            const filteredWorks = window.allWorks.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
            setActiveButton(button);
        });
        
        filters.appendChild(button);
    });
}

/**
 * Gère l'effet visuel du bouton actif (change sa couleur de fond)
 * @param {HTMLElement} clickedButton - Le bouton sur lequel l'utilisateur vient de cliquer
 */
function setActiveButton(clickedButton) {
    const buttons = document.querySelectorAll(".filter-button");
    buttons.forEach(button => {
        button.classList.remove("active");
    });
    clickedButton.classList.add("active");
}

/**
 * Vérifie si l'utilisateur est connecté et adapte l'interface (Mode édition)
 */
function checkUserLogin() {
    const token = localStorage.getItem("token");
    
    if (token) {
        // 1. Afficher le bandeau noir "Mode édition" en haut de la page
        const editBanner = document.createElement("div");
        editBanner.classList.add("edit-banner");
        editBanner.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
        document.body.prepend(editBanner);

        // 2. Transformer le lien "login" en "logout"
        const loginLink = document.querySelector("nav ul li a[href='login.html']");
        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.reload();
            });
        }

        // 3. Masquer les filtres de catégories
        const filtersContainer = document.querySelector(".filters");
        if (filtersContainer) {
            filtersContainer.style.display = "none";
        }

        // 4. Afficher le bouton de modification à côté de "Mes projets"
        const portfolioTitle = document.querySelector("#portfolio h2");
        if (portfolioTitle) {
            const editButton = document.createElement("button");
            editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
            editButton.classList.add("btn-edit");
            portfolioTitle.appendChild(editButton);
        }
    }
}

/**
 * Fonction d'initialisation de l'application au chargement de la page
 */
async function init() {
    // 1. Récupération et affichage des projets
    window.allWorks = await getWorksFromApi();
    displayWorks(window.allWorks);
    
    // 2. Récupération et affichage des catégories / filtres
    const categories = await getCategoriesFromApi();
    displayFilters(categories);

    // 3. Application du mode connecté si un token est présent
    checkUserLogin();
}

// Lancement de l'application
init();