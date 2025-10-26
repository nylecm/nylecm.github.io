/**
 * Lightweight bootstrap script executed before CSS loads.
 * It reads the persisted theme preference (if any) or falls back
 * to the user's system setting so the very first paint matches
 * expectations and no white flash appears in dark mode.
 */
(function bootstrapTheme() {
  const COOKIE_NAME = 'themePreference';

  /**
   * Returns the value of the provided cookie name or null when absent.
   * @param {string} name
   * @returns {string | null}
   */
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const setAttributes = (theme, source) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.dataset.themeSource = source;
  };

  try {
    const preference = getCookie(COOKIE_NAME);
    const prefersDarkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const theme = preference === 'dark'
      ? 'dark'
      : preference === 'light'
        ? 'light'
        : prefersDarkQuery && prefersDarkQuery.matches
          ? 'dark'
          : 'light';

    setAttributes(theme, preference ? 'manual' : 'auto');
  } catch (err) {
    setAttributes('dark', 'auto');
  }
})();
