export default function ControlRow({ label, value, children, sub }) {
  return (
    <div className="bg-raised border-line rounded-xl border px-4 pt-3 pb-3.5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted font-mono text-[11px] tracking-[0.14em] uppercase">
          {label}
        </span>
        {value && (
          <span className="text-brass-bright font-mono tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
      {sub && (
        <div className="text-faint mt-0.5 font-mono text-[11px]">{sub}</div>
      )}
    </div>
  );
}
