/* ============================================
   THEME TOGGLE
   Schakelt tussen "night" en "day" thema's
   Onthoudt keuze in localStorage
   ============================================ */

(function () {
  const STORAGE_KEY = 'meesterschap-theme';
  const root = document.documentElement;

  // Bepaal initieel thema:
  // 1. opgeslagen voorkeur, anders
  // 2. system preference, anders
  // 3. night (default)
  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'day' || saved === 'night') return saved;
    } catch (e) { /* localStorage unavailable */ }

    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'day';
    }
    return 'night';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* ignore */ }

    // Update toggle UI labels
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const label = btn.querySelector('[data-theme-label]');
      if (label) {
        label.textContent = theme === 'night' ? 'Night' : 'Day';
      }
      btn.setAttribute('aria-label',
        `Schakel naar ${theme === 'night' ? 'lichte' : 'donkere'} modus`);
    });
  }

  // Apply ASAP to avoid flash of wrong theme
  applyTheme(getInitialTheme());

  // Wire up toggles when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || 'night';
        applyTheme(current === 'night' ? 'day' : 'night');
      });
    });

    // Mobile nav toggle
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navList = document.querySelector('[data-nav-list]');
    if (navToggle && navList) {
      navToggle.addEventListener('click', () => {
        const open = navList.getAttribute('data-open') === 'true';
        navList.setAttribute('data-open', String(!open));
        navToggle.setAttribute('aria-expanded', String(!open));
      });
    }
  });
})();
