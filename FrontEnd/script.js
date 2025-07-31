// script.js
const works = "http://localhost:5678/api/works";
const gallery = document.querySelector(".gallery");
const btnfilters = document.getElementById("filters");
const loginLink = document.getElementById("login-link");
const editBtnContainer = document.getElementById("edit-btn-container");
const modalsContainer = document.getElementById("modals-container");

const token = localStorage.getItem("token");

// ================= PUBLIC =================

// Affichage des projets

function loadProjects() {
  fetch(works)
    .then((response) => {
      if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
      return response.json();
    })
    .then((projects) => {
      projects.forEach((project) => {
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
}

// Chargement des filtres
function loadFilters() {
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
}

function filterProjects(categoryId) {
  fetch(works)
    .then((res) => res.json())
    .then((projects) => {
      gallery.innerHTML = "";
      const filteredProjects =
        categoryId === "all"
          ? projects
          : projects.filter(
              (project) => project.category.id === parseInt(categoryId)
            );

      filteredProjects.forEach((project) => {
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
    });
}

loadProjects();
loadFilters();

// ================= ADMIN =================

if (token) {
  // lien login logout

  loginLink.textContent = "Logout";
  loginLink.href = "#";
  loginLink.style.cursor = "pointer";
  loginLink.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload();
  });

  //   cacher les filtres
  btnfilters.classList.add("hidden");

  // Bandeau d'édition

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
  document.querySelector("header").classList.add("with-banner");

  // Ajout bouton modifier

  const editBtn = document.createElement("button");
  editBtn.id = "edit-projects-btn";
  const editIcon = document.createElement("img");
  editIcon.src = "./assets/icons/Group.png";
  editIcon.alt = "modifier";
  editBtn.appendChild(editIcon);
  editBtn.append("modifier");
  editBtnContainer.appendChild(editBtn);

  // Ouvrir Modale
  editBtn.addEventListener("click", () => {
    if (document.getElementById("modal")) return;
    fetch("modal.html")
      .then((res) => res.text())
      .then((html) => {
        modalsContainer.innerHTML = html;
        initializeModalFeatures();
      });
  });

  function initializeModalFeatures() {
    const modal = document.getElementById("modal");
    const galleryView = modal.querySelector(".modal-gallery-view");
    const formView = modal.querySelector(".modal-form-view");
    const modalGallery = modal.querySelector(".modal-gallery");
    const closeBtns = modal.querySelectorAll(".modal-close");
    const addPhotoBtn = modal.querySelector("#add-photo-btn");
    const backBtn = modal.querySelector(".modal-back");
    const form = modal.querySelector("#add-project-form");
    const selectCategory = modal.querySelector("#category");
    const imageInput = form.querySelector("#image");
    const titleInput = form.querySelector("#title");
    const submitBtn = form.querySelector("#submit-project");
    const uploadPreviewContainer = form.querySelector(".upload-preview");
    const uploadPlaceholder = form.querySelector(".upload-placeholder");

    // Affichage apercu image

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        // cacher par defaut
        uploadPlaceholder.style.display = "none";

        uploadPreviewContainer.style.display = "flex";

        // affichage
        uploadPreviewContainer.innerHTML = "";
        const previewImg = document.createElement("img");
        previewImg.src = e.target.result;
        previewImg.alt = "Apercu image";
        previewImg.classList.add("preview-img");
        uploadPreviewContainer.appendChild(previewImg);
      };
      reader.readAsDataURL(file);

      checkFormValidity();
    });

    // Validation formulaire

    function checkFormValidity() {
      const isValid =
        imageInput.files.length > 0 &&
        titleInput.value.trim() !== "" &&
        selectCategory.value;

      if (isValid) {
        submitBtn.disabled = false;
        submitBtn.classList.add("active");
      } else {
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
      }
    }

    [imageInput, titleInput, selectCategory].forEach((input) => {
      input.addEventListener("input", checkFormValidity);
    });

    // Option par defaut dans le select
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.hidden = true;
    selectCategory.appendChild(defaultOption);

    // Charger categories dynamiquement
    fetch("http://localhost:5678/api/categories")
      .then((res) => res.json())
      .then((categories) => {
        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          selectCategory.appendChild(option);
        });
      })
      .catch(console.error);

    // Fermer modal clic croix ou en dehors
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => modal.remove());
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });

    // naviagtion entre Modales
    addPhotoBtn.addEventListener("click", () => {
      galleryView.classList.add("hidden");
      formView.classList.remove("hidden");
    });

    backBtn.addEventListener("click", () => {
      formView.classList.add("hidden");
      galleryView.classList.remove("hidden");
    });

    // Chargement de la gallery dans la modal
    function loadModalGallery() {
      fetch(works)
        .then((res) => res.json())
        .then((projects) => {
          modalGallery.innerHTML = "";
          projects.forEach((project) => {
            const figure = document.createElement("figure");
            const img = document.createElement("img");
            img.src = project.imageUrl;
            img.alt = project.title;

            const trashIcon = document.createElement("img");
            trashIcon.src = "./assets/icons/trash.png";
            trashIcon.alt = "Supprimer";
            trashIcon.classList.add("trash-icon");

            trashIcon.addEventListener("click", () => {
              fetch(`${works}/${project.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              })
                .then((res) => {
                  if (!res.ok) throw new Error("Erreur lors de la suppression");
                  figure.remove();
                  const figures = gallery.querySelectorAll("figure");
                  figures.forEach((fig) => {
                    const imgEl = fig.querySelector("img");
                    if (imgEl.src === project.imageUrl) fig.remove();
                  });
                })
                .catch((err) => {
                  alert("Impossible de supprimer l'image : " + err.message);
                });
            });

            figure.appendChild(img);
            figure.appendChild(trashIcon);
            modalGallery.appendChild(figure);
          });
        });
    }

    loadModalGallery();

    // Formulaire d'ajout

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const imageInput = form.querySelector("#image");
      const titleInput = form.querySelector("#title");
      const categorySelect = form.querySelector("#category");

      if (
        !imageInput.files.length ||
        !titleInput.value.trim() ||
        !categorySelect.value
      ) {
        alert("Merci de remplir tous les champs correctement.");
        return;
      }

      const formData = new FormData();
      formData.append("image", imageInput.files[0]);
      formData.append("title", titleInput.value.trim());
      formData.append("category", categorySelect.value);

      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(
            `Erreur lors de l'envoi : ${
              errorData.message || response.statusText
            }`
          );
          return;
        }

        const newProject = await response.json();
        alert("Projet ajouté avec succès !");

        // Ajout dans la gallery principal

        const figureMain = document.createElement("figure");
        const imgMain = document.createElement("img");
        imgMain.src = newProject.imageUrl;
        imgMain.alt = newProject.title;
        const captionMain = document.createElement("figcaption");
        captionMain.textContent = newProject.title;
        figureMain.appendChild(imgMain);
        figureMain.appendChild(captionMain);
        gallery.appendChild(figureMain);

        // Ajout dans la modale

        const figureModal = document.createElement("figure");
        const imgModal = document.createElement("img");
        imgModal.src = newProject.imageUrl;
        imgModal.alt = newProject.title;

        const trashIcon = document.createElement("img");
        trashIcon.src = "./assets/icons/trash.png";
        trashIcon.alt = newProject.title;
        trashIcon.classList.add("trash-icon");

        trashIcon.addEventListener("click", () => {
          fetch(`${works}/${newProject.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => {
              if (!res.ok) throw new Error("Erreur lors de la suppression");
              figureModal.remove();
              figureMain.remove();
            })
            .catch((err) =>
              alert("Impossible de supprimer l'image : " + err.message)
            );
        });

        figureModal.appendChild(imgModal);
        figureModal.appendChild(trashIcon);
        modalGallery.appendChild(figureModal);

        // Réinitialiser le formulaire
        form.reset();
        uploadPreviewContainer.innerHTML = "";
        uploadPreviewContainer.classList.add("hidden");
        uploadPlaceholder.classList.remove("hidden");
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");

        // Retour à la vue galerie dans la modale
        formView.style.display = "none";
        galleryView.style.display = "block";
      } catch (error) {
        alert(`Erreur réseau ou autre : ${error.message}`);
      }
    });
  }
}
