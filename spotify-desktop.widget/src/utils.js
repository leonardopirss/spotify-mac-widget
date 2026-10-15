export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const formatTime = (seconds) => {
  const safeSeconds = Number.isFinite(Number(seconds))
    ? Math.max(0, Math.floor(Number(seconds)))
    : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
};

export const progressPercent = (positionSeconds, durationMs) => {
  const durationSeconds = Number(durationMs) / 1000;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return clamp((Number(positionSeconds) / durationSeconds) * 100, 0, 100);
};

const colorDistance = (first, second) =>
  ((first[0] - second[0]) ** 2) +
  ((first[1] - second[1]) ** 2) +
  ((first[2] - second[2]) ** 2);

export const buildArtworkPalette = (pixelData) => {
  const colors = [];
  for (let index = 0; index < pixelData.length; index += 4) {
    if (pixelData[index + 3] < 210) continue;
    const color = [pixelData[index], pixelData[index + 1], pixelData[index + 2]];
    const luminance = (color[0] * 0.2126) + (color[1] * 0.7152) + (color[2] * 0.0722);
    if (luminance > 10 && luminance < 246) colors.push(color);
  }
  if (!colors.length) return [[29, 185, 84], [214, 255, 117], [16, 45, 41]];

  const chroma = (color) => Math.max(...color) - Math.min(...color);
  const first = colors.reduce((best, color) => chroma(color) > chroma(best) ? color : best, colors[0]);
  const second = colors.reduce((best, color) =>
    colorDistance(color, first) > colorDistance(best, first) ? color : best, colors[0]);
  const third = colors.reduce((best, color) => {
    const score = Math.min(colorDistance(color, first), colorDistance(color, second));
    const bestScore = Math.min(colorDistance(best, first), colorDistance(best, second));
    return score > bestScore ? color : best;
  }, colors[0]);
  let centroids = [first, second, third].map((color) => [...color]);

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const buckets = centroids.map(() => ({ red: 0, green: 0, blue: 0, count: 0 }));
    colors.forEach((color) => {
      let nearest = 0;
      for (let index = 1; index < centroids.length; index += 1) {
        if (colorDistance(color, centroids[index]) < colorDistance(color, centroids[nearest])) nearest = index;
      }
      buckets[nearest].red += color[0];
      buckets[nearest].green += color[1];
      buckets[nearest].blue += color[2];
      buckets[nearest].count += 1;
    });
    centroids = buckets.map((bucket, index) => bucket.count
      ? [bucket.red, bucket.green, bucket.blue].map((channel) => Math.round(channel / bucket.count))
      : centroids[index]);
  }

  return centroids.sort((a, b) => chroma(b) - chroma(a));
};

export const sampleArtworkColor = (event) => {
  const image = event.currentTarget;
  const card = image.closest("[data-player-card]");
  if (!card || !image.naturalWidth) return;

  try {
    const canvas = document.createElement("canvas");
    const size = 18;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, size, size);
    const pixels = context.getImageData(0, 0, size, size).data;
    const palette = buildArtworkPalette(pixels);
    const [primary, secondary, tertiary] = palette;
    card.style.setProperty("--cover-a", primary.join(", "));
    card.style.setProperty("--cover-b", secondary.join(", "));
    card.style.setProperty("--cover-c", tertiary.join(", "));
    card.style.setProperty("--artwork-color", `rgb(${primary.join(", ")})`);
  } catch (_) {
    // Cross-origin artwork can block canvas sampling. The configured accent remains.
  }
};
