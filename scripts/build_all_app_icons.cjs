const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Resvg } = require(path.resolve(__dirname, '../webapp/node_modules/@resvg/resvg-js'));

function getMasterSvg(isAdaptiveForeground = false) {
  const bgElement = isAdaptiveForeground ? '' : `
  <!-- 1. Deep Royal Blue Squircle Background -->
  <rect x="20" y="20" width="984" height="984" rx="220" fill="url(#bg-grad)"/>
  `;

  const transformWrapperStart = isAdaptiveForeground ? '<g transform="translate(102, 102) scale(0.8)">' : '<g>';
  const transformWrapperEnd = '</g>';

  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Deep Royal Blue Gradient -->
    <linearGradient id="bg-grad" x1="200" y1="0" x2="824" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A4EC8"/>
      <stop offset="60%" stop-color="#0E2E91"/>
      <stop offset="100%" stop-color="#091E6A"/>
    </linearGradient>

    <!-- Van Body Gradient -->
    <linearGradient id="van-body-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E8EEF8"/>
    </linearGradient>

    <!-- Cyan Window Gradient -->
    <linearGradient id="van-window-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7DD3FC"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>

    <!-- Cyan Bar Gradient (Bar 3) -->
    <linearGradient id="cyan-bar-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0EA5E9"/>
    </linearGradient>

    <!-- Van drop shadow -->
    <filter id="van-drop-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="4" dy="8" stdDeviation="6" flood-color="#000B2E" flood-opacity="0.5"/>
    </filter>
  </defs>

  ${bgElement}

  ${transformWrapperStart}

  <!-- ============================================================ -->
  <!-- 2. TABLET OUTER FRAME                                         -->
  <!-- Reduced height: top starts at y=220, height=620             -->
  <!-- ============================================================ -->
  <rect x="128" y="220" width="510" height="620" rx="80"
        stroke="#FFFFFF" stroke-width="38" fill="none"/>

  <!-- Top Notch / Clip -->
  <rect x="330" y="218" width="106" height="22" rx="11" fill="#FFFFFF"/>
  <!-- Notch inner dark slot -->
  <rect x="348" y="224" width="70" height="10" rx="5" fill="#0E2E91"/>

  <!-- ============================================================ -->
  <!-- 3. THREE GROWTH BARS inside tablet                           -->
  <!-- Bar 1 (short white), Bar 2 (tall white), Bar 3 (cyan)       -->
  <!-- ============================================================ -->

  <!-- Bar 1: Short, White (Leftmost) -->
  <rect x="195" y="620" width="60" height="164" rx="18" fill="#FFFFFF"/>

  <!-- Bar 2: Tallest, White (Center) -->
  <rect x="285" y="400" width="60" height="384" rx="18" fill="#FFFFFF"/>

  <!-- Bar 3: Medium, Cyan (Rightmost inside tablet) -->
  <rect x="375" y="460" width="60" height="324" rx="18" fill="url(#cyan-bar-grad)"/>

  <!-- ============================================================ -->
  <!-- 4. CARTOON DELIVERY VAN                                      -->
  <!-- Positioned at bottom-right overlapping the tablet border    -->
  <!-- ============================================================ -->

  <g filter="url(#van-drop-shadow)">
    <!-- === VAN BODY === -->
    <path d="
      M 560 760
      L 560 616
      C 560 600 572 590 588 590
      L 745 590
      C 758 590 770 598 778 612
      L 814 666
      L 848 678
      C 862 684 870 696 870 710
      L 870 760
      Z"
      fill="url(#van-body-grad)"
    />

    <!-- === CABIN DIVISION / DOOR LINE === -->
    <line x1="742" y1="596" x2="742" y2="754" stroke="#C8D8F0" stroke-width="3"/>

    <!-- === WINDSHIELD (angled front glass) === -->
    <path d="M 748 598 L 804 666 L 744 666 L 744 598 Z"
          fill="url(#van-window-grad)" opacity="0.9"/>

    <!-- Windshield specular highlight -->
    <line x1="758" y1="608" x2="790" y2="654" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.7"/>

    <!-- === SIDE WINDOW on cargo body === -->
    <rect x="596" y="618" width="92" height="66" rx="10" fill="url(#van-window-grad)" opacity="0.85"/>
    <!-- Window shine -->
    <line x1="602" y1="624" x2="612" y2="678" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.6"/>

    <!-- === VAN CARGO STRIPE (Cyan band along side) === -->
    <rect x="568" y="676" width="172" height="18" rx="4" fill="#38BDF8" opacity="0.9"/>

    <!-- === FRONT BUMPER === -->
    <rect x="858" y="728" width="20" height="24" rx="6" fill="#D0DCF0"/>

    <!-- === HEADLIGHT === -->
    <ellipse cx="872" cy="718" rx="8" ry="10" fill="#FDE68A"/>

    <!-- === REAR TAIL LIGHT === -->
    <rect x="558" y="664" width="8" height="30" rx="4" fill="#EF4444"/>

    <!-- === FRONT FENDER / HOOD === -->
    <path d="M 814 666 L 848 678 L 870 710 L 870 684 L 848 672 L 822 668 Z"
          fill="#E0EAF8"/>

    <!-- === SIDE MIRROR === -->
    <rect x="746" y="650" width="14" height="10" rx="4" fill="#B0C4E0"/>

    <!-- === WHEEL ARCH FENDERS === -->
    <path d="M 598 760 Q 598 710 650 710 Q 702 710 702 760 Z" fill="#E8EEF8"/>
    <path d="M 790 760 Q 790 710 838 710 Q 886 710 886 760 Z" fill="#E8EEF8"/>

    <!-- === WHEELS === -->
    <!-- Rear wheel -->
    <circle cx="650" cy="760" r="44" fill="#1E293B"/>
    <circle cx="650" cy="760" r="30" fill="#94A3B8"/>
    <circle cx="650" cy="760" r="18" fill="#334155"/>
    <circle cx="650" cy="760" r="8" fill="#CBD5E1"/>

    <!-- Front wheel -->
    <circle cx="838" cy="760" r="44" fill="#1E293B"/>
    <circle cx="838" cy="760" r="30" fill="#94A3B8"/>
    <circle cx="838" cy="760" r="18" fill="#334155"/>
    <circle cx="838" cy="760" r="8" fill="#CBD5E1"/>

    <!-- === T MONOGRAM on Van cargo panel === -->
    <text x="638" y="568" font-family="Arial" font-size="40" font-weight="bold"
          fill="#1E40AF" text-anchor="middle" dominant-baseline="middle"
          transform="translate(0,80)">T</text>
  </g>

  ${transformWrapperEnd}
</svg>
  `;
}

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width }
  });
  return resvg.render().asPng();
}

// 1. Ensure directories exist
const webappPublic = path.resolve(__dirname, '../webapp/public');
const mobileAssets = path.resolve(__dirname, '../mobile/assets');
if (!fs.existsSync(mobileAssets)) {
  fs.mkdirSync(mobileAssets, { recursive: true });
}

// 2. Generate Master SVG
const masterSvg = getMasterSvg(false);
const adaptiveSvg = getMasterSvg(true);

fs.writeFileSync(path.resolve(webappPublic, 'talliffy-logo.svg'), masterSvg);
fs.writeFileSync(path.resolve(mobileAssets, 'talliffy-logo.svg'), masterSvg);

// 3. Render Webapp Icons
console.log('Rendering Webapp Icons...');
fs.writeFileSync(path.resolve(webappPublic, 'icon-512x512.png'), renderPng(masterSvg, 512));
fs.writeFileSync(path.resolve(webappPublic, 'icon-192x192.png'), renderPng(masterSvg, 192));
fs.writeFileSync(path.resolve(webappPublic, 'apple-touch-icon.png'), renderPng(masterSvg, 180));
fs.writeFileSync(path.resolve(webappPublic, 'icon-32x32.png'), renderPng(masterSvg, 32));
fs.writeFileSync(path.resolve(webappPublic, 'icon-16x16.png'), renderPng(masterSvg, 16));

// 4. Render Mobile App Icons
console.log('Rendering Mobile App Icons...');
fs.writeFileSync(path.resolve(mobileAssets, 'icon.png'), renderPng(masterSvg, 1024));
fs.writeFileSync(path.resolve(mobileAssets, 'adaptive-icon.png'), renderPng(adaptiveSvg, 1024));
fs.writeFileSync(path.resolve(mobileAssets, 'favicon.png'), renderPng(masterSvg, 48));
fs.writeFileSync(path.resolve(mobileAssets, 'splash.png'), renderPng(masterSvg, 1024));

// 5. Generate favicon.ico
console.log('Generating multi-size favicon.ico...');
execSync(`python -c "
from PIL import Image
im = Image.open(r'${path.resolve(webappPublic, 'icon-512x512.png').replace(/\\/g, '/')}')
im.save(r'${path.resolve(webappPublic, 'favicon.ico').replace(/\\/g, '/')}', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print('favicon.ico generated.')
"`, { stdio: 'inherit' });

console.log('All app icons successfully rendered and deployed!');
