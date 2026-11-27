let allWorks = [];

/**
 * @param {Array} works
 */
const displayWorks = (works) => {
    const gallery = document.querySelector(".gallery");

    gallery.innerHTML = "";

    gallery.innerHTML = works.map(work => `
        <figure>
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        </figure>
    `).join("");
};

/**
 * @param {Array} categories
 */
const displayFilters = (categories) => {
    const filters = document.querySelector(".filters");

    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-button", "active");
    allButton.addEventListener("click", () => {
        displayWorks(allWorks);
        setActiveButton(allButton);
    });
    filters.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-button");

        button.addEventListener("click", () => {
            const filteredWorks = allWorks.filter(work => work.categoryId === category.id);
            displayWorks(filteredWorks);
            setActiveButton(button);
        });

        filters.appendChild(button);
    });
};

/**
 * @param {HTMLElement} clickedButton
 */
const setActiveButton = (clickedButton) => {
    const buttons = document.querySelectorAll(".filter-button");
    buttons.forEach(button => {
        button.classList.remove("active");
    });
    clickedButton.classList.add("active");
};

const checkUserLogin = () => {
    const token = localStorage.getItem("token");

    if (token) {
        const editBanner = document.createElement("div");
        editBanner.classList.add("edit-banner");
        editBanner.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
        document.body.prepend(editBanner);

        const loginlink = document.querySelector("ul li a[href='login.html']");
        if (loginlink) {
            loginlink.textContent = "logout";
            loginlink.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.reload();
            });
        }

        const filtersContainer = document.querySelector(".filters");
        if (filtersContainer) {
            filtersContainer.style.display = "none";
        }

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

const modal = document.querySelector("#modal");
const galleryView = document.querySelector("#modal-gallery-view");
const formView = document.querySelector("#modal-form-view");
const backButton = document.querySelector("#modal-back");

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

const setupModal = () => {
    document.querySelector("#modal-close").addEventListener("click", closeModal);
    document.querySelector("#modal-add-btn").addEventListener("click", showFormView);
    backButton.addEventListener("click", showGalleryView);


    document.querySelector(".modal-gallery").addEventListener("click", async (event) => {
        const deleteButton = event.target.closest(".delete-btn");
        if (!deleteButton) return;

        const id = Number(deleteButton.dataset.id);
        const success = await deleteWorkFromApi(id);

        if (success) {
            allWorks = allWorks.filter(work => work.id !== id);
            displayWorks(allWorks);
            displayModalWorks(allWorks);
        } else {
            alert("La suppression a échoué.");
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
};

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