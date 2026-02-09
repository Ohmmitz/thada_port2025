document.addEventListener('DOMContentLoaded', () => {
        const links = document.querySelectorAll('a.scroll-link, a[href^="#"]:not([href="#"])');

        links.forEach(link => {
            link.addEventListener('click', function (e) {
            const href = this.getAttribute('href') || '';
            if (!href.startsWith('#')) return; // not an in-page anchor

            const targetId = href.slice(1);
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            e.preventDefault(); // stop the browser's instant jump

            // 1) Try to detect a fixed header's height automatically
            const header = document.querySelector('header, .site-header, .fixed-header, .navbar, .topbar');
            const headerHeight = header ? header.getBoundingClientRect().height : 0;

            // 2) Extra manual offset (set to 120 if you want the element to sit 120px below top)
            const manualOffset = 0; // <-- change to 0 if you want it flush to the top

            // Calculate final scroll destination (page coordinates)
            const rectTop = targetEl.getBoundingClientRect().top;
            const pageY = window.pageYOffset || window.scrollY || 0;
            // Subtract headerHeight + manualOffset so the element ends *below* the header by that many px
            let targetY = rectTop + pageY - headerHeight - manualOffset;

            // Prevent negative values (can't scroll above the page top)
            targetY = Math.max(0, Math.round(targetY));

            // DEBUG: open DevTools Console to see values if it's not working
            console.log('scroll ->', { targetId, rectTop, pageY, headerHeight, manualOffset, targetY });

            // Smooth scroll
            window.scrollTo({ top: targetY, behavior: 'smooth' });

            // Update URL without causing another jump
            history.pushState(null, '', '#' + targetId);
            });
        });
        });

const images = document.querySelectorAll('.lightbox-img');
const overlay = document.getElementById('overlay');
const fullImage = document.getElementById('fullImage');
const alret = document.querySelector('.alret');

images.forEach(img => {
  img.addEventListener('click', () => {
    fullImage.src = img.src;

    overlay.style.display = 'flex';
    fullImage.classList.remove('animate-out');
    fullImage.classList.add('animate-in');

    // Animate alert in
    alret.classList.remove('alret-out');
    alret.classList.add('alret-in');
  });
});

overlay.addEventListener('click', (e) => {
  if (e.target !== fullImage) {
    // Animate out
    fullImage.classList.remove('animate-in');
    fullImage.classList.add('animate-out');

    alret.classList.remove('alret-in');
    alret.classList.add('alret-out');

    // Hide overlay after animation finishes
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 400); // match animation duration
  }
});
        


const isReducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isTouch = window.matchMedia('(pointer: coarse').matches;
const shouldRun = !isReducedMotion && !isTouch;


if (shouldRun) {
    let mouseX =0
    let mouseY =0

    const pointer = document.querySelector('.pointer');
    const coordinates = document.querySelector('#coordinates strong');

    window.addEventListener('mousemove' , (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // console.log(mouseX, mouseY);

        if (coordinates) {
            coordinates.innerText = `x: ${mouseX} y: ${mouseY}`;
        }

    });

    function animate() {
        pointer.style.setProperty('--mouseX', `${mouseX}px`);
        pointer.style.setProperty('--mouseY', `${mouseY}px`);
        requestAnimationFrame(animate);

    }

    animate();

    document.getElementById('certificate-btn').addEventListener('click', () => {
    window.location.href = 'https://www.canva.com/design/DAGpGaEI5JY/0MV1tPGk39DahBaWaokHQA/edit';

    
});
}
  