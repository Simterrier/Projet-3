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
