const fs = require('fs');
const path = require('path');
const { Resvg } = require(path.resolve(__dirname, '../webapp/node_modules/@resvg/resvg-js'));

function createGoldenMaster() {
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Royal Blue Gradient (matches user uploaded logo #0E2E91) -->
    <linearGradient id="bg-grad" x1="512" y1="0" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#123EB4"/>
      <stop offset="45%" stop-color="#0E2E91"/>
      <stop offset="100%" stop-color="#082068"/>
    </linearGradient>

    <!-- Glass Windshield Gradient -->
    <linearGradient id="glass-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#BAE6FD"/>
      <stop offset="40%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <!-- Cyan Accent (matches Bar 4 in uploaded logo) -->
    <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#00BAF2"/>
    </linearGradient>

    <!-- Chrome / Rim Gradient -->
    <linearGradient id="rim-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>

    <!-- Deep Drop Shadow for Van Depth -->
    <filter id="shadow-van" x="480" y="520" width="410" height="340" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#030C28" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- 1. Squircle Background -->
  <rect x="28" y="28" width="968" height="968" rx="224" fill="url(#bg-grad)"/>
  <rect x="29" y="29" width="966" height="966" rx="223" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="2"/>

  <!-- 2. Tablet / Clipboard Outer Frame (Width=480, Height=632, from x=160 to x=640) -->
  <rect x="160" y="196" width="480" height="632" rx="68" stroke="#FFFFFF" stroke-width="34" fill="none"/>

  <!-- Top Clip / Notch on Tablet Frame -->
  <path d="M 334 196 C 334 178 346 166 364 166 H 436 C 454 166 466 178 466 196 V 226 C 466 238 456 248 444 248 H 356 C 344 248 334 238 334 226 Z" fill="#FFFFFF"/>
  <rect x="362" y="192" width="76" height="14" rx="7" fill="#0E2E91"/>

  <!-- 3. Four Growth Bars - 100% UNOBSTRUCTED, FULL HEIGHT FROM TOP TO BASE -->
  <!-- Bar 1 (Leftmost, Shortest) -->
  <rect x="220" y="618" width="56" height="140" rx="16" fill="#FFFFFF"/>

  <!-- Bar 2 (Medium) -->
  <rect x="306" y="490" width="56" height="268" rx="16" fill="#FFFFFF"/>

  <!-- Bar 3 (Tallest Growth Peak - Tally Performance) -->
  <rect x="392" y="344" width="56" height="414" rx="16" fill="#FFFFFF"/>

  <!-- Bar 4 (The Last Bar - Signature Cyan Accent) -->
  <rect x="478" y="420" width="66" height="338" rx="16" fill="url(#cyan-grad)"/>

  <!-- 4. Delivery Van NEXT TO LAST BAR (Sitting adjacent to Bar 4 from x=556 to x=844) -->
  <g filter="url(#shadow-van)">
    <!-- Ground / Road Shadow Under Van -->
    <ellipse cx="700" cy="792" rx="150" ry="14" fill="#030C28" opacity="0.6"/>

    <!-- Speed Streaks behind van (next to the last bar) -->
    <rect x="532" y="660" width="30" height="7" rx="3.5" fill="#38BDF8" opacity="0.9"/>
    <rect x="520" y="680" width="42" height="7" rx="3.5" fill="#FFFFFF" opacity="0.8"/>
    <rect x="538" y="700" width="24" height="7" rx="3.5" fill="#38BDF8" opacity="0.7"/>

    <!-- Van Body: Smooth, Bold Aerodynamic Silhouette -->
    <!-- Starts at rear x=564, roof y=586, front windshield slope down, bumper at x=844 -->
    <path d="
      M 564 758
      V 614
      C 564 596 576 586 594 586
      H 732
      C 744 586 754 594 762 604
      L 802 654
      L 832 670
      C 842 676 848 686 848 698
      V 758
      H 816
      C 816 728 792 704 762 704
      C 732 704 708 728 708 758
      H 676
      C 676 728 652 704 622 704
      C 592 704 568 728 568 758
      Z"
      fill="#FFFFFF"
    />

    <!-- Van Windshield Glass -->
    <path d="
      M 738 596
      L 792 656
      H 728
      V 596
      Z"
      fill="url(#glass-grad)"
    />

    <!-- Driver Side Window -->
    <path d="
      M 716 596
      H 670
      V 656
      H 716
      Z"
      fill="url(#glass-grad)"
    />

    <!-- Windshield Reflection -->
    <line x1="748" y1="604" x2="782" y2="648" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>

    <!-- Cabin Door Division Line -->
    <line x1="662" y1="592" x2="662" y2="752" stroke="#CBD5E1" stroke-width="3.5" stroke-linecap="round"/>

    <!-- Cyan Speed Stripe on Cargo Flank (matching Bar 4) -->
    <path d="
      M 574 654
      H 654
      L 664 664
      L 654 674
      H 574
      Z"
      fill="url(#cyan-grad)"
    />

    <!-- T Monogram on Van Cargo Panel -->
    <path d="
      M 606 610
      H 628
      V 616
      H 620
      V 640
      H 614
      V 616
      H 606
      Z"
      fill="#0E2E91"
    />

    <!-- Side Mirror -->
    <rect x="722" y="650" width="16" height="10" rx="5" fill="#0E2E91"/>

    <!-- Golden Front Headlight -->
    <path d="M 836 692 L 846 698 V 712 L 836 710 Z" fill="#FACC15"/>
    <!-- Headlight Beam Glow Flare -->
    <polygon points="848,698 876,690 876,718 848,710" fill="#FEF08A" opacity="0.6"/>

    <!-- Taillight -->
    <rect x="564" y="628" width="6" height="32" rx="3" fill="#EF4444"/>

    <!-- Heavy-Duty Wheels -->
    <!-- Rear Wheel at (622, 758) -->
    <circle cx="622" cy="758" r="34" fill="#0A192F"/>
    <circle cx="622" cy="758" r="23" fill="url(#rim-grad)"/>
    <circle cx="622" cy="758" r="12" fill="#0E2E91"/>
    <circle cx="622" cy="758" r="4.5" fill="#38BDF8"/>

    <!-- Front Wheel at (762, 758) -->
    <circle cx="762" cy="758" r="34" fill="#0A192F"/>
    <circle cx="762" cy="758" r="23" fill="url(#rim-grad)"/>
    <circle cx="762" cy="758" r="12" fill="#0E2E91"/>
    <circle cx="762" cy="758" r="4.5" fill="#38BDF8"/>
  </g>
</svg>
`;
}

const master = createGoldenMaster();
const r = new Resvg(master, { fitTo: { mode: 'width', value: 1024 } });
fs.writeFileSync(path.resolve(__dirname, 'golden_master_next_to_bar.png'), r.render().asPng());
fs.writeFileSync(path.resolve(__dirname, 'golden_master_next_to_bar.svg'), master);
console.log('Golden master generated!');
