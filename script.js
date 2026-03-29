/* ===================================================
   MONEY TRACKER — LANDING PAGE SCRIPTS
   =================================================== */

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
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
