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

        images.forEach(img => {
            img.addEventListener('click', () => {
            fullImage.src = img.src;
            overlay.style.display = 'flex';
            });
        });

        overlay.addEventListener('click', (e) => {
            if (e.target !== fullImage) {
            overlay.style.display = 'none';
            }
        });
  