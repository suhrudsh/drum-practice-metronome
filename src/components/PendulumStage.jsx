import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'

const ARM_ANGLE = 32
const WEIGHT_SHADOW_REST = 'drop-shadow(0 0 4px rgba(225,89,47,0.5))'
const WEIGHT_SHADOW_FLASH = 'drop-shadow(0 0 9px rgba(225,89,47,0.9))'
const PIVOT = { x: 130, y: 128 }

// Which side a given beat index sits on. Beat 0 (the downbeat) is always left.
const sideFor = (beatIndex) => (beatIndex % 2 === 0 ? -1 : 1)

/**
 * Pendulum arm + beat dots.
 *
 * Built as one SVG with a viewBox, scaled purely by container width
 * (`w-full h-auto`) — every coordinate (pivot, arm, weight) lives in the
 * same 260x140 unit space, so it resizes cleanly at any breakpoint without
 * separate fixed-pixel layouts for mobile vs. desktop.
 *
 * Exposes an imperative handle (onBeat/prepareStart/reset) rather than
 * taking beatIndex as a prop, because the parent's scheduler drives beats
 * via setTimeout timed to the audio clock — routing that through React
 * state would add a render in the critical path and risk visible jitter.
 * Direct DOM writes keep the animation locked to audio time.
 */
const PendulumStage = forwardRef(function PendulumStage({ numerator, getBeatDuration }, ref) {
  const armGroupRef = useRef(null)
  const weightRef = useRef(null)
  const dotRefs = useRef([])
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const positionArmInstant = (beatIndex) => {
    const group = armGroupRef.current
    if (!group) return
    group.style.transitionDuration = '0s'
    group.style.transform = `rotate(${ARM_ANGLE * sideFor(beatIndex)}deg)`
    void group.getBoundingClientRect() // force reflow so the next transition doesn't merge with this snap
  }

  const highlightDot = (beatIndex) => {
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return
      // bg-line/border-line and bg-brass/bg-ember are same-specificity
      // single-class selectors — leaving both on an element lets source
      // order (not which was added last) decide the winner. So the resting
      // color classes must be explicitly removed, not just left in place.
      dot.classList.remove(
        'bg-line', 'border-line',
        'bg-brass', 'border-brass',
        'bg-ember', 'border-ember',
        'scale-110'
      )
      if (i !== beatIndex) {
        dot.classList.add('bg-line', 'border-line')
        return
      }
      dot.classList.add('scale-110')
      if (beatIndex === 0) dot.classList.add('bg-ember', 'border-ember')
      else dot.classList.add('bg-brass', 'border-brass')
    })
  }

  useImperativeHandle(
    ref,
    () => ({
      // Called once per beat, at the same moment that beat's click sounds.
      onBeat(beatIndex) {
        highlightDot(beatIndex)

        if (!reducedMotionRef.current && armGroupRef.current) {
          // Snap to this beat's side (should already be here from the
          // previous beat's animation), then animate toward the *next*
          // beat's side so the arm lands exactly when it clicks.
          positionArmInstant(beatIndex)
          const nextBeatIndex = (beatIndex + 1) % numerator
          armGroupRef.current.style.transitionDuration = `${getBeatDuration()}s`
          armGroupRef.current.style.transform = `rotate(${ARM_ANGLE * sideFor(nextBeatIndex)}deg)`
        }

        if (beatIndex === 0 && weightRef.current) {
          weightRef.current.style.filter = WEIGHT_SHADOW_FLASH
          setTimeout(() => {
            if (weightRef.current) weightRef.current.style.filter = WEIGHT_SHADOW_REST
          }, 90)
        }
      },
      // Pre-position the arm at the downbeat's side before the first click,
      // so it isn't caught mid-swing when playback starts.
      prepareStart() {
        positionArmInstant(0)
      },
      reset() {
        highlightDot(-1)
        if (armGroupRef.current) {
          armGroupRef.current.style.transitionDuration = '0s'
          armGroupRef.current.style.transform = 'rotate(0deg)'
        }
      },
    }),
    [numerator, getBeatDuration]
  )

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 mb-2 min-h-[10px]">
        {Array.from({ length: numerator }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (dotRefs.current[i] = el)}
            className="w-2 h-2 rounded-full bg-line border border-line transition-transform duration-75"
          />
        ))}
      </div>

      <svg
        viewBox="0 0 260 140"
        className="block w-full h-auto max-w-[260px] mx-auto"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E9CE95" />
            <stop offset="70%" stopColor="#C9A15B" />
          </linearGradient>
          <radialGradient id="pivotGrad" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#E9CE95" />
            <stop offset="60%" stopColor="#C9A15B" />
            <stop offset="100%" stopColor="#7c6335" />
          </radialGradient>
        </defs>

        <path
          d="M 40 128 A 90 90 0 0 1 220 128"
          fill="none"
          stroke="#3C2F23"
          strokeWidth="1.5"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />

        {/* Arm + weight rotate together as one group, pivoting at PIVOT */}
        <g
          ref={armGroupRef}
          className="transition-transform ease-in-out"
          style={{ transformOrigin: `${PIVOT.x}px ${PIVOT.y}px` }}
        >
          <rect
            x={PIVOT.x - 1.5}
            y={10}
            width={3}
            height={118}
            rx={1.5}
            fill="url(#armGrad)"
            style={{ filter: 'drop-shadow(0 0 5px rgba(201,161,91,0.25))' }}
          />
          <rect
            ref={weightRef}
            x={PIVOT.x - 6}
            y={4}
            width={12}
            height={12}
            rx={2}
            className="fill-ember"
            style={{ filter: WEIGHT_SHADOW_REST }}
          />
        </g>

        <circle cx={PIVOT.x} cy={PIVOT.y} r={7} fill="url(#pivotGrad)" />
      </svg>
    </div>
  )
})

export default PendulumStage
