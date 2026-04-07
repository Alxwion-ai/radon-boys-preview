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

/**
 * =========================================
 * TOXIC EXPANSION: PARTICLES & GEIGER
 * =========================================
 */

// 1. Particle System
class ParticleSystem {
    constructor(containerId, count, minSize, maxSize, speedMult, opacity) {
        this.container = document.getElementById(containerId);
        this.particles = [];
        this.count = count;
        
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(minSize, maxSize, speedMult, opacity));
        }
    }

    createParticle(minSize, maxSize, speedMult, opacity) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * (maxSize - minSize) + minSize;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.opacity = Math.random() * opacity;
        
        const data = {
            el: p,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * speedMult,
            vy: (Math.random() - 0.5) * speedMult,
            size: size
        };

        this.container.appendChild(p);
        return data;
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < -p.size) p.x = window.innerWidth;
            if (p.x > window.innerWidth) p.x = -p.size;
            if (p.y < -p.size) p.y = window.innerHeight;
            if (p.y > window.innerHeight) p.y = -p.size;

            p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        });
        requestAnimationFrame(() => this.update());
    }
}

// Initialize particles if on desktop (performance)
if (window.innerWidth > 768) {
    const bgParticles = new ParticleSystem('radioactive-bg', 40, 1, 3, 0.5, 0.4);
    const fgParticles = new ParticleSystem('radioactive-fg', 15, 3, 6, 1.2, 0.6);
    bgParticles.update();
    fgParticles.update();
}

// 2. Geiger Counter & Scroll Warp
let audioCtx = null;
let lastScrollY = window.scrollY;
let scrollVelocity = 0;
let geigerTimeout = null;

const initAudio = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
};

const playGeigerClick = () => {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const bufferSize = audioCtx.sampleRate * 0.01; // 10ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 3));
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.value = Math.min(Math.abs(scrollVelocity) * 0.05, 0.3);
    
    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
};

const handleScrollEffects = () => {
    initAudio();
    const currentScrollY = window.scrollY;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Geiger Clicks based on velocity
    if (Math.abs(scrollVelocity) > 5) {
        if (!geigerTimeout) {
            playGeigerClick();
            // Faster ticks the faster we scroll
            const delay = Math.max(20, 200 - Math.abs(scrollVelocity) * 2);
            geigerTimeout = setTimeout(() => {
                geigerTimeout = null;
            }, delay);
        }
    }

    // Scroll Warp (Skew) for elements with .scroll-warp
    const warpElements = document.querySelectorAll('.scroll-reveal, .masonry-item, .hero-content');
    const skew = Math.min(Math.max(scrollVelocity * 0.05, -10), 10);
    warpElements.forEach(el => {
        // We only apply additional skew if they are not already transform animated
        if (el.classList.contains('visible') || el.classList.contains('hero-content')) {
             el.style.transform = `skewY(${skew}deg)`;
        }
    });

    // Reset warp smoothly
    clearTimeout(window.warpResetTimer);
    window.warpResetTimer = setTimeout(() => {
        warpElements.forEach(el => {
            el.style.transform = `skewY(0deg)`;
        });
    }, 150);
};

window.addEventListener('scroll', handleScrollEffects, { passive: true });
window.addEventListener('click', initAudio); // Start audio on first click too

