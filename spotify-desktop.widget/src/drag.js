const STORAGE_KEY = "spotify-desktop-widget-position-v1";
const EDGE_MARGIN = 8;

export const clampDraggedOffset = ({
  startRect,
  deltaX,
  deltaY,
  offsetX,
  offsetY,
  viewportWidth,
  viewportHeight,
}) => {
  const nextLeft = Math.min(
    Math.max(startRect.left + deltaX, EDGE_MARGIN),
    Math.max(EDGE_MARGIN, viewportWidth - startRect.width - EDGE_MARGIN)
  );
  const nextTop = Math.min(
    Math.max(startRect.top + deltaY, EDGE_MARGIN),
    Math.max(EDGE_MARGIN, viewportHeight - startRect.height - EDGE_MARGIN)
  );

  return {
    x: offsetX + nextLeft - startRect.left,
    y: offsetY + nextTop - startRect.top,
  };
};

const readPosition = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (Number.isFinite(stored?.x) && Number.isFinite(stored?.y)) return stored;
  } catch (_) {
    // Corrupt or unavailable local storage falls back to the configured position.
  }
  return { x: 0, y: 0 };
};

const writePosition = (position) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch (_) {
    // Dragging still works for the current session when storage is unavailable.
  }
};

const applyPosition = (element, position) => {
  element.dataset.offsetX = String(position.x);
  element.dataset.offsetY = String(position.y);
  element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
};

export const applySavedPosition = (element) => {
  if (element) applyPosition(element, readPosition());
};

export const beginDrag = (event) => {
  if (event.button !== 0 || event.target.closest("button, input")) return;

  event.preventDefault();
  const card = event.currentTarget;
  const startRect = card.getBoundingClientRect();
  const offsetX = Number(card.dataset.offsetX) || 0;
  const offsetY = Number(card.dataset.offsetY) || 0;
  const originX = event.clientX;
  const originY = event.clientY;
  card.dataset.dragging = "true";

  const move = (moveEvent) => {
    const position = clampDraggedOffset({
      startRect,
      deltaX: moveEvent.clientX - originX,
      deltaY: moveEvent.clientY - originY,
      offsetX,
      offsetY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    applyPosition(card, position);
  };

  const stop = () => {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", stop);
    delete card.dataset.dragging;
    writePosition({
      x: Number(card.dataset.offsetX) || 0,
      y: Number(card.dataset.offsetY) || 0,
    });
  };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", stop);
};

export const resetSavedPosition = (event) => {
  if (event.target.closest("button, input")) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (_) {
    // The visual reset still works without local storage.
  }
  applyPosition(event.currentTarget, { x: 0, y: 0 });
};
