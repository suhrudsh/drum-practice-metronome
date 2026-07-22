import ControlRow from './ControlRow'
import { SPEED_OPTIONS } from '../constants/speed'

export default function SpeedControl({ speedKey, onChange, effectiveBpm }) {
  return (
    <ControlRow label="Playback Speed" sub={`effective ${Math.round(effectiveBpm)} BPM`}>
      <div className="flex gap-1.5">
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={
              'flex-1 font-mono text-[13px] rounded-lg border px-2 py-2 cursor-pointer transition-colors ' +
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-bright focus-visible:outline-offset-2 ' +
              (speedKey === opt.key
                ? 'bg-brass border-brass text-base font-bold'
                : 'bg-panel border-line text-muted hover:border-brass')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </ControlRow>
  )
}
