import './styles/style.css'

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
