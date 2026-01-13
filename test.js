
const menuToggle = document.getElementById('menuToggle');
const menuList = document.getElementById('menuList');

menuToggle.addEventListener('click', () => {
    menuList.classList.toggle('show');
});

const lenis = new Lenis({
    smooth: true,
    lerp: 0.08,
    smoothWheel: true
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
requestAnimationFrame(raf);




const circle = document.querySelector('.banner-circle');
const banner = document.getElementById('banner');

const startSize = 160;
const speed = 2;
const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2;

function animateCircle() {
  const scrollY = window.scrollY;
  const bannerHeight = banner.offsetHeight;

  let progress = Math.min((scrollY / bannerHeight) * speed, 1);
  progress = 1 - Math.pow(1 - progress, 3);

  const size = startSize + (maxSize - startSize) * progress;
  const offset = (size - startSize) / 2;

  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.top = `${180 - offset}px`;
  circle.style.right = `${120 - offset}px`;

  const hidePoint = window.innerHeight * 1.4;

  if (scrollY >= hidePoint) {
    circle.classList.add('hide');
  } else {
    circle.classList.remove('hide');
  }

  requestAnimationFrame(animateCircle);
}

animateCircle();

const backToTop = document.getElementById('backToTop');

backToTop.addEventListener('click', e => {
  e.preventDefault();
  lenis.scrollTo(banner, {
    duration: 1.2,
    easing: t => 1 - Math.pow(1 - t, 3)
  });
});

const items = document.querySelectorAll('.container .img-box');


let lastScrollY = window.scrollY;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting) {
        // scroll ลง → show
        el.classList.add('show');
      } else {
        // scroll ขึ้น → hide
        el.classList.remove('show');
      }
    });
  },
  {
    threshold: 0.3
  }
);

items.forEach(item => observer.observe(item));

const delayPerItem = 80;
const groupSize = 6;

items.forEach((item, i) => {
  const delay = (i % groupSize) * delayPerItem;
  item.style.transitionDelay = `${delay}ms`;
});