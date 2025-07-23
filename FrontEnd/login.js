const loginForm = document.querySelector(".log");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("Formulaire soumis !");

  const email = document.getElementById("mail").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Identifiants incorrects !");
      }
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error(error);

      const existingError = document.querySelector(".error-message");
      if (!existingError) {
        const errorMsg = document.createElement("p");
        errorMsg.textContent = "Erreur : email ou mot de passe incorrect.";
        errorMsg.classList.add("error-message");
        errorMsg.style.color = "red";
        errorMsg.style.textAlign = "center";
        loginForm.appendChild(errorMsg);
      }
    });
});
