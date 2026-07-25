import ControlRow from "./ControlRow";

const MIN_BEATS = 2;
const MAX_BEATS = 12;
const NOTE_VALUES = [4, 8, 16];

const stepBtnClass =
  "w-[30px] h-[30px] rounded-lg border border-line bg-panel text-brass-bright font-mono text-base " +
  "leading-none cursor-pointer flex-shrink-0 hover:border-brass " +
  "focus-visible:outline-2 focus-visible:outline-brass-bright focus-visible:outline-offset-2";

export default function TimeSignatureControl({
  numerator,
  denominator,
  onNumeratorChange,
  onDenominatorChange,
}) {
  return (
    <ControlRow label="Time Signature" value={`${numerator}/${denominator}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={stepBtnClass}
            aria-label="Fewer beats per measure"
            onClick={() =>
              onNumeratorChange(Math.max(MIN_BEATS, numerator - 1))
            }
          >
            &minus;
          </button>
          <span className="text-brass-bright min-w-4.5 text-center font-mono text-xl">
            {numerator}
          </span>
          <button
            className={stepBtnClass}
            aria-label="More beats per measure"
            onClick={() =>
              onNumeratorChange(Math.min(MAX_BEATS, numerator + 1))
            }
          >
            +
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {NOTE_VALUES.map((val) => (
            <button
              key={val}
              onClick={() => onDenominatorChange(val)}
              className={
                "cursor-pointer rounded-lg border px-3 py-1.5 font-mono text-[13px] " +
                "focus-visible:outline-brass-bright focus-visible:outline-2 focus-visible:outline-offset-2 " +
                (denominator === val
                  ? "bg-brass border-brass text-base font-bold"
                  : "bg-panel border-line text-muted hover:border-brass")
              }
            >
              /{val}
            </button>
          ))}
        </div>
      </div>
    </ControlRow>
  );
}
