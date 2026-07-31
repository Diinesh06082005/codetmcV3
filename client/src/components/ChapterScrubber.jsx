import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

const CARD_WIDTH = 260;
const GAP = 20;
// Tight, near-critically-damped spring: tracks the cursor with almost no lag
// and never overshoots — the wave feels attached to the pointer.
const POINTER_SPRING = { stiffness: 700, damping: 52, mass: 0.5 };
// Softer spring for the rise/settle so the wave swells and relaxes gracefully.
const STRENGTH_SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Raised-cosine bump: 1 at the crest, 0 beyond the radius, with zero slope at
// both ends so the wave has no seams — the source of the buttery falloff.
function bump(distance, radius) {
  if (distance >= radius) return 0;
  return 0.5 * (1 + Math.cos(Math.PI * (distance / radius)));
}

const Tick = React.memo(function Tick({
  index,
  pointer,
  strength,
  radius,
  restLength,
  peakLength,
  isCurrent,
}) {
  const width = useTransform(() => {
    const rise = strength.get() * bump(Math.abs(index - pointer.get()), radius);
    return restLength + rise * (peakLength - restLength);
  });
  const opacity = useTransform(() => {
    const rise = strength.get() * bump(Math.abs(index - pointer.get()), radius);
    const base = isCurrent ? 0.65 : 0.25;
    return base + rise * (1 - base);
  });
  const scaleY = useTransform(() => {
    const rise = strength.get() * bump(Math.abs(index - pointer.get()), radius);
    // Only a slight thickening at the crest (2px -> ~2.8px); the length change
    // carries the rise, thickness is a quiet secondary cue.
    return 1 + rise * 0.45;
  });

  return (
    <motion.span
      aria-hidden="true"
      style={{ width, opacity, scaleY }}
      className={cn(
        "block h-[2px] rounded-full transition-colors duration-200",
        isCurrent
          ? "bg-gradient-to-r from-cyan-400 to-violet-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          : "bg-cyan-200 hover:bg-cyan-400"
      )}
    />
  );
});

