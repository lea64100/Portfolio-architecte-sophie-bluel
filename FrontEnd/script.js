let allWorks = [];

/**
 * Affiche les projets dans la galerie HTML
 * @param {Array} works
 */
const displayWorks = (works) => {
    const gallery = document.querySelector(".gallery");

    gallery.innerHTML = "";

    //.map() pour transformer chaque projet en balise HTML, puis .join("") pour tout injecter d'un coup
    gallery.innerHTML = works.map(work => `
        <figure>
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        </figure>
    `).join("");
};

/**
 * Boutons de filtres dynamiques
 * @param {Array} categories - Le tableau des catégories récupérées de l'API
 */
const displayFilters = (categories) => {
    const filters = document.querySelector(".filters");

    // 1. Bouton "Tous" par défaut
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-button", "active");
    allButton.addEventListener("click", () => {
        displayWorks(allWorks);
        setActiveButton(allButton);
    });
    filters.appendChild(allButton);

    // 2. Boutons dynamique des catégories pour chaque catégorie de l'API
    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-button");

        // Au clic sur un filtre, on filtre les projets correspondants
        button.addEventListener("click", () => {
            const filteredWorks = allWorks.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
            setActiveButton(button);
        });

        filters.appendChild(button);
    });
};

/**
 * Bouton actif (couleur de fond et texte)
 * @param {HTMLElement} clickedButton
 */
const setActiveButton = (clickedButton) => {
    const buttons = document.querySelectorAll(".filter-button");
    buttons.forEach(button => {
        button.classList.remove("active");
    });
    clickedButton.classList.add("active");
};

/**
 * Si l'utilisateur est connecté active le Mode édition
 */
const checkUserLogin = () => {
    const token = localStorage.getItem("token");

    if (token) {
        // 1. Bandeau noir
        const editBanner = document.createElement("div");
        editBanner.classList.add("edit-banner");
        editBanner.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
        document.body.prepend(editBanner);

        // 2. "login" (co) en "logout" (déco)
        const loginlink = document.querySelector("ul li a[href='login.html']");
        if (loginlink) {
            loginlink.textContent = "logout";
            loginlink.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.reload();
            });
        }

        // 3. Enlever les filtres
        const filtersContainer = document.querySelector(".filters");
        if (filtersContainer) {
            filtersContainer.style.display = "none";
        }

        // 4. Bouton de modif a côté de "Mes projets"
        const portfolioTitle = document.querySelector("#portfolio h2");
        if (portfolioTitle) {
            const editButton = document.createElement("button");
            editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
            editButton.classList.add("btn-edit");
            editButton.addEventListener("click", openModal);
            portfolioTitle.appendChild(editButton);
        }
    } 
};

/**
 * Utilisateur co + clique sur modifier pour afficher la modale
 */

const modal = document.querySelector("#modal");
const galleryView = document.querySelector("#modal-gallery-view");
const formView = document.querySelector("#modal-form-view");
const backButton = document.querySelector("#modal-back");

/** Miniatures de la modale*/
const displayModalWorks = (works) => {
    const modalGallery = document.querySelector(".modal-gallery");
    modalGallery.innerHTML = works.map(work => `
        <figure>
            <img src="${work.imageUrl}" alt="${work.title}">
            <button class="delete-btn" data-id="${work.id}" aria-label="Supprimer">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </figure>
    `).join("");
};

const showGalleryView = () => {
    galleryView.classList.remove("hidden");
    formView.classList.add("hidden");
    backButton.classList.add("hidden");
};

const showFormView = () => {
    galleryView.classList.add("hidden");
    formView.classList.remove("hidden");
    backButton.classList.remove("hidden");
};

const openModal = () => {
    displayModalWorks(allWorks);
    showGalleryView();
    modal.classList.remove("hidden");
};

const closeModal = () => {
    modal.classList.add("hidden");
};

/** Clics de la modale (une fois) */
const setupModal = () => {
    document.querySelector("#modal-close").addEventListener("click", closeModal);
    document.querySelector("#modal-add-btn").addEventListener("click", showFormView);
    backButton.addEventListener("click", showGalleryView);

    // Clic corbeille : suppression d'un projet
    document.querySelector(".modal-gallery").addEventListener("click", async (event) => {
        const deleteButton = event.target.closest(".delete-btn");
        if (!deleteButton) return;

        const id = Number(deleteButton.dataset.id);
        const success = await deleteWorkFromApi(id);

        if (success) {
            // Retire le projet de la mémoire, puis réaffiche les deux galeries
            allWorks = allWorks.filter(work => work.id !== id);
            displayWorks(allWorks);
            displayModalWorks(allWorks);
        } else {
            alert("La suppression a échoué.");
        }
    });

    // Clic sur le fond sombre (pas fenêtre blanche)
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
};

/**
 * Fonction d'initialisation de l'application au chargement de la page
 */
const init = async () => {
    allWorks = await getWorksFromApi();
    displayWorks(allWorks);

    const categories = await getCategoriesFromApi();
    displayFilters(categories);
    fillCategorySelect(categories);

    setupModal();
    setupAddForm();

    checkUserLogin();
};

const fillCategorySelect = (categories) => {
    const select = document.querySelector("#work-category");
    select.innerHTML = '<option value=""></option>' + categories.map(category => `
        <option value="${category.id}">${category.name}</option>
    `).join("");
};

// Formulaire d'ajout (preview, vérification, envoi)
const setupAddForm = () => {
    const form = document.querySelector("#add-work-form");
    const imageInput = document.querySelector("#work-image");
    const titleInput = document.querySelector("#work-title");
    const categorySelect = document.querySelector("#work-category");
    const preview = document.querySelector("#work-preview");
    const uploadZone = document.querySelector(".upload-zone");
    const message = document.querySelector("#form-message");
    const submitButton = form.querySelector("input[type='submit']");

    const showMessage = (text, isSuccess) => {
        message.textContent = text;
        message.classList.toggle("success", isSuccess);
    };

    // Le bouton est gris tant que tout n'est pas rempli
    const updateSubmitStyle = () => {
        const isComplete = imageInput.files[0] && titleInput.value.trim() && categorySelect.value;
        submitButton.classList.toggle("inactive", !isComplete);
    };

    const resetForm = () => {
        form.reset();
        preview.classList.add("hidden");
        uploadZone.classList.remove("has-preview");
        message.textContent = "";
        updateSubmitStyle();
    };

    // Preview au choix d'une image
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            imageInput.value = "";
            showMessage("L'image ne doit pas dépasser 4 Mo.", false);
            return;
        }

        preview.src = URL.createObjectURL(file);
        preview.classList.remove("hidden");
        uploadZone.classList.add("has-preview");
        message.textContent = "";
        updateSubmitStyle();
    });

    titleInput.addEventListener("input", updateSubmitStyle);
    categorySelect.addEventListener("change", updateSubmitStyle);
    updateSubmitStyle();

    // Envoi du formulaire
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const file = imageInput.files[0];
        const title = titleInput.value.trim();
        const category = categorySelect.value;

        if (!file || !title || !category) {
            showMessage("Merci de remplir tous les champs.", false);
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("category", category);

        const newWork = await addWorkToApi(formData);

        if (newWork) {
            newWork.categoryId = Number(newWork.categoryId);

            allWorks.push(newWork);

            displayWorks(allWorks);
            displayModalWorks(allWorks);

            resetForm();
            showGalleryView();
        } else {
            showMessage("L'envoi a échoué, réessaie.", false);
        }
    });
};

init();