// Custom Cursor
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    // Update cursor position directly
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Add hover effect to links and interactive elements
const interactiveElements = document.querySelectorAll('a, button, .date-card, .masonry-item, video, .modal-close');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.add('remove-hover');
        setTimeout(() => cursor.classList.remove('remove-hover'), 50); // slight delay for smooth exit
        cursor.classList.remove('hover');
    });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let isMenuOpen = false;

mobileBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileMenu.style.display = isMenuOpen ? 'flex' : 'none';
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
});
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        isMenuOpen = false;
        mobileMenu.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

// Parallax Effect for Hero
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
    let scrolled = window.pageYOffset;
    if(heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
    }
});

// Scroll Reveal Observer
const revealElements = document.querySelectorAll('.scroll-reveal');
const aboutCopy = document.querySelector('.about-copy');

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Special case for about-copy paragraph staggering
            if(entry.target.classList.contains('about-headline') && aboutCopy) {
                setTimeout(() => {
                    aboutCopy.classList.add('is-visible');
                }, 300);
            }
            observer.unobserve(entry.target);
        }
    });
}, {
    rootMargin: "0px",
    threshold: 0.15
});

revealElements.forEach(el => {
    scrollObserver.observe(el);
});

// Glitch effect on Hero text (Restored)
setTimeout(() => {
    const title = document.querySelector('.hero-title');
    if(title) {
        title.style.textShadow = '2px 0 var(--red), -2px 0 var(--yellow)';
        
        // Periodically glitch the headline
        setInterval(() => {
            title.style.transform = `translate(${Math.random()*4 - 2}px, ${Math.random()*4 - 2}px)`;
            setTimeout(() => {
                title.style.transform = `translate(0,0)`;
            }, 50);
        }, 3000);
    }
}, 2000);

// Video Modal Logic
const videoModal = document.getElementById('video-modal');
const modalVideo = document.getElementById('modal-video');
const modalClose = document.querySelector('.modal-close');
const clickableVideos = document.querySelectorAll('.inline-vid, .ig-vid');

clickableVideos.forEach(vid => {
    vid.addEventListener('click', () => {
        modalVideo.src = vid.src;
        videoModal.classList.add('active');
        modalVideo.volume = 1; // Play with sound
        modalVideo.play();
    });
});

const closeModal = () => {
    videoModal.classList.remove('active');
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
};

if(modalClose) {
    modalClose.addEventListener('click', closeModal);
}
if(videoModal) {
    videoModal.addEventListener('click', (e) => {
        if(e.target === videoModal) closeModal();
    });
}
