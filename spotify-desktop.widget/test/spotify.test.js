import test from "node:test";
import assert from "node:assert/strict";

import { buildArtworkPalette, formatTime, progressPercent } from "../src/utils.js";
import { clampDraggedOffset } from "../src/drag.js";
import { normalizeAccentColor } from "../src/theme.js";
import {
  buildControlCommand,
  parseSpotifyOutput,
  reduceSpotifyState,
} from "../src/spotify.js";

test("formats duration and clamps progress", () => {
  assert.equal(formatTime(185.8), "3:05");
  assert.equal(formatTime(-2), "0:00");
  assert.equal(progressPercent(30, 120000), 25);
  assert.equal(progressPercent(500, 120000), 100);
  assert.equal(progressPercent(10, 0), 0);
});

test("validates customizable accent colors", () => {
  assert.equal(normalizeAccentColor("#38bdf8"), "#38BDF8");
  assert.equal(normalizeAccentColor("red", "#112233"), "#112233");
});

test("extracts three distinct colors from album pixels", () => {
  const pixels = new Uint8ClampedArray([
    220, 30, 40, 255, 218, 32, 42, 255,
    20, 180, 90, 255, 24, 176, 92, 255,
    35, 70, 220, 255, 38, 72, 216, 255,
  ]);
  const palette = buildArtworkPalette(pixels);
  assert.equal(palette.length, 3);
  assert.ok(palette.some((color) => color[0] > 200));
  assert.ok(palette.some((color) => color[1] > 150));
  assert.ok(palette.some((color) => color[2] > 200));
});

test("parses track metadata with quotes, unicode and line breaks", () => {
  const payload = JSON.stringify({
    ok: true,
    appRunning: true,
    state: "playing",
    title: "Uma \"faixa\"\nlonga — ação",
    artist: "Björk & João",
    durationMs: 240000,
    positionSec: 14.5,
  });
  const result = parseSpotifyOutput(payload);
  assert.equal(result.state, "playing");
  assert.equal(result.title, "Uma \"faixa\"\nlonga — ação");
  assert.equal(result.artist, "Björk & João");
  assert.equal(result.durationMs, 240000);
});

test("turns malformed responses into a recoverable error state", () => {
  const result = parseSpotifyOutput("not json");
  assert.equal(result.ok, false);
  assert.equal(result.state, "error");
  assert.equal(result.errorCode, "invalid_response");
});

test("whitelists controls and only serializes a finite numeric seek", () => {
  assert.match(buildControlCommand("next"), /spotify-control\.applescript next$/);
  assert.match(buildControlCommand("seek", 42.1256), /seek 42126$/);
  assert.throws(() => buildControlCommand("launch"), /inválida/);
  assert.throws(() => buildControlCommand("seek", "1; open -a Calculator"), /inválida/);
});

test("preserves the player while a control is pending", () => {
  const state = { state: "playing", title: "Track", appRunning: true };
  const pending = reduceSpotifyState({ type: "CONTROL_PENDING", action: "pause" }, state);
  assert.equal(pending.title, "Track");
  assert.equal(pending.controlPending, "pause");
  assert.equal(pending.state, "paused");
  assert.equal(pending.stateBeforeControl, "playing");
});

test("restores the real state when an optimistic control fails", () => {
  const pending = {
    state: "paused",
    stateBeforeControl: "playing",
    controlPending: "pause",
  };
  const failed = reduceSpotifyState({ type: "CONTROL_FAILED" }, pending);
  assert.equal(failed.state, "playing");
  assert.equal(failed.controlPending, "");
});

test("keeps the previous cover for one polling cycle on track changes", () => {
  const previous = {
    state: "playing",
    appRunning: true,
    trackId: "old-track",
    artwork: "https://example.test/old.jpg",
  };
  const output = JSON.stringify({
    ok: true,
    appRunning: true,
    state: "playing",
    trackId: "new-track",
    artwork: "https://example.test/new.jpg",
  });
  const changed = reduceSpotifyState({ output }, previous);
  assert.equal(changed.previousArtwork, previous.artwork);

  const settled = reduceSpotifyState({ output }, changed);
  assert.equal(settled.previousArtwork, "");
});

test("keeps dragged widgets inside the visible screen", () => {
  const base = {
    startRect: { left: 100, top: 100, width: 390, height: 126 },
    offsetX: 0,
    offsetY: 0,
    viewportWidth: 1440,
    viewportHeight: 900,
  };
  assert.deepEqual(clampDraggedOffset({ ...base, deltaX: -500, deltaY: -500 }), { x: -92, y: -92 });
  assert.deepEqual(clampDraggedOffset({ ...base, deltaX: 2000, deltaY: 2000 }), { x: 942, y: 666 });
});
