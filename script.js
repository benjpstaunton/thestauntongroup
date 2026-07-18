const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-navigation]');

function closeNavigation() {
  if (!menuToggle || !navigation) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('.sr-only').textContent = 'Open navigation';
  navigation.classList.remove('is-open');
  document.body.classList.remove('nav-open');
}

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.querySelector('.sr-only').textContent = isOpen ? 'Open navigation' : 'Close navigation';
    navigation.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('nav-open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNavigation);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation();
  });
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const header = document.querySelector('[data-header]');
const scrollProgress = document.querySelector('[data-scroll-progress]');
const sectionLinks = [...document.querySelectorAll('[data-section-link]')];
const trackedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
let scrollUpdateQueued = false;

function updateScrollAnnotations() {
  scrollUpdateQueued = false;

  const maximumScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(window.scrollY / maximumScroll, 0), 1);

  if (scrollProgress) {
    scrollProgress.style.transform = `scaleX(${progress})`;
  }

  if (header) {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  if (!trackedSections.length) return;

  const readingLine = window.scrollY + Math.min(window.innerHeight * 0.38, 300);
  let currentSection = null;

  trackedSections.forEach((section) => {
    if (section.offsetTop <= readingLine) currentSection = section;
  });

  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
    currentSection = trackedSections.at(-1);
  }

  sectionLinks.forEach((link) => {
    const isCurrent = currentSection && link.getAttribute('href') === `#${currentSection.id}`;
    link.classList.toggle('is-current', Boolean(isCurrent));

    if (isCurrent) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function requestScrollUpdate() {
  if (scrollUpdateQueued) return;
  scrollUpdateQueued = true;
  window.requestAnimationFrame(updateScrollAnnotations);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
updateScrollAnnotations();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
  );

  revealElements.forEach((element) => observer.observe(element));
}

