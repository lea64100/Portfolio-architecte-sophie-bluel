// api.js - Gestion de tous les appels réseaux vers le Backend

const API_BASE_URL = "http://localhost:5678/api";

/**
 * Récupère tous les projets depuis l'API
 * @returns {Promise<Array>} Tableau des projets
 */
async function getWorksFromApi() {
    try {
        const response = await fetch(`${API_BASE_URL}/works`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        
        const works = await response.json();
        return works;
    } catch (error) {
        console.error("Impossible de récupérer les projets :", error);
        return []; // Retourne un tableau vide en cas d'erreur pour ne pas casser le site
    }
}

/**
 * Récupère toutes les catégories depuis l'API
 * @returns {Promise<Array>} Tableau des catégories
 */
async function getCategoriesFromApi() {
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
}