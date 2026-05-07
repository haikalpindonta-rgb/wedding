// --- GLOBAL VARIABLES & INITIALIZATION ---
let isPlaying = false;
let audioPromise;
let hasInteracted = false; 
let ticking = false;

document.addEventListener("DOMContentLoaded", () => {
    // Check for Guest Name in URL parameter ?to=Nama
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    
    if (guestName) {
        const cleanName = guestName.replace(/\+/g, ' ');
        document.getElementById('guest-name').innerText = cleanName;
        document.getElementById('guest-greeting-box').classList.remove('hidden');
    }
    
    // Initiate background particle animations
    initFallingLeaves();
});

// --- FALLING LEAVES & MAGICAL PARTICLES ---
function initFallingLeaves() {
    const container = document.getElementById('particles-container');
    // Optimasi performa untuk mobile: turunkan jumlah partikel di layar kecil
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 15 : 25; 
    
    for(let i = 0; i < particleCount; i++) {
        let leaf = document.createElement('div');
        
        // 70% Falling Leaves, 30% Glowing Particles
        if(Math.random() > 0.3) {
            leaf.className = 'falling-leaf text-gold/40 drop-shadow-md';
            const icons = ['fa-leaf', 'fa-seedling', 'fa-spa', 'fa-fan'];
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            leaf.innerHTML = `<i class="fas ${randomIcon}"></i>`;
            
            leaf.style.fontSize = (Math.random() * 15 + 12) + 'px';
            leaf.style.animationDuration = (Math.random() * 8 + 8) + 's'; 
            // Optimasi HP: Nonaktifkan efek blur pada mobile agar framerate stabil
            if (!isMobile) {
                leaf.style.filter = `blur(${Math.random() * 2}px)`; 
            }
        } else {
            leaf.className = 'magical-particle bg-gold-light rounded-full';
            const size = Math.random() * 4 + 2;
            leaf.style.width = size + 'px';
            leaf.style.height = size + 'px';
            leaf.style.animationDuration = (Math.random() * 10 + 10) + 's';
            leaf.style.opacity = Math.random() * 0.5 + 0.2;
            leaf.style.boxShadow = '0 0 8px rgba(212, 175, 55, 0.8)';
        }
        
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.animationDelay = Math.random() * 10 + 's';
        container.appendChild(leaf);
    }
}

// --- AUDIO CONTROLS ---
function updateMusicIcon(playing) {
    const icon = document.getElementById('music-icon');
    if (playing) {
        icon.classList.remove('fa-play-circle');
        icon.classList.add('fa-compact-disc', 'animate-spin-slow');
    } else {
        icon.classList.remove('fa-compact-disc', 'animate-spin-slow');
        icon.classList.add('fa-play-circle');
    }
}

function safePlay() {
    const audio = document.getElementById('bg-music');
    audio.volume = 0.8; 
    audioPromise = audio.play();
    if (audioPromise !== undefined) {
        audioPromise.then(() => {
            isPlaying = true;
            updateMusicIcon(true);
            hasInteracted = true;
        }).catch(error => {
            isPlaying = false;
            updateMusicIcon(false);
        });
    }
}

function safePause() {
    const audio = document.getElementById('bg-music');
    if (audioPromise !== undefined) {
        audioPromise.then(() => {
            audio.pause();
            isPlaying = false;
            updateMusicIcon(false);
        }).catch(error => {
            console.log("Play failed.");
        });
    } else {
        audio.pause();
        isPlaying = false;
        updateMusicIcon(false);
    }
}

function toggleMusic() {
    if (isPlaying) {
        safePause();
    } else {
        safePlay();
    }
}

// --- COVER LOGIC ---
function openInvitation() {
    const cover = document.getElementById('cover');
    cover.style.transform = 'translateY(-100vh)';
    
    document.body.classList.remove('overflow-hidden');
    document.getElementById('main-content').classList.remove('opacity-0');
    document.getElementById('music-btn').classList.remove('hidden');
    
    safePlay();

    setTimeout(() => {
        initScrollAnimations();
    }, 500); 
}

// Autoplay handle for mobile
document.body.addEventListener('touchstart', function() {
    if (!isPlaying && hasInteracted === false) { safePlay(); }
}, { once: true, passive: true }); 

document.body.addEventListener('click', function() {
    if (!isPlaying && hasInteracted === false) { safePlay(); }
}, { once: true });

