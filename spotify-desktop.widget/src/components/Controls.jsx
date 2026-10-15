import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from "./Icons.jsx";

export const Controls = ({ state, disabled, compact, onControl }) => {
  const isPlaying = state === "playing";
  return (
    <div className={`controls ${compact ? "controls-compact" : ""}`}>
      {!compact && (
        <button
          className="control-button secondary-control"
          onClick={() => onControl("previous")}
          disabled={disabled}
          aria-label="Música anterior"
          title="Música anterior"
        >
          <PreviousIcon />
        </button>
      )}
      <button
        className="control-button primary-control"
        onClick={() => onControl(isPlaying ? "pause" : "play")}
        disabled={disabled}
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        title={isPlaying ? "Pausar" : "Reproduzir"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      {!compact && (
        <button
          className="control-button secondary-control"
          onClick={() => onControl("next")}
          disabled={disabled}
          aria-label="Próxima música"
          title="Próxima música"
        >
          <NextIcon />
        </button>
      )}
    </div>
  );
};

