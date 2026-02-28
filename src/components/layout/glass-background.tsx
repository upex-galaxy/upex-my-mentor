/**
 * GlassBackground - Caustic/Refracted light effect
 *
 * Creates a light refraction effect like light passing through
 * textured glass - same light pattern for both light/dark modes,
 * only background color changes.
 */

export function GlassBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base background - changes with theme */}
      <div className="absolute inset-0 bg-background transition-colors duration-300" />

      {/* Caustic light effect - SAME for both modes */}
      <div className="absolute inset-0">
        {/* Main caustic light pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Turbulence for organic distortion */}
            <filter id="caustic-filter" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01 0.01"
                numOctaves="3"
                seed="5"
                result="noise"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.01 0.01;0.012 0.015;0.01 0.01"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="50"
                xChannelSelector="R"
                yChannelSelector="G"
              />
              <feGaussianBlur stdDeviation="20" />
            </filter>

            {/* Gradient for the light color */}
            <linearGradient id="light-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.4" />
              <stop offset="30%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
              <stop offset="60%" stopColor="rgb(192, 132, 252)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
            </linearGradient>

            <radialGradient id="light-radial-1" cx="30%" cy="20%" r="50%">
              <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="light-radial-2" cx="70%" cy="60%" r="50%">
              <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="light-radial-3" cx="20%" cy="80%" r="40%">
              <stop offset="0%" stopColor="rgb(192, 132, 252)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(192, 132, 252)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Light shapes with caustic filter */}
          <g filter="url(#caustic-filter)">
            <ellipse cx="25%" cy="15%" rx="400" ry="300" fill="url(#light-radial-1)">
              <animate
                attributeName="cx"
                values="25%;28%;25%"
                dur="15s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="15%;18%;15%"
                dur="12s"
                repeatCount="indefinite"
              />
            </ellipse>

            <ellipse cx="75%" cy="50%" rx="500" ry="400" fill="url(#light-radial-2)">
              <animate
                attributeName="cx"
                values="75%;72%;75%"
                dur="18s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values="50%;55%;50%"
                dur="14s"
                repeatCount="indefinite"
              />
            </ellipse>

            <ellipse cx="15%" cy="75%" rx="350" ry="250" fill="url(#light-radial-3)">
              <animate
                attributeName="cx"
                values="15%;20%;15%"
                dur="16s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        </svg>

        {/* Additional CSS-based light streaks */}
        <div
          className="absolute top-0 right-0 w-[800px] h-[600px] opacity-20 dark:opacity-15 blur-[40px] animate-caustic"
          style={{
            background: `
              radial-gradient(ellipse at 70% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 30% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
            `,
          }}
        />

        <div
          className="absolute bottom-0 left-0 w-[600px] h-[500px] opacity-15 dark:opacity-10 blur-[50px] animate-caustic-reverse"
          style={{
            background: `radial-gradient(ellipse at 20% 80%, rgba(192, 132, 252, 0.25) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Subtle grain texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
