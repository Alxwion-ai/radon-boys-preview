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
        videoModal.classList.add('breach'); // Add the new "breach" effect
        modalVideo.volume = 1; // Play with sound
        modalVideo.play();
    });
});

const closeModal = () => {
    videoModal.classList.remove('active');
    videoModal.classList.remove('breach');
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

            // Use translate3d for hardware acceleration and smooth sub-pixel rendering
            p.el.style.transform = `translate3d(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px, 0)`;
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
let droneOsc = null;
let droneGain = null;
let audioEnabled = true;

const initAudio = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Background Drone
    droneOsc = audioCtx.createOscillator();
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(40, audioCtx.currentTime); // Low bass
    
    droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start silent
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, audioCtx.currentTime);
    
    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    
    droneOsc.start();
};

const updateAudioDynamics = (scrollPercent) => {
    if (!audioCtx || !audioEnabled) return;
    
    // Smoothly update drone frequency and gain based on scroll/RAD level
    const freq = 40 + (scrollPercent * 0.5);
    const gain = 0.02 + (scrollPercent * 0.0005);
    
    droneOsc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
    droneGain.gain.setTargetAtTime(gain, audioCtx.currentTime, 0.1);
};

const playGeigerClick = () => {
    if (!audioCtx || !audioEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const bufferSize = audioCtx.sampleRate * 0.01;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize / 3));
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.value = Math.min(Math.abs(scrollVelocity) * 0.05, 0.2);
    
    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
};

const handleScrollEffects = () => {
    initAudio();
    const currentScrollY = window.scrollY;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    updateAudioDynamics(scrollPercent);

    // Geiger Clicks based on velocity
    if (Math.abs(scrollVelocity) > 5) {
        if (!geigerTimeout) {
            playGeigerClick();
            const delay = Math.max(20, 200 - Math.abs(scrollVelocity) * 2);
            geigerTimeout = setTimeout(() => {
                geigerTimeout = null;
            }, delay);
        }
    }

    // Scroll Warp (Skew)
    const warpElements = document.querySelectorAll('.scroll-reveal, .masonry-item, .hero-content');
    const skew = Math.min(Math.max(scrollVelocity * 0.05, -10), 10);
    warpElements.forEach(el => {
        if (el.classList.contains('visible') || el.classList.contains('hero-content')) {
             el.style.transform = `skewY(${skew}deg)`;
        }
    });

    clearTimeout(window.warpResetTimer);
    window.warpResetTimer = setTimeout(() => {
        warpElements.forEach(el => el.style.transform = `skewY(0deg)`);
    }, 150);

    // Update HUD Gauge
    const gaugeFill = document.getElementById('rad-gauge-fill');
    const radValue = document.getElementById('rad-numerical');
    if (gaugeFill) gaugeFill.style.width = Math.min(Math.max(scrollPercent, 5), 100) + '%';
    if (radValue) {
        const val = (0.024 + (scrollPercent * 0.05)).toFixed(3);
        radValue.innerText = val + ' mSv';
        radValue.style.color = scrollPercent > 80 ? 'var(--red)' : 'var(--yellow)';
    }
};

window.addEventListener('scroll', handleScrollEffects, { passive: true });
window.addEventListener('click', initAudio);

/**
 * =========================================
 * V2 EXPERIENCE: SCRAMBLE, TILT & FOG
 * =========================================
 */

// 1. Text Scramble Effect
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
            complete++;
            output += to;
        } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
                char = this.randomChar();
                this.queue[i].char = char;
            }
            output += `<span class="d-char">${char}</span>`;
        } else {
            output += from;
        }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
        this.resolve();
    } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
    }
  }
  randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
}

const scrambleElements = document.querySelectorAll('.section-title, .about-headline, .contact-title');
scrambleElements.forEach(el => {
    const originalText = el.innerText;
    el.innerText = '';
    const fx = new TextScramble(el);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                fx.setText(originalText);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(el);
});

// 2. Mouse Parallax Tilt
const tiltElements = document.querySelectorAll('.hero-title, .date-card, .masonry-item, .image-wrapper');

document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    
    // Tilt Logic
    tiltElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;
        const rotateY = Math.min(Math.max((clientX - elCenterX) / 20, -10), 10);
        const rotateX = Math.min(Math.max(-(clientY - elCenterY) / 20, -10), 10);
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
});



