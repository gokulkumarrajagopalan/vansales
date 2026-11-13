import React from 'react';

const SIZES = {
  xs: 'w-7 h-7',
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
  xl: 'w-16 h-16',
};

interface LogoMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeCls = SIZES[size] || SIZES.md;

  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-visible select-none ${sizeCls} ${className}`}
      title="Talliffy Van Sales & Distribution ERP"
    >
      <svg
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Deep Royal Blue Gradient */}
          <linearGradient id="talliffy-bg-grad" x1="200" y1="0" x2="824" y2="1024" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1A4EC8" />
            <stop offset="60%" stopColor="#0E2E91" />
            <stop offset="100%" stopColor="#091E6A" />
          </linearGradient>

          {/* Van Body Gradient */}
          <linearGradient id="talliffy-van-body-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8EEF8" />
          </linearGradient>

          {/* Cyan Window Gradient */}
          <linearGradient id="talliffy-window-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Cyan Bar Gradient (Bar 3) */}
          <linearGradient id="talliffy-cyan-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>

          {/* Van Drop Shadow */}
          <filter id="talliffy-van-shadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#000B2E" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 1. Deep Royal Blue Squircle Background */}
        <rect x="20" y="20" width="984" height="984" rx="220" fill="url(#talliffy-bg-grad)" />

        {/* 2. Tablet Outer Frame — shorter height, starts at y=220 */}
        <rect x="128" y="220" width="510" height="620" rx="80"
              stroke="#FFFFFF" strokeWidth="38" fill="none" />

        {/* Top Notch */}
        <rect x="330" y="218" width="106" height="22" rx="11" fill="#FFFFFF" />
        <rect x="348" y="224" width="70" height="10" rx="5" fill="#0E2E91" />

        {/* 3. Three Growth Bars */}
        {/* Bar 1: Short, White (Leftmost) */}
        <rect x="195" y="620" width="60" height="164" rx="18" fill="#FFFFFF" />
        {/* Bar 2: Tallest, White */}
        <rect x="285" y="400" width="60" height="384" rx="18" fill="#FFFFFF" />
        {/* Bar 3: Medium, Cyan */}
        <rect x="375" y="460" width="60" height="324" rx="18" fill="url(#talliffy-cyan-bar)" />

        {/* 4. Cartoon Delivery Van — bottom-right overlapping tablet border */}
        <g filter="url(#talliffy-van-shadow)">
          {/* Van Body */}
          <path
            d="M 560 760 L 560 616 C 560 600 572 590 588 590 L 745 590 C 758 590 770 598 778 612 L 814 666 L 848 678 C 862 684 870 696 870 710 L 870 760 Z"
            fill="url(#talliffy-van-body-grad)"
          />

          {/* Cabin Division */}
          <line x1="742" y1="596" x2="742" y2="754" stroke="#C8D8F0" strokeWidth="3" />

          {/* Windshield */}
          <path d="M 748 598 L 804 666 L 744 666 L 744 598 Z"
                fill="url(#talliffy-window-grad)" opacity={0.9} />
          <line x1="758" y1="608" x2="790" y2="654" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity={0.7} />

          {/* Side Window on cargo */}
          <rect x="596" y="618" width="92" height="66" rx="10" fill="url(#talliffy-window-grad)" opacity={0.85} />
          <line x1="602" y1="624" x2="612" y2="678" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity={0.6} />

          {/* Cyan cargo stripe */}
          <rect x="568" y="676" width="172" height="18" rx="4" fill="#38BDF8" opacity={0.9} />

          {/* Front bumper */}
          <rect x="858" y="728" width="20" height="24" rx="6" fill="#D0DCF0" />

          {/* Headlight */}
          <ellipse cx="872" cy="718" rx="8" ry="10" fill="#FDE68A" />

          {/* Rear tail light */}
          <rect x="558" y="664" width="8" height="30" rx="4" fill="#EF4444" />

          {/* Front fender / hood */}
          <path d="M 814 666 L 848 678 L 870 710 L 870 684 L 848 672 L 822 668 Z" fill="#E0EAF8" />

          {/* Side mirror */}
          <rect x="746" y="650" width="14" height="10" rx="4" fill="#B0C4E0" />

          {/* Wheel fenders */}
          <path d="M 598 760 Q 598 710 650 710 Q 702 710 702 760 Z" fill="#E8EEF8" />
          <path d="M 790 760 Q 790 710 838 710 Q 886 710 886 760 Z" fill="#E8EEF8" />

          {/* Rear wheel */}
          <circle cx="650" cy="760" r="44" fill="#1E293B" />
          <circle cx="650" cy="760" r="30" fill="#94A3B8" />
          <circle cx="650" cy="760" r="18" fill="#334155" />
          <circle cx="650" cy="760" r="8" fill="#CBD5E1" />

          {/* Front wheel */}
          <circle cx="838" cy="760" r="44" fill="#1E293B" />
          <circle cx="838" cy="760" r="30" fill="#94A3B8" />
          <circle cx="838" cy="760" r="18" fill="#334155" />
          <circle cx="838" cy="760" r="8" fill="#CBD5E1" />
        </g>
      </svg>
    </span>
  );
};

export default LogoMark;
