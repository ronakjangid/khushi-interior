// Mobile detection and nav functionality
const init = () => {
    const html = document.documentElement;
    const navButton = document.getElementById('nav-button');

    // Detect mobile/tablet
    function checkMobile() {
        if (window.innerWidth <= 768) {
            html.classList.add('is-mobile');
        } else {
            html.classList.remove('is-mobile');
        }
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Nav button toggle
    if (navButton) {
        navButton.addEventListener('click', () => {
            html.classList.toggle('nav-opened');
            const expanded = html.classList.contains('nav-opened');
            navButton.setAttribute('aria-expanded', expanded);
        });
    }

    // ====================== SMOOTH SCROLL (GSAP) ======================
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        effects: true,
        smoothTouch: 0.2
    });

    // ====================== HERO SHRINK ANIMATION ======================
    gsap.to("#hero-bg", {
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
        },
        scale: 0.9,
        borderRadius: "40px",
        ease: "none"
    });


gsap.utils.toArray('img').forEach(img => {
    if (img.closest('#hero')) return;
    if (img.closest('.images-sliding-rows')) return;
    if (img.closest('.footer-logo-symb')) return;

    gsap.fromTo(img, {
        opacity: 0.8,
        y: 20
    }, {
        scrollTrigger: {
            trigger: img,
            start: "top 92%",
            toggleActions: "play none none none",
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
    });
});


// ====================== FINAL WORKING VERSION ======================

gsap.utils.toArray('.images-sliding-rows__row').forEach((row) => {
    const isLeft = row.dataset.direction === 'left';
    
    // Good duplication balance
    const originals = Array.from(row.children);
    for (let i = 0; i < 3; i++) {
        originals.forEach(item => row.appendChild(item.cloneNode(true)));
    }

    gsap.fromTo(row, 
        { xPercent: isLeft ? 2 : -70 }, 
        {
            xPercent: isLeft ? -70 : 2,
            ease: "none",
            scrollTrigger: {
                trigger: ".images-sliding-rows",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.1,
                invalidateOnRefresh: true,
            }
        }
    );
});

    // ====================== CUSTOM CURSOR LOGIC ======================
    const cursor = document.getElementById('cursor');
    if (cursor) {
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

        const lerp = (start, end, amount) => (1 - amount) * start + amount * end;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!html.classList.contains('mouse-moved')) {
                html.classList.add('mouse-moved');
                cursorX = mouseX;
                cursorY = mouseY;
            }
        });

        function animateCursor() {
            cursorX = lerp(cursorX, mouseX, 0.15);
            cursorY = lerp(cursorY, mouseY, 0.15);
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();




        

         // ================== STRICT CURSOR STATE MANAGEMENT ==================
        let currentState = null;

        const updateCursor = (e) => {
            // Force Close cursor if lightbox is open - Highest Priority
            if (html.classList.contains('fullscreen')) {
                if (currentState !== 'close') {
                    currentState = 'close';
                    html.setAttribute('data-cursor', 'close');
                }
                return;   // Stop checking further
            } 

            // Normal hover logic only when lightbox is closed
            let state = null;
            // Check card first (higher priority)
            const cardTarget = e.target.closest('#services-grid a.card');
            const realisationsImg = e.target.closest('#realisations img');
            const target = e.target.closest('#hero-video-overlay, img[data-expandable], video');

            if (cardTarget) {
                state = 'explore';
            } else if (realisationsImg) {
                state = 'explore';
            } else if (target) {
                if (target.id === 'hero-video-overlay') {
                    state = 'scroll-down';
                } else if (target.tagName === 'IMG' && !target.classList.contains('no-cursor-animation')) {
                    if (document.documentElement.getAttribute('data-page-type') === 'services') {
                        state = 'article';
                    } else {
                        state = 'image-showcase';
                    }
                }
            }

            if (state !== currentState) {
                currentState = state;
                if (state) {
                    html.setAttribute('data-cursor', state);
                } else {
                    html.removeAttribute('data-cursor');
                }
            }
        };

        document.addEventListener('pointermove', updateCursor);
        document.addEventListener('pointerleave', () => {
            currentState = null;
            html.removeAttribute('data-cursor');
        });


// ====================== NEW CLEAN IMAGE PREVIEW WITH SMOOTH CLOSE ======================
const showcase = document.getElementById('image-showcase');
let currentImage = null;
document.addEventListener('click', function(e) {
    const img = e.target.closest('img[data-expandable]');
    if (!img) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    // On service pages, go to contact
    if (document.documentElement.getAttribute('data-page-type') === 'services') {
        window.location.href = '/contact.html';
        return;
    }

    // On index page, keep realisations redirect
    if (img.closest('#realisations')) {
        smoother.scrollTo('#services', true, 'top top');
        return;
    }

    // Index page lightbox
    currentImage = img;
    const rect = img.getBoundingClientRect();
    showcase.innerHTML = `<img src="${img.getAttribute('src')}" alt="Preview">`;
    const previewImg = showcase.querySelector('img');

    gsap.set(previewImg, {
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        objectFit: 'cover',
        borderRadius: window.getComputedStyle(img).borderRadius,
        zIndex: 102,
        margin: 0
    });

    document.documentElement.classList.add('fullscreen');
    currentState = 'close';
    html.setAttribute('data-cursor', 'close');

    gsap.to(showcase, { opacity: 1, duration: 0.3 });
    gsap.to(previewImg, {
        top: '5svh',
        left: '5svw',
        width: '90svw',
        height: '90svh',
        objectFit: 'contain',
        borderRadius: '0px',
        duration: 0.75,
        ease: 'expo.out'
    });
});

// ====================== FOOTER PARALLAX ======================

gsap.to("footer", {
    yPercent: -5,
    ease: "none",
    scrollTrigger: {
        trigger: "footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
    }
});

gsap.from(".footer-logo", {
    scrollTrigger: {
        trigger: "footer",
        start: "top 85%",
        toggleActions: "play none none reverse",
    },
    opacity: 0,
    y: 40,
    duration: 1.5,
    ease: "power2.out"
});

gsap.from(".footer-logo-symb svg", {
    scrollTrigger: {
        trigger: "footer",
        start: "top 75%",
        toggleActions: "play none none reverse",
    },
    opacity: 0,
    y: 60,
    duration: 1.5,
    ease: "power2.out"
});



// Close with smooth reverse animation
if (showcase) {
    showcase.addEventListener('click', () => {
        if (!currentImage) return;

        const previewImg = showcase.querySelector('img');
        if (!previewImg) return;

        const rect = currentImage.getBoundingClientRect();

        // Reverse Animation
        gsap.to(previewImg, {
            top: rect.top + "px",
            left: rect.left + "px",
            width: rect.width + "px",
            height: rect.height + "px",
            onComplete: () => {
                document.documentElement.classList.remove('fullscreen');
                showcase.innerHTML = '';
                currentImage = null;
            }
        });

        gsap.to(showcase, { opacity: 0, duration: 0.4, delay: 0.2 });
    });
}

        // Hero Scroll Logic (Updated for ScrollSmoother)
        const heroOverlay = document.getElementById('hero-video-overlay');
        if (heroOverlay) {
        heroOverlay.addEventListener('click', () => {
        currentState = null;
        html.removeAttribute('data-cursor');
        smoother.scrollTo("#hero", true, "bottom top");
    });
}
    }
};

// Initialize everything
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}