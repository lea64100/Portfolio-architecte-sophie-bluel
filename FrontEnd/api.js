const API_BASE_URL = "http://localhost:5678/api";

/**
 * Récupère toutes les catégories depuis l'API
 */
const getCategoriesFromApi = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error("Impossible de récupérer les catégories :", error);
        return [];
    }
};

/**
 * Récupère tous les projets depuis l'API 
 */
const getWorksFromApi = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/works`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const works = await response.json();
        return works;
    } catch (error) {
        console.error("Impossible de récupérer les projets :", error);
        return [];
    }
};

// Supprime un projet avec l'API (il faut être connecté)
const deleteWorkFromApi = async (id) => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error("Impossible de supprimer le projet :", error);
        return false;
    }
};

// Ajoute un nouveau projet à l'API (il faut être connecté)
const addWorkToApi = async (formData) => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/works`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Impossible d'ajouter le projet :", error);
        return null;
    }
};