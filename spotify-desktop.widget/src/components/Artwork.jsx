import { MusicIcon } from "./Icons.jsx";
import { sampleArtworkColor } from "../utils.js";

export const Artwork = ({ artwork, previousArtwork, trackId, title, deriveColor }) => (
  <div className="artwork-shell">
    <div className="artwork artwork-fallback" aria-label={!artwork ? "Capa indisponível" : undefined}>
      <MusicIcon />
    </div>
    {previousArtwork && (
      <img
        className="artwork artwork-image artwork-exit"
        key={`previous:${previousArtwork}`}
        src={previousArtwork}
        alt=""
        aria-hidden="true"
      />
    )}
    {artwork && (
      <img
        className="artwork artwork-image artwork-enter"
        key={`${trackId}:${artwork}`}
        src={artwork}
        alt={title ? `Capa de ${title}` : "Capa do álbum"}
        crossOrigin="anonymous"
        onLoad={deriveColor ? sampleArtworkColor : undefined}
        onError={(event) => { event.currentTarget.style.display = "none"; }}
      />
    )}
  </div>
);
