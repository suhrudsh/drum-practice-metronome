import { useRef } from "react";
import ControlRow from "./ControlRow";

const MIN_TEMPO = 30;
const MAX_TEMPO = 280;

const stepBtnClass =
  "w-[30px] h-[30px] rounded-lg border border-line bg-panel text-brass-bright font-mono text-base " +
  "leading-none cursor-pointer flex-shrink-0 hover:border-brass " +
  "focus-visible:outline-2 focus-visible:outline-brass-bright focus-visible:outline-offset-2";

export default function TempoControl({ tempo, onChange }) {
  const tapTimesRef = useRef([]);

  const clamp = (v) => Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, v));

  const handleTap = () => {
    const now = Date.now();
    let taps = [...tapTimesRef.current, now].filter((t) => now - t < 2200);
    if (taps.length > 6) taps = taps.slice(-6);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const intervals = taps.slice(1).map((t, i) => t - taps[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      onChange(clamp(Math.round(60000 / avg)));
    }
  };

  return (
    <ControlRow label="Tempo" value={`${tempo} BPM`}>
      <div className="flex items-center gap-2.5">
        <button
          className={stepBtnClass}
          aria-label="Decrease tempo"
          onClick={() => onChange(clamp(tempo - 1))}
        >
          &minus;
        </button>
        <input
          type="range"
          className="slider"
          min={MIN_TEMPO}
          max={MAX_TEMPO}
          step={1}
          value={tempo}
          aria-label="Tempo in beats per minute"
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
        />
        <button
          className={stepBtnClass}
          aria-label="Increase tempo"
          onClick={() => onChange(clamp(tempo + 1))}
        >
          +
        </button>
        <button
          className="text-muted border-line hover:text-brass-bright hover:border-brass focus-visible:outline-brass-bright shrink-0 cursor-pointer rounded-lg border bg-transparent px-2.5 py-1.5 font-mono text-[11px] tracking-wider uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={handleTap}
        >
          Tap
        </button>
      </div>
    </ControlRow>
  );
}
