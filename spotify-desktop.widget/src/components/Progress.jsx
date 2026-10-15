import { formatTime, progressPercent } from "../utils.js";

export const Progress = ({ durationMs, positionSec, playing, onSeek }) => {
  const percentage = progressPercent(positionSec, durationMs);
  const durationSeconds = durationMs / 1000;
  const seek = (event) => {
    if (!durationSeconds) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
    onSeek(ratio * durationSeconds);
  };

  return (
    <div className="progress-area">
      <button
        className="progress-track"
        onClick={seek}
        disabled={!durationSeconds}
        aria-label={`Posição: ${formatTime(positionSec)} de ${formatTime(durationSeconds)}`}
        title="Clique para alterar a posição"
      >
        <span
          className={`progress-fill ${playing ? "progress-playing" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </button>
      <div className="time-row" aria-hidden="true">
        <span>{formatTime(positionSec)}</span>
        <span>{formatTime(durationSeconds)}</span>
      </div>
    </div>
  );
};

