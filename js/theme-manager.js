/**
 * ThemeManager owns all theme preference logic:
 * - reading/writing the persisted preference cookie
 * - resolving the effective theme (light/dark/system)
 * - syncing the DOM + listeners when the user or OS toggles modes.
 *
 * Exposed as window.ThemeManager for easy consumption without modules.
 */
(function attachThemeManager(global) {
  const COOKIE_NAME = 'themePreference';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year
  const preferenceLabels = {
    dark: 'Always Dark',
    light: 'Always Light',
    system: 'System Default',
  };

  const listeners = new Set();
  const prefersDarkQuery = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  const state = {
    preference: 'system',
    theme: 'light',
    initialized: false,
  };
  let systemListenerAttached = false;

  const normalizePreference = (value) => (value === 'dark' || value === 'light') ? value : 'system';

  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const persistPreference = (preference) => {
    if (typeof document === 'undefined') return;
    if (preference === 'system') {
      document.cookie = COOKIE_NAME + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } else {
      document.cookie = COOKIE_NAME + '=' + encodeURIComponent(preference) + ';path=/;max-age=' + COOKIE_MAX_AGE;
    }
  };

  const resolveTheme = (preference = state.preference) => {
    const normalized = normalizePreference(preference);
    if (normalized === 'dark' || normalized === 'light') {
      return normalized;
    }
    if (prefersDarkQuery) {
      return prefersDarkQuery.matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const applyThemeAttributes = (theme, source) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.dataset.themeSource = source;
  };

  const notify = () => {
    const snapshot = { preference: state.preference, theme: state.theme };
    listeners.forEach((callback) => {
      try {
        callback(snapshot);
      } catch (err) {
        // ignore listener errors so one bad consumer doesn't break the rest
        console.error('Theme listener error', err);
      }
    });
  };

  const handleSystemThemeChange = (event) => {
    if (state.preference !== 'system') return;
    state.theme = event.matches ? 'dark' : 'light';
    applyThemeAttributes(state.theme, 'auto');
    notify();
  };

  const addSystemListener = () => {
    if (!prefersDarkQuery || systemListenerAttached) return;
    if (prefersDarkQuery.addEventListener) {
      prefersDarkQuery.addEventListener('change', handleSystemThemeChange);
    } else if (prefersDarkQuery.addListener) {
      prefersDarkQuery.addListener(handleSystemThemeChange);
    }
    systemListenerAttached = true;
  };

  const removeSystemListener = () => {
    if (!prefersDarkQuery || !systemListenerAttached) return;
    if (prefersDarkQuery.removeEventListener) {
      prefersDarkQuery.removeEventListener('change', handleSystemThemeChange);
    } else if (prefersDarkQuery.removeListener) {
      prefersDarkQuery.removeListener(handleSystemThemeChange);
    }
    systemListenerAttached = false;
  };

  const manageSystemListener = (shouldEnable) => {
    if (shouldEnable) {
      addSystemListener();
    } else {
      removeSystemListener();
    }
  };

  const applyPreference = (preference, { persist = true } = {}) => {
    const normalized = normalizePreference(preference);
    if (persist) {
      persistPreference(normalized);
    }
    state.preference = normalized;
    state.theme = resolveTheme(normalized);
    const source = normalized === 'system' ? 'auto' : 'manual';
    applyThemeAttributes(state.theme, source);
    manageSystemListener(normalized === 'system');
    notify();
    return { preference: state.preference, theme: state.theme };
  };

  const init = () => {
    if (state.initialized) {
      return { preference: state.preference, theme: state.theme };
    }
    const storedPreference = normalizePreference(getCookie(COOKIE_NAME) || 'system');
    applyPreference(storedPreference, { persist: false });
    state.initialized = true;
    return { preference: state.preference, theme: state.theme };
  };

  const onChange = (callback) => {
    if (typeof callback !== 'function') {
      return () => {};
    }
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  const getPreferenceLabel = (preference = state.preference) => preferenceLabels[normalizePreference(preference)];

  const getState = () => ({ preference: state.preference, theme: state.theme });

  const ThemeManager = {
    init,
    applyPreference,
    onChange,
    getState,
    getPreferenceLabel,
    resolveTheme,
    preferenceLabels,
  };

  global.ThemeManager = ThemeManager;
})(window);
