import React from 'react';

/**
 * Custom Premium Dealer Logo - SUPER CAR El Chami
 * Supports 'navy' (default) and 'white' (for dark background footers / impressum) variants.
 */
interface LogoProps {
  className?: string;
  variant?: 'navy' | 'white';
}

export default function Logo({ className = '', variant = 'navy' }: LogoProps) {
  const isWhite = variant === 'white';
  const mainColor = isWhite ? '#FFFFFF' : '#0a1d37';
  const scriptColor = isWhite ? '#0a1d37' : '#FFFFFF'; // ensure high contrast inside the wedge banner

  return (
    <div className={`inline-block select-none ${className}`} style={{ userSelect: 'none' }}>
      <svg
        viewBox="0 0 192 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* 'SUPER CAR' Text in bold italic high-end sport style */}
        <text
          x="4"
          y="28"
          fill={mainColor}
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '28px',
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
          }}
        >
          SUPER CAR
        </text>

        {/* Dynamic slanted custom banner/wedge underline (starts thin on left under S, ends under R) */}
        <polygon
          points="4,34 188,34 184,51 85,51 4,35"
          fill={mainColor}
        />

        {/* Hand-written cursive signature 'El Chami' embedded in the thick right portion of the banner */}
        <text
          x="136"
          y="46"
          fill={scriptColor}
          style={{
            fontFamily: '"Caveat", "Dancing Script", cursive',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.01em',
          }}
          textAnchor="middle"
        >
          El Chami
        </text>
      </svg>
    </div>
  );
}
