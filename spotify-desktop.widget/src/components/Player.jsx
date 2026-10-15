import { Artwork } from "./Artwork.jsx";
import { Controls } from "./Controls.jsx";
import { Progress } from "./Progress.jsx";
import { applySavedPosition, beginDrag, resetSavedPosition } from "../drag.js";
import { applySavedAccent, changeAccent } from "../theme.js";

const copyForState = (player) => {
  if (player.state === "closed") {
    return { title: "Spotify está fechado", artist: "Abra o app para começar" };
  }
  if (player.state === "error") {
    const permission = player.errorCode === "permission_denied";
    return {
      title: permission ? "Permissão necessária" : "Spotify indisponível",
      artist: permission ? "Libere Automação nos Ajustes" : "Verifique a integração local",
    };
  }
  if (player.state === "stopped") {
    return { title: "Nada tocando", artist: "Escolha uma música no Spotify" };
  }
  return {
    title: player.title || "Faixa sem título",
    artist: player.artist || "Artista desconhecido",
  };
};

export const Player = ({ player, config, onControl, onSeek }) => {
  const copy = copyForState(player);
  const hasTrack = player.state === "playing" || player.state === "paused";
  const disabled = !player.appRunning || player.state === "error";
  const minimal = config.layout === "minimal";
  const initializePlayer = (element) => {
    if (!element) return;
    if (config.draggable) applySavedPosition(element);
    applySavedAccent(element, config.accentColor);
  };

  return (
    <section
      className={`player player-${config.layout} ${config.animations ? "with-motion" : "without-motion"}`}
      data-player-card
      data-state={player.state}
      style={{
        "--accent": config.accentColor,
        "--card-opacity": config.opacity,
      }}
      ref={initializePlayer}
      onMouseDown={config.draggable ? beginDrag : undefined}
      onDoubleClick={config.draggable ? resetSavedPosition : undefined}
      aria-label="Spotify Desktop Player"
      title={config.draggable ? "Arraste para mover • Duplo clique para restaurar a posição" : undefined}
    >
      <div className="ambient-glow" />
      {config.draggable && <div className="drag-hint" aria-hidden="true"><i /><i /><i /></div>}
      <label className="accent-picker" title="Mudar a cor dos controles">
        <span className="visually-hidden">Mudar a cor dos controles</span>
        <input
          data-accent-picker
          type="color"
          defaultValue={config.accentColor}
          onInput={changeAccent}
          onMouseDown={(event) => event.stopPropagation()}
          aria-label="Mudar a cor dos controles"
        />
      </label>
      <Artwork
        artwork={hasTrack ? player.artwork : ""}
        previousArtwork={player.previousArtwork}
        trackId={player.trackId}
        title={copy.title}
        deriveColor={config.deriveColorFromArtwork}
      />

      <div className="player-body">
        <div className="track-copy">
          <div className="status-line">
            <span className="status-dot" />
            <span>{player.state === "playing" ? "Tocando agora" : player.state === "paused" ? "Pausado" : "Spotify"}</span>
          </div>
          <div className="track-title" title={copy.title}>{copy.title}</div>
          {!minimal && <div className="track-artist" title={copy.artist}>{copy.artist}</div>}
        </div>

        {config.layout === "classic" && (
          <Controls state={player.state} disabled={disabled} onControl={onControl} />
        )}

        {config.showProgress && hasTrack && !minimal && (
          <Progress
            durationMs={player.durationMs}
            positionSec={player.positionSec}
            playing={player.state === "playing"}
            onSeek={onSeek}
          />
        )}

        {config.layout !== "classic" && (
          <Controls
            state={player.state}
            disabled={disabled}
            compact={minimal}
            onControl={onControl}
          />
        )}
      </div>

      {player.warning && <div className="warning" role="status">{player.warning}</div>}
    </section>
  );
};
