const SCRIPT_ROOT = "spotify-desktop.widget/scripts";

export const STATUS_COMMAND = `osascript ${SCRIPT_ROOT}/spotify-status.applescript`;

export const EMPTY_PLAYER = Object.freeze({
  ok: true,
  appRunning: false,
  state: "closed",
  title: "",
  artist: "",
  album: "",
  artwork: "",
  durationMs: 0,
  positionSec: 0,
  trackId: "",
  errorCode: "",
  errorMessage: "",
});

export const parseSpotifyOutput = (output) => {
  if (typeof output !== "string" || !output.trim()) {
    return {
      ...EMPTY_PLAYER,
      ok: false,
      state: "error",
      errorCode: "empty_response",
      errorMessage: "O Spotify não retornou dados.",
    };
  }

  try {
    const data = JSON.parse(output.trim());
    const allowedStates = ["playing", "paused", "stopped", "closed", "error"];
    return {
      ...EMPTY_PLAYER,
      ...data,
      ok: data.ok !== false,
      appRunning: Boolean(data.appRunning),
      state: allowedStates.includes(data.state) ? data.state : "error",
      durationMs: Math.max(0, Number(data.durationMs) || 0),
      positionSec: Math.max(0, Number(data.positionSec) || 0),
    };
  } catch (_) {
    return {
      ...EMPTY_PLAYER,
      ok: false,
      state: "error",
      errorCode: "invalid_response",
      errorMessage: "A resposta do AppleScript não pôde ser interpretada.",
    };
  }
};

export const buildControlCommand = (action, value) => {
  const commands = {
    toggle: `osascript ${SCRIPT_ROOT}/spotify-control.applescript toggle`,
    play: `osascript ${SCRIPT_ROOT}/spotify-control.applescript play`,
    pause: `osascript ${SCRIPT_ROOT}/spotify-control.applescript pause`,
    next: `osascript ${SCRIPT_ROOT}/spotify-control.applescript next`,
    previous: `osascript ${SCRIPT_ROOT}/spotify-control.applescript previous`,
  };

  if (action === "seek") {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds < 0) {
      throw new Error("Posição de reprodução inválida.");
    }
    const milliseconds = Math.round(seconds * 1000);
    return `osascript ${SCRIPT_ROOT}/spotify-control.applescript seek ${milliseconds}`;
  }

  if (!commands[action]) throw new Error("Ação de reprodução inválida.");
  return commands[action];
};

export const reduceSpotifyState = (event, previousState = EMPTY_PLAYER) => {
  if (event.type === "CONTROL_PENDING") {
    const optimisticState = event.action === "pause"
      ? "paused"
      : event.action === "play"
        ? "playing"
        : previousState.state;
    return {
      ...previousState,
      state: optimisticState,
      stateBeforeControl: previousState.state,
      controlPending: event.action,
      warning: "",
    };
  }
  if (event.type === "CONTROL_COMPLETE") {
    return { ...previousState, stateBeforeControl: "", controlPending: "", warning: "" };
  }
  if (event.type === "CONTROL_FAILED") {
    return {
      ...previousState,
      state: previousState.stateBeforeControl || previousState.state,
      stateBeforeControl: "",
      controlPending: "",
      warning: "Não foi possível controlar o Spotify.",
    };
  }
  if (event.error) {
    return {
      ...EMPTY_PLAYER,
      ok: false,
      state: "error",
      errorCode: "command_failed",
      errorMessage: String(event.error),
    };
  }

  const nextPlayer = parseSpotifyOutput(event.output);
  const trackChanged = Boolean(
    nextPlayer.trackId &&
    previousState.trackId &&
    nextPlayer.trackId !== previousState.trackId
  );

  return {
    ...nextPlayer,
    previousArtwork: trackChanged ? previousState.artwork : "",
    controlPending: previousState.controlPending || "",
    warning: "",
  };
};
