const form = document.querySelector("#login form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const userCredentials = {
        email: email,
        password: password
    };

    try {
       const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userCredentials)
        });

        if (response.ok) {
            const data = await response.json();
        
            localStorage.setItem("token", data.token);

            window.location.href = "index.html";
        } else {
            alert("Erreur dans l'identifiant ou le mot de passe.");
        }
    } catch (error) {
        console.error("Erreur lors de la requête de connexion :", error);
        alert("Impossible de contacter le serveur.");
    }
});