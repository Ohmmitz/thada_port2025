// Dynamic year
document.getElementById("year").textContent = new Date().getFullYear();


const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("active");
});


