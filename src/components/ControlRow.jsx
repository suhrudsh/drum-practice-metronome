export default function ControlRow({ label, value, children, sub }) {
  return (
    <div className="bg-raised border border-line rounded-xl px-4 pt-3 pb-3.5">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">{label}</span>
        {value && <span className="font-mono text-base tabular-nums text-brass-bright">{value}</span>}
      </div>
      {children}
      {sub && <div className="font-mono text-[11px] text-faint mt-0.5">{sub}</div>}
    </div>
  )
}
