// Dynamic year
document.getElementById("year").textContent = new Date().getFullYear();

// Projects data
const projects = [
  { id: "moko", title: "MOKO", category: "Website Design", img: "Assets/Moko/moko-mock1.jpeg", desc: "Website design for MOKO." },
  { id: "longthai", title: "LongThai", category: "Website Design", img: "Assets/Longthai/longthai-mock1.jpeg", desc: "LongThai tourism platform." },
  { id: "freeb", title: "Free-B", category: "Application Design", img: "Assets/Free-B/796_1x_shots_so.jpeg", desc: "Budgeting mobile app design." },
  { id: "preepay", title: "Preepay", category: "Application Design", img: "Assets/Preepay/Preepay-mock1.jpeg", desc: "Wallet & payment UI." },
  { id: "logo", title: "Logo", category: "Logo Design", img: "images/logo1.jpg", desc: "Logo and brand identity." },
  { id: "artwork", title: "Artwork", category: "Artwork", img: "images/art1.jpg", desc: "Poster and illustration." },
];

const grid = document.getElementById("projects-grid");
const filter = document.getElementById("project-filter");

function renderProjects(category) {
  grid.innerHTML = "";
  const filtered = category === "all" ? projects : projects.filter(p => p.category === category);
  
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "project-card";

    // link to project page (e.g. moko.html, longthai.html)
    const projectPage = `${p.id}.html`; 

    card.innerHTML = `
      <a href="${projectPage}">
        <img src="${p.img}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
      </a>
    `;
    grid.appendChild(card);
  });
}

filter.addEventListener("change", e => renderProjects(e.target.value));
renderProjects("all");

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("header nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1); // remove #
      const el = document.getElementById(targetId);

      if (el) {
        // If the target is "banner", no offset
        const yOffset = targetId === "banner" ? 0 : 80;

        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  });
});

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("active");
});