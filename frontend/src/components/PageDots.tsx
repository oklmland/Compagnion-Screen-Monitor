import { useEffect, useState, RefObject } from 'react';

interface Props {
  total: number;
  scrollRef: RefObject<HTMLDivElement>;
  onGoTo: (index: number) => void;
}

export default function PageDots({ total, scrollRef, onGoTo }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const page = Math.round(el.scrollLeft / window.innerWidth);
      setActive(page);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [scrollRef]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 'clamp(10px, 2vmin, 20px)',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(6px, 1.2vmin, 12px)',
      zIndex: 50,
      pointerEvents: 'auto',
    }}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onGoTo(i)}
          aria-label={`Page ${i + 1}`}
          style={{
            width: i === active ? 'clamp(20px, 4vmin, 32px)' : 'clamp(7px, 1.4vmin, 11px)',
            height: 'clamp(7px, 1.4vmin, 11px)',
            borderRadius: '999px',
            background: i === active ? 'var(--blue)' : 'rgba(143,168,200,0.35)',
            border: 'none',
            padding: 0,
            transition: 'width 0.25s ease, background 0.25s ease',
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  );
}
