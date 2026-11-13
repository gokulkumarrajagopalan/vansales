const fs = require('fs');
const path = require('path');
const { Resvg } = require(path.resolve(__dirname, '../webapp/node_modules/@resvg/resvg-js'));

function createSvgVariant() {
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Royal Blue Gradient (matches user uploaded logo #0E2E91) -->
    <linearGradient id="bg-grad" x1="512" y1="0" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#123CAE"/>
      <stop offset="50%" stop-color="#0E2E91"/>
      <stop offset="100%" stop-color="#09206A"/>
    </linearGradient>

    <!-- Glass Windshield Gradient -->
    <linearGradient id="glass-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7DD3FC"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <!-- Cyan Accent (matches Bar 4) -->
    <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#00BAF2"/>
    </linearGradient>

    <!-- Drop Shadow for Van -->
    <filter id="van-shadow" x="180" y="520" width="680" height="320" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#030C28" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- 1. Deep Royal Blue Squircle Background -->
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#bg-grad)"/>

  <!-- 2. Tablet / Clipboard Outer Frame -->
  <!-- Rounded Rect Frame -->
  <rect x="232" y="196" width="560" height="628" rx="68" stroke="#FFFFFF" stroke-width="34" fill="none"/>

  <!-- Top Clip Notch on Tablet Frame -->
  <path d="M 420 196 C 420 180 432 168 448 168 H 576 C 592 168 604 180 604 196 V 224 C 604 236 594 246 582 246 H 442 C 430 246 420 236 420 224 Z" fill="#FFFFFF"/>
  <rect x="460" y="192" width="104" height="14" rx="7" fill="#0E2E91"/>

  <!-- 3. Four Growth Bars (Tally Accounting) -->
  <!-- Bar 1 (Leftmost, Shortest) -->
  <rect x="304" y="616" width="64" height="136" rx="16" fill="#FFFFFF"/>

  <!-- Bar 2 (Medium) -->
  <rect x="414" y="492" width="64" height="260" rx="16" fill="#FFFFFF"/>

  <!-- Bar 3 (Tallest Growth Peak) -->
  <rect x="524" y="348" width="64" height="404" rx="16" fill="#FFFFFF"/>

  <!-- Bar 4 (Cyan Accent) -->
  <rect x="634" y="424" width="76" height="328" rx="16" fill="url(#cyan-grad)"/>

  <!-- 4. Integrated Delivery Van in Foreground (Van Sales ERP) -->
  <g filter="url(#van-shadow)">
    <!-- Ground Shadow Under Van -->
    <ellipse cx="512" cy="746" rx="260" ry="18" fill="#040F33" opacity="0.6"/>

    <!-- Van Main Body (Pure White) -->
    <!-- Aerodynamic Commercial Delivery Van profile driving to the right -->
    <path d="
      M 264 712
      V 564
      C 264 544 276 532 296 532
      H 600
      C 612 532 624 538 632 548
      L 686 612
      L 736 632
      C 748 638 756 648 756 662
      V 712
      H 718
      C 718 676 690 648 654 648
      C 618 648 590 676 590 712
      H 432
      C 432 676 404 648 368 648
      C 332 648 304 676 304 712
      Z"
      fill="#FFFFFF"
    />

    <!-- Van Windshield & Front Side Glass -->
    <path d="
      M 606 546
      L 674 616
      H 590
      V 546
      Z"
      fill="url(#glass-grad)"
    />
    <!-- Driver Side Window -->
    <path d="
      M 580 546
      H 520
      V 616
      H 580
      Z"
      fill="url(#glass-grad)"
    />

    <!-- Van Cargo Flank Speed Stripe (Cyan #00BAF2 to match Bar 4) -->
    <path d="
      M 276 620
      H 504
      L 516 634
      L 504 648
      H 276
      Z"
      fill="url(#cyan-grad)"
    />

    <!-- Cabin Door Shutline -->
    <line x1="510" y1="538" x2="510" y2="706" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>

    <!-- Aerodynamic Side Mirror -->
    <rect x="584" y="612" width="22" height="12" rx="6" fill="#0E2E91"/>

    <!-- High-Luminosity Front Headlight -->
    <path d="M 742 654 L 754 660 V 676 L 742 674 Z" fill="#FACC15"/>
    <!-- Headlight Beam Glow Flare -->
    <polygon points="756,660 796,648 796,688 756,676" fill="#FEF08A" opacity="0.6"/>

    <!-- Rear Tail Light -->
    <rect x="264" y="584" width="8" height="42" rx="4" fill="#EF4444"/>

    <!-- 5. Van Wheels (Alloy Wheels with Detailed Hubs) -->
    <!-- Rear Wheel at center (368, 712) -->
    <circle cx="368" cy="712" r="42" fill="#0A192F"/>
    <circle cx="368" cy="712" r="28" fill="#E2E8F0"/>
    <circle cx="368" cy="712" r="16" fill="#0E2E91"/>
    <circle cx="368" cy="712" r="6" fill="#FFFFFF"/>

    <!-- Front Wheel at center (654, 712) -->
    <circle cx="654" cy="712" r="42" fill="#0A192F"/>
    <circle cx="654" cy="712" r="28" fill="#E2E8F0"/>
    <circle cx="654" cy="712" r="16" fill="#0E2E91"/>
    <circle cx="654" cy="712" r="6" fill="#FFFFFF"/>
  </g>
</svg>
`;
}

// Generate test SVG and test render
const svg = createSvgVariant();
fs.writeFileSync(path.resolve(__dirname, 'test_logo.svg'), svg);

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1024 }
});
const pngData = resvg.render();
fs.writeFileSync(path.resolve(__dirname, 'test_logo.png'), pngData.asPng());
console.log('Successfully re-generated test_logo.svg and test_logo.png');
