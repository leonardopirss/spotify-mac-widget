const STORAGE_KEY = "spotify-desktop-widget-accent-v1";

export const normalizeAccentColor = (value, fallback = "#7DD3FC") =>
  /^#[0-9a-f]{6}$/i.test(value || "") ? value.toUpperCase() : fallback;

const readAccent = (fallback) => {
  try {
    return normalizeAccentColor(window.localStorage.getItem(STORAGE_KEY), fallback);
  } catch (_) {
    return fallback;
  }
};

const writeAccent = (color) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, color);
  } catch (_) {
    // The selected color still applies for the current session.
  }
};

export const applySavedAccent = (element, fallback) => {
  if (!element) return;
  const color = readAccent(fallback);
  element.style.setProperty("--accent", color);
  const picker = element.querySelector("[data-accent-picker]");
  if (picker) picker.value = color;
};

export const changeAccent = (event) => {
  const color = normalizeAccentColor(event.currentTarget.value);
  const card = event.currentTarget.closest("[data-player-card]");
  if (!card) return;
  card.style.setProperty("--accent", color);
  writeAccent(color);
};
