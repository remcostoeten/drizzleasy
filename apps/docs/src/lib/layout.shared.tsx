import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Drizzleasy Logo"
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id="dz" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <circle cx={12} cy={12} r={12} fill="url(#dz)" />
          </svg>
          <span
            style={{
              marginLeft: 8,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, #22d3ee, #a855f7)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Drizzleasy
          </span>
        </>
      ),
    },
    links: [],
  };
}
