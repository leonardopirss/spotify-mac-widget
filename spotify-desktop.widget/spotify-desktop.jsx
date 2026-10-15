import { run } from "uebersicht";
import { config } from "./src/config.js";
import { Player } from "./src/components/Player.jsx";
import {
  buildControlCommand,
  EMPTY_PLAYER,
  reduceSpotifyState,
  STATUS_COMMAND,
} from "./src/spotify.js";

export const command = STATUS_COMMAND;
export const refreshFrequency = config.refreshInterval;

export const initialState = {
  ...EMPTY_PLAYER,
  controlPending: "",
  warning: "",
};

export const updateState = (event, previousState) =>
  reduceSpotifyState(event, previousState);

const executeControl = (dispatch, action, value) => {
  let shellCommand;
  try {
    shellCommand = buildControlCommand(action, value);
  } catch (error) {
    dispatch({ type: "CONTROL_FAILED", error });
    return;
  }

  dispatch({ type: "CONTROL_PENDING", action });
  run(shellCommand)
    .then((output) => {
      const result = JSON.parse(output);
      if (!result.ok) throw new Error(result.errorMessage || "Falha no controle do Spotify.");
      dispatch({ type: "CONTROL_COMPLETE" });
      run(STATUS_COMMAND)
        .then((statusOutput) => dispatch({ output: statusOutput }))
        .catch(() => {});
    })
    .catch((error) => dispatch({ type: "CONTROL_FAILED", error }));
};

export const render = (player, dispatch) => (
  <Player
    player={player}
    config={config}
    onControl={(action) => executeControl(dispatch, action)}
    onSeek={(seconds) => executeControl(dispatch, "seek", seconds)}
  />
);

