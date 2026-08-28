export default function GymAnimatedBg({ variant = "login" }) {
  const isLogin = variant === "login"
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--charge-500)] via-[var(--charge-600)] to-[var(--ink-900)]" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 800 1200"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <pattern id={`gym-grid-${variant}`} width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
          </pattern>
          <radialGradient id={`glow-${variant}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`bar-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <rect width="800" height="1200" fill={`url(#gym-grid-${variant})`} />
        <ellipse cx="400" cy="420" rx="280" ry="220" fill={`url(#glow-${variant})`} />

        <g opacity="0.14">
          <g>
            <rect x="360" y="520" width="80" height="14" rx="7" fill="white" />
            <rect x="340" y="505" width="22" height="44" rx="6" fill="white" />
            <rect x="438" y="505" width="22" height="44" rx="6" fill="white" />
            <rect x="325" y="512" width="18" height="30" rx="4" fill="white" opacity="0.9" />
            <rect x="457" y="512" width="18" height="30" rx="4" fill="white" opacity="0.9" />
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -10; 0 0" dur="5s" repeatCount="indefinite" />
          </g>
        </g>

        <g opacity="0.10">
          <g>
            <circle cx="180" cy="220" r="22" fill="white" />
            <rect x="180" y="216" width="90" height="8" rx="4" fill="white" />
            <circle cx="270" cy="220" r="22" fill="white" />
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -12; 0 0" dur="6s" repeatCount="indefinite" />
          </g>
          <g>
            <circle cx="620" cy="280" r="18" fill="white" />
            <rect x="620" y="276" width="70" height="8" rx="4" fill="white" />
            <circle cx="690" cy="280" r="18" fill="white" />
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 8; 0 0" dur="7s" repeatCount="indefinite" />
          </g>
          <g>
            <circle cx="120" cy="720" r="16" fill="white" />
            <rect x="120" y="716" width="60" height="8" rx="4" fill="white" />
            <circle cx="180" cy="720" r="16" fill="white" />
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" dur="5.5s" repeatCount="indefinite" />
          </g>
          <g>
            <circle cx="680" cy="680" r="20" fill="white" />
            <rect x="680" y="676" width="80" height="8" rx="4" fill="white" />
            <circle cx="760" cy="680" r="20" fill="white" />
            <animateTransform attributeName="transform" type="translate" values="0 0; 0 10; 0 0" dur="6.5s" repeatCount="indefinite" />
          </g>
        </g>

        <g opacity="0.18" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <polyline points="80,860 160,860 190,800 220,920 250,860 340,860" strokeOpacity="0.9">
            <animate attributeName="stroke-dasharray" values="0 600;600 0" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.18;0.32;0.18" dur="2.5s" repeatCount="indefinite" />
          </polyline>
          <polyline points="460,880 540,880 570,830 600,930 630,880 720,880" strokeOpacity="0.9">
            <animate attributeName="stroke-dasharray" values="0 600;600 0" dur="3s" begin="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.18;0.32;0.18" dur="3s" begin="0.8s" repeatCount="indefinite" />
          </polyline>
        </g>

        <g opacity="0.12">
          <circle cx="90" cy="140" r="3" fill="white">
            <animate attributeName="opacity" values="0.12;0.28;0.12" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="720" cy="180" r="2.5" fill="white">
            <animate attributeName="opacity" values="0.12;0.28;0.12" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="650" cy="520" r="2" fill="white">
            <animate attributeName="opacity" values="0.12;0.28;0.12" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="500" r="2" fill="white">
            <animate attributeName="opacity" values="0.12;0.28;0.12" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="100" r="3.5" fill="white">
            <animate attributeName="cy" values="100;92;100" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.12;0.22;0.12" dur="4s" repeatCount="indefinite" />
          </circle>
        </g>

        {isLogin ? (
          <g opacity="0.09" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fill="white" textAnchor="middle">
            <text x="400" y="1050" fontSize="44" letterSpacing="2">
              CHARGE
              <animate attributeName="opacity" values="0.09;0.14;0.09" dur="4s" repeatCount="indefinite" />
            </text>
            <text x="400" y="1090" fontSize="14" letterSpacing="6" opacity="0.7">
              EST. 2026
            </text>
          </g>
        ) : (
          <g opacity="0.09" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fill="white" textAnchor="middle">
            <text x="400" y="1050" fontSize="44" letterSpacing="2">
              GROW
              <animate attributeName="opacity" values="0.09;0.14;0.09" dur="4s" repeatCount="indefinite" />
            </text>
            <text x="400" y="1090" fontSize="14" letterSpacing="6" opacity="0.7">
              STRONGER TOGETHER
            </text>
          </g>
        )}
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />
    </div>
  )
}