// --- COUNTDOWN LOGIC ---
const countDownDate = new Date("Jun 4, 2026 09:30:00").getTime();
const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("hari").innerHTML = days < 10 ? '0' + days : days;
    document.getElementById("jam").innerHTML = hours < 10 ? '0' + hours : hours;
    document.getElementById("menit").innerHTML = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById("detik").innerHTML = seconds < 10 ? '0' + seconds : seconds;

    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById("hari").innerHTML = "00";
        document.getElementById("jam").innerHTML = "00";
        document.getElementById("menit").innerHTML = "00";
        document.getElementById("detik").innerHTML = "00";
    }
}, 1000);

// --- UTILITIES (TOAST & COPY) ---
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    
    toast.classList.remove('opacity-0', 'translate-y-[-20px]');
    toast.classList.add('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-[-20px]');
    }, 3000);
}

function copyRekening(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Nomor Rekening Berhasil Disalin!");
            fireConfetti();
        }).catch(err => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast("Nomor Rekening Berhasil Disalin!");
        fireConfetti();
    } catch (err) {
        showToast("Gagal menyalin rekening.");
    }
    document.body.removeChild(textArea);
}

// --- RSVP FORM HANDLING ---
function submitForm(event) {
    event.preventDefault(); 
    
    const name = document.getElementById('form-name').value;
    const message = document.getElementById('form-message').value;
    const attendance = document.getElementById('form-attendance').value;
    
    const badgeClass = attendance === 'Hadir' 
        ? 'bg-green-100 text-green-700 border border-green-200' 
        : 'bg-red-50 text-red-600 border border-red-100';
    
    const iconClass = attendance === 'Hadir' ? 'text-gold' : 'text-gray-400';
    
    const newGuestbookEntry = `
        <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative fade-in-up visible">
            <div class="absolute top-0 right-0 w-8 h-8 ${attendance === 'Hadir' ? 'bg-gold/10' : 'bg-gray-100'} rounded-bl-xl rounded-tr-xl"></div>
            <div class="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                <span class="font-bold text-sm text-botanical"><i class="fas fa-user-circle ${iconClass} mr-1"></i> ${name}</span>
                <span class="text-[10px] ${badgeClass} font-bold px-2 py-1 rounded-md">${attendance}</span>
            </div>
            <p class="text-xs text-gray-600 leading-relaxed">${message}</p>
        </div>
    `;
    
    const guestbookList = document.getElementById('guestbook-list');
    guestbookList.insertAdjacentHTML('afterbegin', newGuestbookEntry);
    
    showToast("Terima kasih atas ucapan Anda!");
    fireConfetti();
    document.getElementById('rsvp-form').reset();
}

// --- INTERSECTION OBSERVER (Scroll Animations) ---
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                window.requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { 
        rootMargin: '0px 0px 50px 0px', 
        threshold: 0.01 
    });

    document.querySelectorAll('.reveal-element, .reveal-bloom').forEach((el) => {
        observer.observe(el);
    });
}

// --- PARALLAX SCROLL EFFECT ---
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            document.querySelectorAll('.parallax-leaf').forEach((leaf, index) => {
                const speed = parseFloat(leaf.getAttribute('data-speed')) || 0.1;
                const rotateDir = index % 2 === 0 ? 1 : -1; 
                const rotateSpeed = 0.05 * rotateDir;
                
                const section = leaf.closest('section');
                if (section) {
                    const rect = section.getBoundingClientRect();
                    leaf.style.transform = `translateY(${rect.top * speed}px) rotate(${scrolled * rotateSpeed}deg)`;
                }
            });
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// --- INTERACTIVE ANIMATIONS (Confetti & Ripple) ---
function fireConfetti() {
    var defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    confetti(Object.assign({}, defaults, { 
        particleCount: 80, 
        spread: 70, 
        colors: ['#D4AF37', '#F7E7CE', '#2C4C3B', '#ffffff'] 
    }));
}

function createRipple(event) {
    const button = event.currentTarget;
    
    if (window.getComputedStyle(button).position === 'static') {
        button.style.position = 'relative';
    }
    button.style.overflow = 'hidden';

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${clientX - rect.left - radius}px`;
    circle.style.top = `${clientY - rect.top - radius}px`;
    circle.classList.add("ripple-drop");
    
    const ripple = button.getElementsByClassName("ripple-drop")[0];
    if (ripple) { ripple.remove(); }
    
    button.appendChild(circle);
}

// Register ripple effect to all buttons
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mousedown', createRipple);
    btn.addEventListener('touchstart', createRipple, {passive: true});
});