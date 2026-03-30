/* ===================================================
   MONEY TRACKER — LANDING PAGE SCRIPTS
   =================================================== */

/* ===================================================
   DARK MODE TOGGLE
   =================================================== */
const THEME_KEY = 'mt_theme';
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Sync with whatever the anti-flash script already applied
const _initTheme = document.documentElement.getAttribute('data-theme') ||
  (localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
applyTheme(_initTheme);
if (!localStorage.getItem(THEME_KEY)) localStorage.setItem(THEME_KEY, _initTheme);

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  // brief transition class so toggle feels smooth without slowing down hover states
  document.documentElement.classList.add('theme-transitioning');
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 350);
});

/* ===================================================
   ANALYTICS & COOKIE CONSENT
   =================================================== */

const COOKIE_KEY = 'mt_cookie_consent'; // localStorage key

// --- Ucitaj GA4 skript (pozovi tek nakon korisnikovog pristanka) ---
function loadGA4() {
  const id = window.GA_MEASUREMENT_ID;
  if (!id || id === 'YOUR_MEASUREMENT_ID') return; // jos nema ID-a

  const s = document.createElement('script');
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  s.async = true;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, { anonymize_ip: true });
  console.log('[Analytics] GA4 loaded:', id);
}

// --- Posalji event (safe - radi i ako GA nije ucitan) ---
function trackEvent(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// --- Cookie banner logika ---
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieDecline = document.getElementById('cookieDecline');

function showCookieBanner() {
  // Mali timeout da banner lepo animira nakon ucitavanja stranice
  setTimeout(() => cookieBanner.classList.add('visible'), 1200);
}

function hideCookieBanner() {
  cookieBanner.classList.remove('visible');
}

// Provjeri da li korisnik vec dao odgovor
const savedConsent = localStorage.getItem(COOKIE_KEY);
if (!savedConsent) {
  showCookieBanner();
} else if (savedConsent === 'accepted') {
  loadGA4();
}

cookieAccept.addEventListener('click', () => {
  localStorage.setItem(COOKIE_KEY, 'accepted');
  hideCookieBanner();
  loadGA4();
  trackEvent('cookie_consent', { action: 'accepted' });
});

cookieDecline.addEventListener('click', () => {
  localStorage.setItem(COOKIE_KEY, 'declined');
  hideCookieBanner();
});

// "Cookie Preferences" link u footeru — resetuje izbor i ponovo otvara banner
document.getElementById('cookieReset')?.addEventListener('click', () => {
  localStorage.removeItem(COOKIE_KEY);
  showCookieBanner();
});

// --- Trackovani eventi ---

// Pageview scroll depth (25 / 50 / 75 / 100%)
const scrollMilestones = new Set();
window.addEventListener('scroll', () => {
  const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  [25, 50, 75, 100].forEach(m => {
    if (pct >= m && !scrollMilestones.has(m)) {
      scrollMilestones.add(m);
      trackEvent('scroll_depth', { depth: m });
    }
  });
}, { passive: true });

// Klik na CTA dugmad
document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
  btn.addEventListener('click', () => {
    trackEvent('cta_click', { label: btn.textContent.trim().substring(0, 40) });
  });
});

// Klik na store badges
document.querySelectorAll('.store-badge').forEach(badge => {
  badge.addEventListener('click', () => {
    const store = badge.querySelector('strong')?.textContent || 'unknown';
    trackEvent('store_badge_click', { store });
  });
});

// Otvaranje lightbox-a
document.querySelectorAll('.app-screenshot img').forEach(img => {
  img.addEventListener('click', () => {
    trackEvent('screenshot_view', { image: img.alt });
  });
});

// FAQ otvaranje
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    trackEvent('faq_open', { question: btn.textContent.trim().substring(0, 60) });
  });
});

// Kontakt forma submit
document.getElementById('contactForm')?.addEventListener('submit', () => {
  const cat = document.querySelector('input[name="category"]:checked')?.value || 'unknown';
  trackEvent('contact_form_submit', { category: cat });
});

// ---- Navbar scroll effect (scrolled + hide-on-scroll-down) ----
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  navbar.classList.toggle('scrolled', currentY > 20);

  if (Math.abs(currentY - lastScrollY) < 6) return; // ignore tiny jitter

  if (currentY > lastScrollY && currentY > 80) {
    navbar.classList.add('nav-hidden');     // scrolling down  → hide
  } else {
    navbar.classList.remove('nav-hidden');  // scrolling up    → show
  }

  lastScrollY = currentY;
}, { passive: true });

// ---- Mobile hamburger ----
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
hamburger.addEventListener('click', () => {
  const open = navMobile.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ---- Intersection Observer for animations ----
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

// ---- FAQ accordion ----
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

// ---- Smooth active nav link highlight ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ---- Donut chart animation on scroll ----
const donutSvg = document.querySelector('.donut-svg');
if (donutSvg) {
  const donutObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      donutSvg.classList.add('animated');
      donutObserver.unobserve(donutSvg);
    }
  }, { threshold: 0.5 });
  donutObserver.observe(donutSvg);
}

// ---- Contact Form ----
const contactForm = document.getElementById('contactForm');
const categoryError = document.getElementById('categoryError');
const formSuccess = document.getElementById('formSuccess');

// Klik na reason karticu - selektuje odgovarajuci chip
document.querySelectorAll('.contact-reason').forEach(reason => {
  reason.addEventListener('click', () => {
    const cat = reason.dataset.category;
    const radio = contactForm.querySelector(`input[value="${cat}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
    }
    document.querySelectorAll('.contact-reason').forEach(r => r.classList.remove('active'));
    reason.classList.add('active');
  });
});

// Klik na chip - aktivira reason karticu
contactForm.querySelectorAll('.chip input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const cat = radio.value;
    document.querySelectorAll('.contact-reason').forEach(r => {
      r.classList.toggle('active', r.dataset.category === cat);
    });
    categoryError.classList.remove('visible');
  });
});

// Submit
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('contactEmail');
  const message = document.getElementById('contactMessage');
  const category = contactForm.querySelector('input[name="category"]:checked');
  let valid = true;

  email.classList.remove('error');
  message.classList.remove('error');
  categoryError.classList.remove('visible');

  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('error'); valid = false;
  }
  if (!category) {
    categoryError.classList.add('visible'); valid = false;
  }
  if (!message.value.trim()) {
    message.classList.add('error'); valid = false;
  }
  if (!valid) return;

  // Simulacija slanja (zameni sa pravim API pozivom)
  const btn = contactForm.querySelector('.contact-submit');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    contactForm.reset();
    document.querySelectorAll('.contact-reason').forEach(r => r.classList.remove('active'));
    btn.textContent = 'Send Message';
    btn.disabled = false;
    formSuccess.classList.add('visible');
    setTimeout(() => formSuccess.classList.remove('visible'), 5000);
  }, 1000);
});

// ---- Lightbox ----
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.app-screenshot img').forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src, img.alt));
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ---- Pricing CTA: add pulse after 8 seconds ----
setTimeout(() => {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.style.animation = 'btn-pulse 2s ease-in-out 3';
  });
}, 8000);

// Inject btn-pulse keyframe — uses app primary #6366f1
const style = document.createElement('style');
style.textContent = `
  @keyframes btn-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.5); }
    50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
  }
  .nav-links a.active { color: var(--primary) !important; }
`;
document.head.appendChild(style);
