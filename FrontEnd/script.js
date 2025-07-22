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
