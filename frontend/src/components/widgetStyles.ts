import React from 'react';

// Styles partagés par les widgets de la grille, en tailles adaptatives (vmin).
export const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0f1520, #111a28)',
  border: '1px solid var(--card-border)',
  borderRadius: 'var(--radius)',
  padding: 'clamp(8px, 1.8vmin, 22px) clamp(10px, 2.2vmin, 26px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 'clamp(5px, 1vmin, 12px)',
  minHeight: 0,
  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
};

// Température affichée dans le coin haut-gauche, à la taille du % d'usage.
export const tempTopStyle: React.CSSProperties = {
  fontSize: 'var(--fs-num)',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  flexShrink: 0,
};

export const labelStyle: React.CSSProperties = {
  fontSize: 'var(--fs-label)',
  color: 'var(--text-secondary)',
  marginBottom: '0.4vmin',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const bigStyle: React.CSSProperties = {
  fontSize: 'var(--fs-big)',
  fontWeight: 800,
  letterSpacing: '-0.5px',
  lineHeight: 1,
};

export const subStyle: React.CSSProperties = {
  fontSize: 'var(--fs-sub)',
  color: 'var(--text-secondary)',
};

// Couleur de température : vert/neutre -> orange -> rouge.
export function tempColor(c: number, warn = 70, hot = 85): string {
  return c > hot ? 'var(--red)' : c > warn ? 'var(--orange)' : 'var(--text-secondary)';
}
