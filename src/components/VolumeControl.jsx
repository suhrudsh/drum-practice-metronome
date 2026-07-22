import ControlRow from './ControlRow'

export default function VolumeControl({ volume, onChange }) {
  const percent = Math.round(volume * 100)

  return (
    <ControlRow label="Volume" value={`${percent}%`}>
      <input
        type="range"
        className="slider"
        min={0}
        max={100}
        step={1}
        value={percent}
        aria-label="Click volume"
        onChange={(e) => onChange(Number(e.target.value) / 100)}
      />
    </ControlRow>
  )
}
