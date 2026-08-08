import { formatElapsed } from "../utils/time";

export default function Transport({
  isPlaying,
  isPaused,
  elapsedMs,
  onStart,
  onStop,
  onPause,
  onResume,
}) {
  return (
    <div className="my-3.5 mb-5 flex flex-col items-center gap-2.5">
      <div className="flex items-center gap-3">
        {/* Primary action */}
        <button
          onClick={isPlaying ? onStop : isPaused ? onResume : onStart}
          className={
            "font-display rounded-full px-11 py-3.5 text-xl font-bold tracking-wider uppercase " +
            "transition-transform hover:-translate-y-px active:translate-y-0 " +
            "focus-visible:outline-brass-bright focus-visible:outline-2 focus-visible:outline-offset-[3px] " +
            (isPlaying
              ? "from-ember text-primary bg-linear-to-b to-[#B84420] shadow-[0_8px_20px_-6px_rgba(225,89,47,0.4)]"
              : "from-brass-bright to-brass bg-linear-to-b text-base shadow-[0_8px_20px_-6px_rgba(201,161,91,0.45)]")
          }
        >
          {isPlaying ? "Stop" : isPaused ? "Resume" : "Start"}
        </button>

        {/* Secondary: Pause (visible only while playing) */}
        {isPlaying && (
          <button
            onClick={onPause}
            className={
              "font-display rounded-full px-6 py-2 text-sm font-bold tracking-wider uppercase " +
              "transition-transform hover:-translate-y-px active:translate-y-0 " +
              "focus-visible:outline-brass-bright focus-visible:outline-2 focus-visible:outline-offset-[3px] " +
              "from-brass-bright to-brass bg-linear-to-b text-base shadow-[0_8px_20px_-6px_rgba(201,161,91,0.45)]"
            }
          >
            Pause
          </button>
        )}
      </div>

      <div className="text-center">
        <div className="text-primary font-mono text-3xl tabular-nums">
          {formatElapsed(elapsedMs)}
        </div>
        <div className="text-faint font-mono text-[10px] tracking-[0.18em] uppercase">
          session time
        </div>
      </div>
    </div>
  );
}
