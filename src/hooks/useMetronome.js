import { useEffect, useRef, useState, useCallback } from "react";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.12;

/**
 * Web Audio lookahead-scheduler metronome.
 *
 * Clicks are scheduled on the audio clock (not setInterval), so timing stays
 * accurate regardless of React render timing or tab throttling. Live params
 * (tempo, speedMultiplier, numerator) are mirrored into refs so the
 * running scheduler loop always reads the latest value without needing to
 * restart. `onBeat(beatIndex, audioTime)` fires once per beat, scheduled via
 * setTimeout to land at the same moment as that beat's click — the caller
 * uses it to drive visuals imperatively (see PendulumStage).
 */
export function useMetronome({ tempo, speedMultiplier, numerator, onBeat }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const audioCtxRef = useRef(null);
  const schedulerIdRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const elapsedIntervalRef = useRef(null);
  const startTimestampRef = useRef(0);
  const pausedElapsedRef = useRef(0);

  const tempoRef = useRef(tempo);
  const speedRef = useRef(speedMultiplier);
  const numeratorRef = useRef(numerator);
  const onBeatRef = useRef(onBeat);

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);
  useEffect(() => {
    onBeatRef.current = onBeat;
  }, [onBeat]);
  useEffect(() => {
    numeratorRef.current = numerator;
    currentBeatRef.current = currentBeatRef.current % numerator;
  }, [numerator]);

  const effectiveBpm = () => tempoRef.current * speedRef.current;
  const beatDuration = () => 60 / effectiveBpm();

  const playClick = useCallback((time, isDownbeat) => {
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = isDownbeat ? 1600 : 1000;
    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.exponentialRampToValueAtTime(1, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
    osc.start(time);
    osc.stop(time + 0.06);
  }, []);

  const scheduleNote = useCallback(
    (beatIndex, time) => {
      playClick(time, beatIndex === 0);
      const delayMs = Math.max(
        0,
        (time - audioCtxRef.current.currentTime) * 1000,
      );
      setTimeout(() => onBeatRef.current?.(beatIndex), delayMs);
    },
    [playClick],
  );

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      scheduleNote(currentBeatRef.current, nextNoteTimeRef.current);
      nextNoteTimeRef.current += beatDuration();
      currentBeatRef.current =
        (currentBeatRef.current + 1) % numeratorRef.current;
    }
    schedulerIdRef.current = setTimeout(scheduler, LOOKAHEAD_MS);
  }, [scheduleNote]);

  const start = useCallback(() => {
    if (isPlaying) return;

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
    scheduler();

    startTimestampRef.current = Date.now();
    setElapsedMs(0);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimestampRef.current);
    }, 250);

    setIsPlaying(true);
    setIsPaused(false);
  }, [isPlaying, scheduler]);

  const pause = useCallback(() => {
    if (!audioCtxRef.current || !isPlaying) return;
    // capture elapsed time so the session display can resume later
    pausedElapsedRef.current = Date.now() - startTimestampRef.current;
    clearTimeout(schedulerIdRef.current);
    clearInterval(elapsedIntervalRef.current);
    // suspend audio processing so sounds stop immediately
    if (audioCtxRef.current.state === "running") audioCtxRef.current.suspend();
    setIsPlaying(false);
    setIsPaused(true);
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (!audioCtxRef.current || isPlaying) return;
    // resume the audio context
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();

    // restore elapsed time and continue the interval without resetting to zero
    startTimestampRef.current = Date.now() - pausedElapsedRef.current;
    setElapsedMs(pausedElapsedRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimestampRef.current);
    }, 250);

    // Reset beat position to start (user requested behavior)
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
    scheduler();

    setIsPlaying(true);
    setIsPaused(false);
    pausedElapsedRef.current = 0;
  }, [isPlaying, scheduler]);

  const stop = useCallback(() => {
    clearTimeout(schedulerIdRef.current);
    clearInterval(elapsedIntervalRef.current);
    setIsPlaying(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    isPlaying,
    isPaused,
    elapsedMs,
    start,
    stop,
    pause,
    resume,
    currentBeatRef,
    beatDuration,
  };
}
