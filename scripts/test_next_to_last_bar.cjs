const fs = require('fs');
const path = require('path');
const { Resvg } = require(path.resolve(__dirname, '../webapp/node_modules/@resvg/resvg-js'));

function createVariantA() {
  // Option A: Tablet + 4 full unobstructed bars, van placed at the lower-right next to the last bar (Bar 4)
  // Van is driving right, positioned next to Bar 4, while all 4 bars are 100% completely visible from base to top!
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-grad" x1="512" y1="0" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#123EB4"/>
      <stop offset="45%" stop-color="#0E2E91"/>
      <stop offset="100%" stop-color="#082068"/>
    </linearGradient>

    <linearGradient id="glass-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#BAE6FD"/>
      <stop offset="40%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#00BAF2"/>
    </linearGradient>

    <linearGradient id="rim-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>

    <filter id="shadow-van" x="500" y="520" width="460" height="340" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#030C28" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- 1. Squircle Background -->
  <rect x="28" y="28" width="968" height="968" rx="224" fill="url(#bg-grad)"/>
  <rect x="29" y="29" width="966" height="966" rx="223" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="2"/>

  <!-- 2. Tablet / Clipboard Outer Frame (Shifted slightly left so entire mark + van is harmoniously centered) -->
  <!-- Tablet: x=168, width=540, height=632 -->
  <rect x="168" y="196" width="540" height="632" rx="68" stroke="#FFFFFF" stroke-width="34" fill="none"/>

  <!-- Top Clip / Notch -->
  <path d="M 352 196 C 352 178 364 166 382 166 H 498 C 516 166 528 178 528 196 V 226 C 528 238 518 248 506 248 H 374 C 362 248 352 238 352 226 Z" fill="#FFFFFF"/>
  <rect x="390" y="192" width="100" height="14" rx="7" fill="#0E2E91"/>

  <!-- 3. Four Growth Bars - 100% UNTOUCHED, UNCOVERED, FULL HEIGHT -->
  <!-- Bar 1 (Short) -->
  <rect x="238" y="618" width="60" height="140" rx="16" fill="#FFFFFF"/>

  <!-- Bar 2 (Medium) -->
  <rect x="342" y="490" width="60" height="268" rx="16" fill="#FFFFFF"/>

  <!-- Bar 3 (Tallest Growth Peak) -->
  <rect x="446" y="344" width="60" height="414" rx="16" fill="#FFFFFF"/>

  <!-- Bar 4 (Signature Cyan Accent) -->
  <rect x="550" y="420" width="72" height="338" rx="16" fill="url(#cyan-grad)"/>

  <!-- 4. Delivery Van NEXT TO LAST BAR (To the right of Bar 4, emerging dynamically from tablet) -->
  <!-- Van starts next to Bar 4 at x=610, drives forward to x=910 -->
  <g filter="url(#shadow-van)">
    <!-- Road / Ground Shadow under Van -->
    <ellipse cx="760" cy="792" rx="160" ry="14" fill="#030C28" opacity="0.6"/>

    <!-- Speed Streaks behind van / next to last bar -->
    <rect x="586" y="654" width="36" height="7" rx="3.5" fill="#38BDF8" opacity="0.9"/>
    <rect x="570" y="674" width="52" height="7" rx="3.5" fill="#FFFFFF" opacity="0.8"/>
    <rect x="594" y="694" width="28" height="7" rx="3.5" fill="#38BDF8" opacity="0.7"/>

    <!-- Van Body: Crisp Pure White Silhouette -->
    <path d="
      M 620 758
      V 604
      C 620 586 632 576 650 576
      H 794
      C 806 576 816 584 824 594
      L 868 654
      L 902 672
      C 912 678 918 688 918 700
      V 758
      H 884
      C 884 726 858 700 826 700
      C 794 700 768 726 768 758
      H 736
      C 736 726 710 700 678 700
      C 646 700 620 726 620 758
      Z"
      fill="#FFFFFF"
    />

    <!-- Van Windshield Glass -->
    <path d="
      M 800 588
      L 858 656
      H 788
      V 588
      Z"
      fill="url(#glass-grad)"
    />

    <!-- Driver Side Window -->
    <path d="
      M 776 588
      H 726
      V 656
      H 776
      Z"
      fill="url(#glass-grad)"
    />

    <!-- Windshield Specular Reflection Highlight -->
    <line x1="810" y1="596" x2="848" y2="648" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity="0.85"/>

    <!-- Cabin Door Division Line -->
    <line x1="718" y1="582" x2="718" y2="752" stroke="#CBD5E1" stroke-width="3.5" stroke-linecap="round"/>

    <!-- Cyan Speed Stripe on Cargo Flank (Matching Bar 4) -->
    <path d="
      M 630 652
      H 710
      L 720 664
      L 710 676
      H 630
      Z"
      fill="url(#cyan-grad)"
    />

    <!-- Talliffy T Monogram on Van Cargo Panel -->
    <path d="
      M 662 602
      H 688
      V 610
      H 678
      V 638
      H 672
      V 610
      H 662
      Z"
      fill="#0E2E91"
    />

    <!-- Side Mirror -->
    <rect x="782" y="650" width="18" height="11" rx="5.5" fill="#0E2E91"/>

    <!-- Golden Front Headlight -->
    <path d="M 906 694 L 916 700 V 714 L 906 712 Z" fill="#FACC15"/>
    <polygon points="918,700 950,690 950,724 918,714" fill="#FEF08A" opacity="0.6"/>

    <!-- Red Taillight -->
    <rect x="620" y="620" width="7" height="36" rx="3.5" fill="#EF4444"/>

    <!-- Heavy-Duty Wheels -->
    <!-- Rear Wheel at (678, 758) -->
    <circle cx="678" cy="758" r="38" fill="#0A192F"/>
    <circle cx="678" cy="758" r="26" fill="url(#rim-grad)"/>
    <circle cx="678" cy="758" r="14" fill="#0E2E91"/>
    <circle cx="678" cy="758" r="5" fill="#38BDF8"/>

    <!-- Front Wheel at (826, 758) -->
    <circle cx="826" cy="758" r="38" fill="#0A192F"/>
    <circle cx="826" cy="758" r="26" fill="url(#rim-grad)"/>
    <circle cx="826" cy="758" r="14" fill="#0E2E91"/>
    <circle cx="826" cy="758" r="5" fill="#38BDF8"/>
  </g>
</svg>
`;
}

function createVariantB() {
  // Option B: Symmetrical Tablet, 4 bars inside, van positioned next to last bar (at the right side of the tablet, next to Bar 4)
  // Van sits right next to Bar 4 inside/along the right side of the tablet frame
  return `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-grad-b" x1="512" y1="0" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#123EB4"/>
      <stop offset="45%" stop-color="#0E2E91"/>
      <stop offset="100%" stop-color="#082068"/>
    </linearGradient>

    <linearGradient id="glass-grad-b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#BAE6FD"/>
      <stop offset="40%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <linearGradient id="cyan-grad-b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#00BAF2"/>
    </linearGradient>

    <linearGradient id="rim-grad-b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>

    <filter id="shadow-van-b" x="480" y="520" width="460" height="340" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#030C28" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- 1. Squircle Background -->
  <rect x="28" y="28" width="968" height="968" rx="224" fill="url(#bg-grad-b)"/>
  <rect x="29" y="29" width="966" height="966" rx="223" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="2"/>

  <!-- 2. Centered Tablet Outer Frame: x=212, width=600, height=632 -->
  <rect x="212" y="196" width="600" height="632" rx="68" stroke="#FFFFFF" stroke-width="34" fill="none"/>

  <!-- Top Clip / Notch -->
  <path d="M 444 196 C 444 178 456 166 474 166 H 550 C 568 166 580 178 580 196 V 226 C 580 238 570 248 558 248 H 466 C 454 248 444 238 444 226 Z" fill="#FFFFFF"/>
  <rect x="474" y="192" width="76" height="14" rx="7" fill="#0E2E91"/>

  <!-- 3. Four Growth Bars (Cleanly grouped on left-center, perfectly matching uploaded logo) -->
  <!-- Bar 1 (Short) -->
  <rect x="274" y="618" width="58" height="140" rx="16" fill="#FFFFFF"/>

  <!-- Bar 2 (Medium) -->
  <rect x="366" y="490" width="58" height="268" rx="16" fill="#FFFFFF"/>

  <!-- Bar 3 (Tallest Peak) -->
  <rect x="458" y="344" width="58" height="414" rx="16" fill="#FFFFFF"/>

  <!-- Bar 4 (Cyan Accent - The Last Bar) -->
  <rect x="550" y="420" width="68" height="338" rx="16" fill="url(#cyan-grad-b)"/>

  <!-- 4. Delivery Van NEXT TO LAST BAR (Sitting immediately to the right of Bar 4) -->
  <!-- Bar 4 ends at x=618. Van starts right next to it at x=636! -->
  <g filter="url(#shadow-van-b)">
    <!-- Road shadow under van -->
    <ellipse cx="760" cy="792" rx="140" ry="14" fill="#030C28" opacity="0.6"/>

    <!-- Van Body: Pure White -->
    <path d="
      M 636 758
      V 624
      C 636 606 648 596 664 596
      H 776
      C 788 596 798 604 804 614
      L 844 664
      L 876 680
      C 886 684 892 694 892 704
      V 758
      H 860
      C 860 728 836 704 806 704
      C 776 704 752 728 752 758
      H 724
      C 724 728 700 704 670 704
      C 640 704 616 728 616 758
      Z"
      fill="#FFFFFF"
    />

    <!-- Van Windshield Glass -->
    <path d="
      M 780 606
      L 834 666
      H 770
      V 606
      Z"
      fill="url(#glass-grad-b)"
    />

    <!-- Driver Side Window -->
    <path d="
      M 758 606
      H 718
      V 666
      H 758
      Z"
      fill="url(#glass-grad-b)"
    />

    <!-- Windshield Reflection -->
    <line x1="790" y1="614" x2="824" y2="658" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>

    <!-- Door Division Line -->
    <line x1="710" y1="602" x2="710" y2="752" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round"/>

    <!-- Cyan Speed Stripe on Cargo Flank -->
    <path d="
      M 646 662
      H 702
      L 712 672
      L 702 682
      H 646
      Z"
      fill="url(#cyan-grad-b)"
    />

    <!-- T Monogram on Van -->
    <path d="
      M 666 618
      H 688
      V 624
      H 680
      V 648
      H 674
      V 624
      H 666
      Z"
      fill="#0E2E91"
    />

    <!-- Side Mirror -->
    <rect x="764" y="660" width="16" height="10" rx="5" fill="#0E2E91"/>

    <!-- Headlight -->
    <path d="M 880 700 L 890 704 V 716 L 880 714 Z" fill="#FACC15"/>
    <polygon points="892,704 920,696 920,724 892,716" fill="#FEF08A" opacity="0.6"/>

    <!-- Taillight -->
    <rect x="636" y="638" width="6" height="30" rx="3" fill="#EF4444"/>

    <!-- Wheels -->
    <!-- Rear Wheel at (670, 758) -->
    <circle cx="670" cy="758" r="34" fill="#0A192F"/>
    <circle cx="670" cy="758" r="23" fill="url(#rim-grad-b)"/>
    <circle cx="670" cy="758" r="12" fill="#0E2E91"/>
    <circle cx="670" cy="758" r="4.5" fill="#38BDF8"/>

    <!-- Front Wheel at (806, 758) -->
    <circle cx="806" cy="758" r="34" fill="#0A192F"/>
    <circle cx="806" cy="758" r="23" fill="url(#rim-grad-b)"/>
    <circle cx="806" cy="758" r="12" fill="#0E2E91"/>
    <circle cx="806" cy="758" r="4.5" fill="#38BDF8"/>
  </g>
</svg>
`;
}

// Render both variants
const svgA = createVariantA();
const svgB = createVariantB();

const rA = new Resvg(svgA, { fitTo: { mode: 'width', value: 1024 } });
const rB = new Resvg(svgB, { fitTo: { mode: 'width', value: 1024 } });

fs.writeFileSync(path.resolve(__dirname, 'variant_A_next_to_last_bar.png'), rA.render().asPng());
fs.writeFileSync(path.resolve(__dirname, 'variant_B_next_to_last_bar.png'), rB.render().asPng());

console.log('Variants A and B successfully rendered!');
