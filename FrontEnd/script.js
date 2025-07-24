const works = "http://localhost:5678/api/works";
const gallery = document.querySelector(".gallery");

fetch(works)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    return response.json();
  })
  .then((projects) => {
    projects.forEach((project) => {
      //   console.log(project);

      const figure = document.createElement("figure");

      const img = document.createElement("img");
      img.src = project.imageUrl;
      img.alt = project.title;

      const caption = document.createElement("figcaption");
      caption.textContent = project.title;

      figure.appendChild(img);
      figure.appendChild(caption);

      gallery.appendChild(figure);
    });
  })
  .catch((error) => {
    console.error("Erreur lors du chargement des projets :", error);
  });

// BOUTONS

const btnfilters = document.getElementById("filters");

fetch("http://localhost:5678/api/categories")
  .then((res) => res.json())
  .then((categories) => {
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.dataset.categoryId = "all";
    allButton.classList.add("filter-btn");
    btnfilters.appendChild(allButton);

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.dataset.categoryId = category.id;
      button.classList.add("filter-btn");
      btnfilters.appendChild(button);
    });

    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const selectedId = btn.dataset.categoryId;
        filterProjects(selectedId);
      });
    });
  });

function filterProjects(categoryId) {
  fetch("http://localhost:5678/api/works")
    .then((res) => res.json())
    .then((projects) => {
      gallery.innerHTML = "";

      const filteredProjects =
        categoryId === "all"
          ? projects
          : projects.filter(
              (project) => project.category.id === parseInt(categoryId)
            );

      filteredProjects.forEach((projects) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = projects.imageUrl;
        img.alt = projects.title;

        const caption = document.createElement("figcaption");
        caption.textContent = projects.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
      });
    });
}

const token = localStorage.getItem("token");
const loginLink = document.getElementById("login-link");
const editBtnContainer = document.getElementById("edit-btn-container");

if (token) {
  loginLink.textContent = "Logout";
  loginLink.href = "#";
  loginLink.style.cursor = "pointer";
  btnfilters.style.display = "none";

  loginLink.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload();
  });

  const editBtn = document.createElement("button");
  editBtn.id = "edit-projects-btn";

  const editIcon = document.createElement("img");
  editIcon.src = "./assets/icons/Group.png";
  editIcon.alt = "modifier";
  editBtn.appendChild(editIcon);
  editBtn.append("modifier");
  editBtnContainer.appendChild(editBtn);

  editBtn.addEventListener("click", () => {
    console.log("Bouton modifier cliqué");
    if (document.getElementById("modal")) return;

    const modal = document.createElement("div");
    modal.id = "modal";
    modal.classList.add("modal");

    modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h3>Galerie photo</h3>
      <div class="modal-gallery">
      </div>
      <button id="add-photo-btn">Ajouter une photo</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.style.display = "flex";

    const closeBtn = modal.querySelector(".modal-close");
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  });

  const editionBanner = document.createElement("div");
  editionBanner.id = "edition-banner";

  const bannerIcon = document.createElement("img");
  bannerIcon.src = "./assets/icons/Vector.png";
  bannerIcon.alt = "Icone édition";

  const bannerText = document.createElement("p");
  bannerText.textContent = "Mode édition";

  editionBanner.appendChild(bannerIcon);
  editionBanner.appendChild(bannerText);

  document.body.prepend(editionBanner);
  document.body.classList.add("has-banner");

  const header = document.querySelector("header");
  header.classList.add("with-banner");
}
