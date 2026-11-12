// Récupération du formulaire de connexion
const form = document.querySelector("#login form");

form.addEventListener("submit", async (event) => {
    // Empêche le rechargement par défaut de la page lors de la soumission
    event.preventDefault();

    // Récupération des valeurs des champs email et mot de passe
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Création de l'objet contenant les identifiants pour l'API
    const userCredentials = {
        email: email,
        password: password
    };

    try {
        // Envoi de la requête POST à l'API de connexion
       const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userCredentials)
        });

        // Si la connexion réussie (statut 200-299)
        if (response.ok) {
            const data = await response.json();
            
            // Stockage du token d'authentification dans le localStorage
            localStorage.setItem("token", data.token);

            // Redirection vers la page d'accueil
            window.location.href = "index.html";
        } else {
            // Si l'authentification échoue (mauvais identifiants ou mot de passe)
            alert("Erreur dans l'identifiant ou le mot de passe.");
        }
    } catch (error) {
        console.error("Erreur lors de la requête de connexion :", error);
        alert("Impossible de contacter le serveur.");
    }
});