export const className = `
  top: ${config.position.top};
  right: ${config.position.right};
  bottom: ${config.position.bottom};
  left: ${config.position.left};
  width: ${config.width}px;
  color: #F5F7F6;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
  z-index: 1;
  pointer-events: none;

  * { box-sizing: border-box; }

  .player {
    position: relative;
    display: flex;
    overflow: hidden;
    width: 100%;
    color: #F5F7F6;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, .10), rgba(7, 22, 25, .04) 48%),
      rgba(7, 24, 27, var(--card-opacity));
    border: 1px solid rgba(255, 255, 255, .13);
    border-top-color: rgba(255, 255, 255, .24);
    border-radius: 22px;
    box-shadow:
      0 22px 50px rgba(0, 0, 0, .32),
      inset 0 1px 0 rgba(255, 255, 255, .07);
    -webkit-backdrop-filter: blur(22px) saturate(160%);
    backdrop-filter: blur(22px) saturate(160%);
    pointer-events: auto;
    isolation: isolate;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    will-change: transform;
  }

  .player[data-dragging="true"] { cursor: grabbing; }

  .drag-hint {
    position: absolute;
    z-index: 4;
    top: 6px;
    left: 50%;
    display: flex;
    gap: 3px;
    padding: 3px 8px;
    transform: translateX(-50%);
    opacity: .32;
  }

  .drag-hint i {
    display: block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--accent);
  }

  .accent-picker {
    position: absolute;
    z-index: 5;
    top: 9px;
    right: 10px;
    display: block;
    width: 17px;
    height: 17px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, .32);
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 2px 8px rgba(0, 0, 0, .28);
    cursor: pointer;
    transition: transform 160ms ease;
  }

  .accent-picker:hover { transform: scale(1.12); }

  .accent-picker input {
    position: absolute;
    inset: -8px;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 0;
    opacity: 0;
    cursor: pointer;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .ambient-glow {
    position: absolute;
    z-index: -1;
    width: 230px;
    height: 230px;
    top: -145px;
    left: -60px;
    border-radius: 50%;
    background: rgba(190, 225, 255, .55);
    filter: blur(65px);
    opacity: .07;
    transition: opacity 800ms ease;
  }

  .artwork-shell {
    position: relative;
    flex: 0 0 auto;
    overflow: hidden;
    background: #102D29;
    box-shadow: 0 8px 24px rgba(0, 0, 0, .26), inset 0 0 0 1px rgba(255, 255, 255, .08);
  }

  .artwork {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .with-motion .artwork-enter { animation: artwork-enter 520ms cubic-bezier(.2, .8, .2, 1); }
  .with-motion .artwork-exit {
    z-index: 2;
    animation: artwork-exit 520ms cubic-bezier(.2, .8, .2, 1) forwards;
  }

  .without-motion .artwork-exit { display: none; }

  .artwork-fallback {
    display: grid;
    place-items: center;
    color: rgba(214, 255, 117, .78);
    background:
      radial-gradient(circle at 25% 20%, rgba(29, 185, 84, .32), transparent 45%),
      linear-gradient(145deg, #173c36, #0a211e);
  }

  .artwork-image { z-index: 1; }

  .artwork-fallback svg { width: 35%; fill: currentColor; opacity: .9; }

  .player-body {
    min-width: 0;
    flex: 1;
    display: flex;
  }

  .track-copy { min-width: 0; }

  .status-line {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    color: #9AAEAA;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .11em;
    line-height: 1;
    text-transform: uppercase;
  }

  .status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #718581;
    box-shadow: 0 0 0 3px rgba(113, 133, 129, .1);
  }

  [data-state="playing"] .status-dot {
    background: var(--accent);
    box-shadow: 0 0 8px rgba(214, 255, 117, .72);
  }

  .with-motion[data-state="playing"] .status-dot { animation: soft-pulse 2s ease-in-out infinite; }

  .track-title,
  .track-artist {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track-title {
    color: #F5F7F6;
    font-size: 15px;
    font-weight: 680;
    letter-spacing: -.025em;
    line-height: 1.25;
  }

  .track-artist {
    margin-top: 3px;
    color: #9AAEAA;
    font-size: 12px;
    font-weight: 480;
    line-height: 1.25;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .control-button,
  .progress-track {
    appearance: none;
    -webkit-appearance: none;
    border: 0;
    font: inherit;
    cursor: pointer;
  }

  .control-button {
    display: grid;
    place-items: center;
    padding: 0;
    color: #F5F7F6;
    background: transparent;
    border-radius: 50%;
    transition: transform 160ms ease, color 160ms ease, background-color 160ms ease, opacity 160ms ease;
  }

  .control-button:hover:not(:disabled) { transform: scale(1.08); }
  .control-button:active:not(:disabled) { transform: scale(.94); }
  .control-button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .control-button:disabled { cursor: default; opacity: .28; }
  .control-button svg { width: 44%; height: 44%; fill: currentColor; }

  .secondary-control {
    width: 31px;
    height: 31px;
    color: #B8C7C4;
  }

  .secondary-control:hover:not(:disabled) { color: var(--accent); background: rgba(255, 255, 255, .05); }

  .primary-control {
    width: 39px;
    height: 39px;
    color: #071E1B;
    background: var(--accent);
    box-shadow: 0 5px 16px rgba(29, 185, 84, .22), inset 0 1px 0 rgba(255, 255, 255, .4);
  }

  .progress-area { width: 100%; }

  .progress-track {
    position: relative;
    display: block;
    overflow: hidden;
    width: 100%;
    height: 4px;
    padding: 0;
    border-radius: 99px;
    background: rgba(154, 174, 170, .18);
  }

  .progress-track:disabled { cursor: default; }

  .progress-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--accent);
    box-shadow: 0 0 9px var(--accent);
  }

  .with-motion .progress-playing { transition: width 1900ms linear; }

  .time-row {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    color: rgba(154, 174, 170, .82);
    font-size: 9px;
    font-variant-numeric: tabular-nums;
    letter-spacing: .02em;
  }

  .warning {
    position: absolute;
    right: 12px;
    bottom: 7px;
    max-width: calc(100% - 24px);
    overflow: hidden;
    color: #ffd9a6;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player-compact {
    min-height: 126px;
    padding: 15px;
    gap: 15px;
  }

  .player-compact .artwork-shell {
    width: 96px;
    height: 96px;
    border-radius: 15px;
  }

  .player-compact .player-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: 1fr auto;
    column-gap: 10px;
    row-gap: 11px;
    align-items: center;
  }

  .player-compact .track-copy { align-self: end; }
  .player-compact .progress-area { grid-column: 1 / -1; align-self: end; }
  .player-compact .controls { grid-column: 2; grid-row: 1; align-self: end; }
  .player-compact .primary-control { width: 35px; height: 35px; }
  .player-compact .secondary-control { width: 24px; height: 28px; }
  .player-compact .controls { gap: 3px; }

  .player-classic {
    min-height: 428px;
    padding: 18px;
    flex-direction: column;
    gap: 15px;
  }

  .player-classic .artwork-shell {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 17px;
  }

  .player-classic .player-body {
    flex-direction: column;
    gap: 13px;
  }

  .player-classic .track-copy { text-align: center; }
  .player-classic .status-line { justify-content: center; }
  .player-classic .track-title { font-size: 18px; }
  .player-classic .track-artist { font-size: 13px; }
  .player-classic .controls { order: 2; }
  .player-classic .progress-area { order: 3; }
  .player-classic .primary-control { width: 44px; height: 44px; }

  .player-minimal {
    min-height: 70px;
    padding: 10px;
    gap: 11px;
    border-radius: 19px;
  }

  .player-minimal .artwork-shell {
    width: 50px;
    height: 50px;
    border-radius: 12px;
  }

  .player-minimal .player-body { align-items: center; gap: 9px; }
  .player-minimal .track-copy { flex: 1; }
  .player-minimal .status-line { margin-bottom: 4px; }
  .player-minimal .track-title { font-size: 13px; }
  .player-minimal .primary-control { width: 36px; height: 36px; }

  @keyframes artwork-enter {
    from { opacity: .2; transform: scale(1.035); filter: blur(5px); }
    to { opacity: 1; transform: scale(1); filter: blur(0); }
  }

  @keyframes artwork-exit {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(.975); }
  }

  @keyframes soft-pulse {
    0%, 100% { opacity: .65; transform: scale(.88); }
    50% { opacity: 1; transform: scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .with-motion .artwork-enter,
    .with-motion .artwork-exit,
    .with-motion[data-state="playing"] .status-dot { animation: none; }
    .with-motion .progress-playing { transition: none; }
    .with-motion .artwork-exit { display: none; }
  }
`;
