import './styles/style.css'

function initCheckSectionThemeScroll() {

  // Get detection offset, in this case the navbar
  const navBarHeight = document.querySelector("[data-nav-bar-height]")
  const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

  function checkThemeSection() {
    const themeSections = document.querySelectorAll("[data-theme-section]");

    themeSections.forEach(function(themeSection) {
      const rect = themeSection.getBoundingClientRect();
      const themeSectionTop = rect.top;
      const themeSectionBottom = rect.bottom;

      // If the offset is between the top & bottom of the current section
      if (themeSectionTop <= themeObserverOffset && themeSectionBottom >= themeObserverOffset) {
        // Check [data-theme-section]
        const themeSectionActive = themeSection.getAttribute("data-theme-section");
        document.querySelectorAll("[data-theme-nav]").forEach(function(elem) {
          if (elem.getAttribute("data-theme-nav") !== themeSectionActive) {
            elem.setAttribute("data-theme-nav", themeSectionActive);
          }
        });

        // Check [data-bg-section]
        const bgSectionActive = themeSection.getAttribute("data-bg-section");
        document.querySelectorAll("[data-bg-nav]").forEach(function(elem) {
          if (elem.getAttribute("data-bg-nav") !== bgSectionActive) {
            elem.setAttribute("data-bg-nav", bgSectionActive);
          }
        });
      }
    });
  }

  function startThemeCheck() {
    document.addEventListener("scroll", checkThemeSection);
  }

  // Initial check and start listening for scroll
  checkThemeSection();
  startThemeCheck();
}

initCheckSectionThemeScroll();

function initMobileMenu() {
  // Add debounced listener once
  if (!initMobileMenu._resized) {
    initMobileMenu._resized = true;
    window.addEventListener('resize', () => {
      clearTimeout(initMobileMenu._timer);
      initMobileMenu._timer = setTimeout(initMobileMenu, 200);
    });
  }

  // Mobile menu logic below
  if (window.innerWidth >= 768) return;

  const btn = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-menu-status]');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      nav.dataset.menuStatus = nav.dataset.menuStatus === 'open' ? 'closed' : 'open';
    });
  }

  const toggles = Array.from(document.querySelectorAll('[data-dropdown-toggle]'));
  toggles.forEach(t => {
    t.addEventListener('click', () => {
      const isOpen = t.dataset.dropdownToggle === 'open';
      toggles.forEach(other => {
        if (other !== t) {
          other.dataset.dropdownToggle = 'closed';
          if (other === document.activeElement) other.blur();
        }
      });
      t.dataset.dropdownToggle = isOpen ? 'closed' : 'open';
      if (isOpen && t === document.activeElement) t.blur();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
});

/* About images reveal */

gsap.registerPlugin(ScrollTrigger);

const images = gsap.utils.toArray('.about-img');
const imagesToAnimate = images.slice(1);

const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: ".section_about",
    start: "15% center",
    end: "bottom center",
    toggleActions: "play reverse play reverse",
  }
});

imagesToAnimate.forEach((img, index) => {
  const rotation = index % 2 === 0 ? 6 : -6;

  gsap.set(img, {
    scale: 0,
    rotate: rotation,
    transformOrigin: "center center"
  });

  timeline.to(img, {
    scale: 1,
    rotate: 0,
    ease: "expo.out",
    duration: 1
  }, index);
});

function initPlayVideoHover() {
  const wrappers = document.querySelectorAll('[data-video-on-hover]');

  wrappers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const src = wrapper.getAttribute('data-video-src') || '';
    if (!video || !src) return;

    wrapper.addEventListener('mouseenter', () => {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
      wrapper.dataset.videoOnHover = 'active';
      video.play().catch(err => {
        console.warn('play on hover is blocked:', err);
      });
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.dataset.videoOnHover = 'not-active';
      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
      }, 200);
    });
  });
}

initPlayVideoHover();