export function ChapterScrubber({
  chapters = [],
  side = "right",
  peakLength = 56,
  restLength = 14,
  rowHeight = 12,
  radius = 4,
  currentIndex = 0,
  onActiveChange,
  onSelect,
  label = "Chapters",
  className,
}) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = React.useRef(null);
  const listRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const buttonsRef = React.useRef([]);
  
  const baseId = React.useId();
  const optionId = (index) => `${baseId}-opt-${index}`;

  const rawPointer = useMotionValue(0);
  const rawStrength = useMotionValue(0);
  const springPointer = useSpring(rawPointer, POINTER_SPRING);
  const springStrength = useSpring(rawStrength, STRENGTH_SPRING);

  const pointer = prefersReducedMotion ? rawPointer : springPointer;
  const strength = prefersReducedMotion ? rawStrength : springStrength;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [engaged, setEngaged] = React.useState(false);
  const [flipped, setFlipped] = React.useState(false);
  const [cardHeight, setCardHeight] = React.useState(0);
  const hoveringRef = React.useRef(false);
  const focusedRef = React.useRef(null);
  const activeRef = React.useRef(0);

  const commitActive = React.useCallback((index) => {
    if (index !== activeRef.current) {
      activeRef.current = index;
      setActiveIndex(index);
    }
  }, []);

  const last = Math.max(0, chapters.length - 1);

  React.useEffect(() => {
    onActiveChange?.(
      engaged ? chapters[activeIndex] : null,
      engaged ? activeIndex : -1
    );
  }, [engaged, activeIndex, chapters, onActiveChange]);

  // Measure the card so its vertical travel can be clamped to the rail.
  React.useEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [activeIndex]);

  // Flip toward the roomier side if the card would spill past the viewport.
  React.useEffect(() => {
    if (!engaged) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = el.ownerDocument.defaultView?.innerWidth ?? 0;
    const need = CARD_WIDTH + GAP + 8;
    let useRight = side === "right";
    if (useRight && vw - rect.right < need && rect.left >= need)
      useRight = false;
    if (!useRight && rect.left < need && vw - rect.right >= need)
      useRight = true;
    setFlipped(useRight !== (side === "right"));
  }, [engaged, activeIndex, side]);

  const resolvedSide =
    side === "right"
      ? flipped
        ? "left"
        : "right"
      : flipped
        ? "right"
        : "left";

  const totalHeight = chapters.length * rowHeight;
  const rovingIndex = engaged ? activeIndex : (currentIndex ?? 0);

  const cardTop = useTransform(pointer, (p) => {
    const half = cardHeight / 2;
    const center = clamp(
      (p + 0.5) * rowHeight,
      half,
      Math.max(half, totalHeight - half)
    );
    return center - half;
  });
  const cardScale = useTransform(strength, [0, 1], [0.95, 1]);
  const cardX = useTransform(
    strength,
    [0, 1],
    [resolvedSide === "right" ? -8 : 8, 0]
  );

  const engageAt = (pointerRow, activeAt) => {
    rawPointer.set(pointerRow);
    rawStrength.set(1);
    commitActive(clamp(activeAt, 0, last));
    if (!engaged) setEngaged(true);
  };

  const handlePointerMove = (event) => {
    const el = listRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const row = (event.clientY - rect.top) / rowHeight - 0.5;
    hoveringRef.current = true;
    engageAt(clamp(row, -0.5, last + 0.5), Math.round(row));
  };

  const handlePointerLeave = () => {
    hoveringRef.current = false;
    if (focusedRef.current != null) {
      rawPointer.set(focusedRef.current);
    } else {
      rawStrength.set(0);
      setEngaged(false);
    }
  };

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      focusedRef.current = null;
      if (!hoveringRef.current) {
        rawStrength.set(0);
        setEngaged(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    let next = focusedRef.current ?? activeRef.current;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = Math.min(last, next + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = Math.max(0, next - 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    buttonsRef.current[next]?.focus();
  };

  return (
    <div
      ref={containerRef}
      style={{ width: peakLength }}
      className={cn("relative z-20 select-none", className)}
    >
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        aria-orientation="vertical"
        aria-activedescendant={engaged ? optionId(activeIndex) : undefined}
        className="flex w-full flex-col cursor-pointer py-1"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        {chapters.map((chapter, index) => {
          const isCurrent = index === currentIndex;
          const descText =
            typeof chapter.description === "string"
              ? `. ${chapter.description}`
              : "";
          return (
            <button
              ref={(el) => {
                buttonsRef.current[index] = el;
              }}
              key={chapter.id}
              id={optionId(index)}
              type="button"
              role="option"
              aria-selected={isCurrent}
              aria-label={`${chapter.title}${descText}`}
              tabIndex={index === rovingIndex ? 0 : -1}
              onFocus={() => {
                focusedRef.current = index;
                engageAt(index, index);
              }}
              onClick={() => onSelect?.(chapter, index)}
              style={{ height: rowHeight }}
              className={cn(
                "flex w-full items-center rounded-sm outline-none transition-opacity",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                resolvedSide === "left" ? "justify-end" : "justify-start"
              )}
            >
              <Tick
                index={index}
                pointer={pointer}
                strength={strength}
                radius={radius}
                restLength={restLength}
                peakLength={peakLength}
                isCurrent={isCurrent}
              />
            </button>
          );
        })}
      </div>

      {chapters[activeIndex] ? (
        <motion.div
          ref={cardRef}
          aria-hidden="true"
          style={{
            top: cardTop,
            x: cardX,
            scale: cardScale,
            opacity: strength,
            ...(resolvedSide === "right"
              ? { left: peakLength + GAP }
              : { right: peakLength + GAP }),
          }}
          className={cn(
            "pointer-events-none absolute z-30 w-[270px] rounded-2xl border border-cyan-500/30 bg-slate-950/95 px-4 py-3.5 text-white backdrop-blur-xl",
            "shadow-[0_10px_35px_rgba(6,182,212,0.25)]",
            resolvedSide === "right" ? "origin-left" : "origin-right"
          )}
        >
          {chapters[activeIndex].meta ? (
            <div className="mb-1 text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              {chapters[activeIndex].meta}
            </div>
          ) : null}
          <div className="truncate text-sm font-extrabold leading-snug text-white tracking-tight">
            {chapters[activeIndex].title}
          </div>
          {chapters[activeIndex].description ? (
            <div className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-300">
              {chapters[activeIndex].description}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}

export default ChapterScrubber;
