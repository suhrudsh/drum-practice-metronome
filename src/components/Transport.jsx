import { formatElapsed } from '../utils/time'

export default function Transport({ isPlaying, elapsedMs, onToggle }) {
  return (
    <div className="flex flex-col items-center gap-2.5 my-3.5 mb-5">
      <button
        onClick={onToggle}
        className={
          'font-display text-xl tracking-wider uppercase font-bold rounded-full px-11 py-3.5 ' +
          'transition-transform active:translate-y-0 hover:-translate-y-px ' +
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-bright focus-visible:outline-offset-[3px] ' +
          (isPlaying
            ? 'bg-gradient-to-b from-ember to-[#B84420] text-primary shadow-[0_8px_20px_-6px_rgba(225,89,47,0.4)]'
            : 'bg-gradient-to-b from-brass-bright to-brass text-base shadow-[0_8px_20px_-6px_rgba(201,161,91,0.45)]')
        }
      >
        {isPlaying ? 'Stop' : 'Start'}
      </button>

      <div className="text-center">
        <div className="font-mono text-3xl tabular-nums text-primary">{formatElapsed(elapsedMs)}</div>
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-faint">session time</div>
      </div>
    </div>
  )
}
