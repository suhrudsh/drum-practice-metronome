import { useRef, useState, useCallback } from "react";
import { useMetronome } from "./hooks/useMetronome";
import PendulumStage from "./components/PendulumStage";
import Transport from "./components/Transport";
import TempoControl from "./components/TempoControl";
import SpeedControl from "./components/SpeedControl";
import { SPEED_OPTIONS } from "./constants/speed";
import TimeSignatureControl from "./components/TimeSignatureControl";

export default function App() {
  const [tempo, setTempo] = useState(120);
  const [speedKey, setSpeedKey] = useState("normal");
  const [numerator, setNumerator] = useState(4);
  const [denominator, setDenominator] = useState(4);

  const speedMultiplier = SPEED_OPTIONS.find(
    (o) => o.key === speedKey,
  ).multiplier;
  const pendulumRef = useRef(null);

  const handleBeat = useCallback((beatIndex) => {
    pendulumRef.current?.onBeat(beatIndex);
  }, []);

  const { isPlaying, elapsedMs, start, stop, beatDuration } = useMetronome({
    tempo,
    speedMultiplier,
    numerator,
    onBeat: handleBeat,
  });

  const handleToggle = () => {
    if (isPlaying) {
      stop();
      pendulumRef.current?.reset();
    } else {
      pendulumRef.current?.prepareStart();
      start();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className="from-panel to-base border-line relative w-full max-w-105 rounded-2xl border bg-linear-to-b px-4 pt-6 pb-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] sm:rounded-[20px] sm:px-7 sm:pt-8 sm:pb-6 lg:max-w-205 lg:px-10 lg:pt-9 lg:pb-8">
        <p className="text-faint mb-1 text-center font-mono text-[10px] tracking-[0.18em] uppercase sm:text-[11px]">
          Drum Practice
        </p>
        <h1 className="font-display mt-0 mb-5 text-center text-2xl font-bold tracking-wide uppercase sm:text-[28px] lg:mb-8 lg:text-[32px]">
          Metronome
        </h1>

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[300px_1fr] lg:items-center lg:gap-10">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-65">
              <PendulumStage
                ref={pendulumRef}
                numerator={numerator}
                beatDuration={beatDuration}
              />
            </div>
            <Transport
              isPlaying={isPlaying}
              elapsedMs={elapsedMs}
              onToggle={handleToggle}
            />
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            <TempoControl tempo={tempo} onChange={setTempo} />
            <SpeedControl
              speedKey={speedKey}
              onChange={setSpeedKey}
              effectiveBpm={tempo * speedMultiplier}
            />
            <TimeSignatureControl
              numerator={numerator}
              denominator={denominator}
              onNumeratorChange={setNumerator}
              onDenominatorChange={setDenominator}
            />
          </div>
        </div>

        <p className="text-faint mt-5 text-center font-mono text-[10px] tracking-wide lg:mt-7">
          clicks stay locked to the audio clock — safe to change tempo, or speed
          mid-session
        </p>
      </div>
    </div>
  );
}
