(function initThemeMenuController(global) {
  const ThemeManager = global.ThemeManager;
  if (!ThemeManager) {
    console.error('ThemeManager is required for the theme menu to work.');
    return;
  }

  /**
   * Wires up the dropdown menu so users can pin their preferred theme or
   * follow the operating system default.
   */
  const menu = document.getElementById('themeMenu');
  const menuButton = document.getElementById('themeMenuButton');
  const menuLabel = document.getElementById('themeMenuLabel');
  const menuOptions = document.getElementById('themeMenuOptions');

  const closeMenu = () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const isOpen = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  };

  const updateMenuLabel = ({ preference }) => {
    const label = ThemeManager.getPreferenceLabel(preference);
    menuLabel.textContent = label;
    menuOptions.querySelectorAll('.theme-menu__option').forEach((option) => {
      option.classList.toggle('is-active', option.dataset.themeChoice === (preference === 'system' ? 'system' : preference));
    });
  };

  const handleOptionClick = (event) => {
    const target = event.target.closest('[data-theme-choice]');
    if (!target) return;
    ThemeManager.applyPreference(target.dataset.themeChoice, { persist: true });
    closeMenu();
    menuButton.focus();
  };

  const bindGlobalDismiss = () => {
    document.addEventListener('click', (event) => {
      if (menu.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        menuButton.focus();
      }
    });
  };

  const initThemeMenu = () => {
    if (!menu || !menuButton || !menuLabel || !menuOptions) {
      ThemeManager.init();
      return;
    }

    const initialState = ThemeManager.init();
    updateMenuLabel(initialState);

    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMenu();
    });

    menuOptions.addEventListener('click', handleOptionClick);
    bindGlobalDismiss();

    ThemeManager.onChange(updateMenuLabel);
  };

  initThemeMenu();
})(window);
