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
    // console.log("Bouton modifier cliqué");
    if (document.getElementById("modal")) return;

    const modal = document.createElement("div");
    modal.id = "modal";
    modal.classList.add("modal");

    modal.innerHTML = `
   
   <div class="modal-wrapper">
    
    <div class="modal-gallery-view">
      <span class="modal-close">&times;</span>
      <h3>Galerie photo</h3>
      <div class="modal-gallery"></div>
      <div class="modal-separator"></div>
      <div class="modal-footer">
        <button id="add-photo-btn">Ajouter une photo</button>
      </div>
    </div>

    
    <div class="modal-form-view" style="display: none;">
      <div class="modal-header">
        <span class="modal-back">&larr;</span>
        <span class="modal-close">&times;</span>
      </div>
      <h3>Ajout photo</h3>
      <form id="add-project-form" enctype="multipart/form-data">
        <div class="form-group">
          <label for="image"></label>
          <input type="file" id="image" name="image" accept="image/*" required />
        </div>
        <div class="form-group">
          <label for="title">Titre</label>
          <input type="text" id="title" name="title" required />
        </div>
        <div class="form-group">
          <label for="category">Catégorie</label>
          <select id="category" name="category" required></select>
        </div>
        <div class="modal-separator"></div>
        <button type="submit" id="submit-project">Valider</button>
      </form>
    </div>
  </div>
`;

    document.body.appendChild(modal);

    modal.style.display = "flex";

    const form = modal.querySelector("#add-project-form");
    const selectCategory = modal.querySelector("#category");
    const galleryView = modal.querySelector(".modal-gallery-view");
    const formView = modal.querySelector(".modal-form-view");
    const modalGallery = modal.querySelector(".modal-gallery");

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
      .catch((err) => {
        console.error("Erreur lors du chargement des categories :", err);
      });

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

        const figureMain = document.createElement("figure");
        const imgMain = document.createElement("img");
        imgMain.src = newProject.imageUrl;
        imgMain.alt = newProject.title;
        const captionMain = document.createElement("figcaption");
        captionMain.textContent = newProject.title;
        figureMain.appendChild(imgMain);
        figureMain.appendChild(captionMain);
        gallery.appendChild(figureMain);

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

        form.reset();
        formView.style.display = "none";
        galleryView.style.display = "block";
      } catch (error) {
        alert(`Erreur reseau ou autre : ${error.message}`);
      }
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });

    const closeBtns = modal.querySelectorAll(".modal-close");
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.remove();
      });
    });

    loadModalGallery();

    const addPhotoBtn = modal.querySelector("#add-photo-btn");
    const backBtn = modal.querySelector(".modal-back");

    addPhotoBtn.addEventListener("click", () => {
      galleryView.style.display = "none";
      formView.style.display = "block";
    });

    backBtn.addEventListener("click", () => {
      formView.style.display = "none";
      galleryView.style.display = "block";
    });

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
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
                .then((res) => {
                  if (!res.ok) {
                    throw new Error("Erreur lors de la suppression");
                  }

                  figure.remove();

                  const figures = gallery.querySelectorAll("figure");
                  figures.forEach((fig) => {
                    const imgE1 = fig.querySelector("img");
                    if (imgE1.src === project.imageUrl) {
                      fig.remove();
                    }
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
