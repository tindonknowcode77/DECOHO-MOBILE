import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { colors, fontFamilies, Icon } from "./ui";
import { money, priceOf, type Product } from "../lib/types";

export interface PendantLamp {
  id: string;
  productId: string;
  name: string;
  tag: string;
  drop: number;
  glow?: string;
  description: string;
  details: string[];
  productImage: string;
  productLink: string;
  image: string;
  imageOn: string;
}

/* 1. ĐÈN ĐÁM MÂY KHI TẮT (Exact SVG from Web) */
export const CLOUD_OFF_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <defs>
    <filter id="cloudSoftness" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise"/>
      <feDisplacementMap in="blur" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="cordGrad" x1="196" y1="0" x2="204" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="38%" stop-color="#5c5c5c"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
    <radialGradient id="cloudPuff" cx="45%" cy="38%" r="58%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="62%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
  </defs>
  <rect x="196" y="0" width="8" height="205" fill="url(#cordGrad)" />
  <g filter="url(#cloudSoftness)">
    <ellipse cx="200" cy="340" rx="135" ry="56" fill="#94a3b8" opacity="0.38"/>
    <ellipse cx="120" cy="328" rx="82" ry="48" fill="#94a3b8" opacity="0.32"/>
    <ellipse cx="280" cy="328" rx="84" ry="48" fill="#94a3b8" opacity="0.32"/>
    <circle cx="118" cy="302" r="76" fill="url(#cloudPuff)"/>
    <circle cx="282" cy="302" r="76" fill="url(#cloudPuff)"/>
    <circle cx="158" cy="260" r="72" fill="url(#cloudPuff)"/>
    <circle cx="242" cy="260" r="72" fill="url(#cloudPuff)"/>
    <circle cx="200" cy="240" r="64" fill="url(#cloudPuff)"/>
    <ellipse cx="200" cy="312" rx="142" ry="66" fill="url(#cloudPuff)"/>
  </g>
</svg>
`)}`;

/* 2. ĐÈN ĐÁM MÂY KHI BẬT SÁNG (Exact SVG from Web) */
export const CLOUD_ON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <defs>
    <filter id="cloudSoftnessOn" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise"/>
      <feDisplacementMap in="blur" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="cordGradOn" x1="196" y1="0" x2="204" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="38%" stop-color="#5c5c5c"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
    <radialGradient id="cloudWarmPuff" cx="50%" cy="48%" r="58%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </radialGradient>
    <radialGradient id="lightCore" cx="50%" cy="55%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="30%" stop-color="#fff8db" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="#ffd573" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2"/>
    </radialGradient>
    <filter id="bloomGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
    </filter>
  </defs>
  <rect x="196" y="0" width="8" height="205" fill="url(#cordGradOn)" />
  <g filter="url(#cloudSoftnessOn)">
    <ellipse cx="200" cy="340" rx="135" ry="56" fill="#f59e0b" opacity="0.38"/>
    <ellipse cx="120" cy="328" rx="82" ry="48" fill="#f59e0b" opacity="0.32"/>
    <ellipse cx="280" cy="328" rx="84" ry="48" fill="#f59e0b" opacity="0.32"/>
    <circle cx="118" cy="302" r="76" fill="url(#cloudWarmPuff)"/>
    <circle cx="282" cy="302" r="76" fill="url(#cloudWarmPuff)"/>
    <circle cx="158" cy="260" r="72" fill="url(#cloudWarmPuff)"/>
    <circle cx="242" cy="260" r="72" fill="url(#cloudWarmPuff)"/>
    <circle cx="200" cy="240" r="64" fill="url(#cloudWarmPuff)"/>
    <ellipse cx="200" cy="312" rx="142" ry="66" fill="url(#cloudWarmPuff)"/>
  </g>
  <g filter="url(#bloomGlow)">
    <circle cx="200" cy="295" r="105" fill="url(#lightCore)"/>
    <ellipse cx="200" cy="312" rx="150" ry="80" fill="url(#lightCore)"/>
    <circle cx="135" cy="302" r="82" fill="url(#lightCore)"/>
    <circle cx="265" cy="302" r="82" fill="url(#lightCore)"/>
  </g>
</svg>
`)}`;

export const LAMP_DEMO_ITEMS: PendantLamp[] = [
  {
    id: "dome-enamel",
    productId: "6ae33590f9df260a0b6cfb65",
    name: "Đèn Thả Trần Bàn Ăn Bauhaus",
    tag: "685.420 ₫",
    drop: 0.62,
    description:
      "Đèn thả trần phong cách Bauhaus tối giản, tạo điểm nhấn ấm cúng cho bàn ăn & phòng khách.",
    details: [
      "Danh mục: Đèn thả trần",
      "Ánh sáng ấm dịu",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1793275239/decoho/products/ougldq7lrvx7fk8d9wn0.webp",
    productLink: "https://s.shopee.vn/6VOtBHsYbE",
    image:
      "https://cdn.21st.dev/assets/mirror/fc/fcfdfbf3d62f14d97eb23453aa9fe6772f7c09b521226442621e4f187d79b4d6.webp",
    imageOn:
      "https://cdn.21st.dev/assets/mirror/2d/2d2990c7f5d56e69848237695a204baf6a366d180facb94c62b78cdc3e37dd13.webp",
  },
  {
    id: "cloud-pendant",
    productId: "6ad983abb0c4d04dfb65f9f9",
    name: "Đèn Mây Treo",
    tag: "210.000 ₫",
    drop: 0.85,
    glow: "#ffecb3",
    description:
      "Đèn thả trần hình đám mây bông bồng bềnh, tạo ánh sáng khuếch tán dịu nhẹ và ấm áp như hoàng hôn trong phòng.",
    details: [
      "Danh mục: Đèn trần",
      "Chất liệu bông tơ polymer tán sáng",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1792639905/decoho/products/gqr1j3ownrpfi4hhwao7.webp",
    productLink: "https://s.shopee.vn/5q98YM4rnF",
    image: CLOUD_OFF_SVG,
    imageOn: CLOUD_ON_SVG,
  },
  {
    id: "glass-globe",
    productId: "6ae3304df9df260a0b6cfada",
    name: "Đèn trần cổ điển",
    tag: "863.000 ₫",
    drop: 0.9,
    description:
      "Đèn trần phong cách cổ điển sang trọng, ánh sáng vàng ấm tôn lên đường nét nội thất.",
    details: [
      "Danh mục: Đèn trần",
      "Thủy tinh & kim loại",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1793273898/decoho/products/dwglcdh098anxy2asljx.webp",
    productLink: "https://s.shopee.vn/3VlHbm3ygR",
    image:
      "https://cdn.21st.dev/assets/mirror/ba/ba2f12a44156865baeb4c1173a7d320384edc5156dcaf1d4e44e684ae780ba57.webp",
    imageOn:
      "https://cdn.21st.dev/assets/mirror/a5/a55502eb9cf6cac0bd52969eb61bb546a478e861f3568aad6875e4dad5c03f6e.webp",
  },
  {
    id: "cone-brass",
    productId: "6ad97ca4b0c4d04dfb65f7ac",
    name: "Đèn Deco Đám Mây",
    tag: "142.000 ₫",
    drop: 0.74,
    description:
      "Đèn treo thả trần kiểu dáng tinh tế, gom vùng sáng ấm áp cho góc đọc sách và bàn trà.",
    details: [
      "Danh mục: Đèn decor",
      "Ánh sáng ấm áp",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1792638111/decoho/products/czy7csyrsdtzi2c3mmfp.webp",
    productLink: "https://s.shopee.vn/6q1fi5En8u",
    image:
      "https://cdn.21st.dev/assets/mirror/96/968b92c5f3adc4a3f45d627f339fa2c4017a70a0d57f7c68b8a0c5b4ace6aef3.webp",
    imageOn:
      "https://cdn.21st.dev/assets/mirror/cc/cc2aa1c7f32e04bc950f63274f28986c573a8ad2c27f84eef148191a1178d424.webp",
  },
  {
    id: "rattan-weave",
    productId: "6adaca4d0d8c75708ef6758b",
    name: "Đèn Nấm",
    tag: "200.000 ₫",
    drop: 1,
    description:
      "Đèn mây tre đan thủ công tự nhiên, tạo hiệu ứng ánh sáng đan xen mộc mạc, ấm cúng.",
    details: [
      "Danh mục: Đèn thả trần",
      "Chất liệu mây tre đan",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1792723530/decoho/products/eopuyehfxngvevan8ybf.webp",
    productLink: "https://s.shopee.vn/6AltDyOzhl",
    image:
      "https://cdn.21st.dev/assets/mirror/12/1237597f711ee8334bad09432954cf04fe8cc104877dece6d0986441e59030a9.webp",
    imageOn:
      "https://cdn.21st.dev/assets/mirror/39/394b02f1dff0096ebace53699c42c4d817dfffd5aff943d888454a83036ce1fb.webp",
  },
  {
    id: "paper-lantern",
    productId: "6adb6a48a448fd9321cf428d",
    name: "Đèn treo thả trần phong cách cổ điển",
    tag: "249.000 ₫",
    drop: 0.68,
    description:
      "Đèn lồng giấy washi tròn phong cách cổ điển, tán sáng vàng ấm dịu nhẹ bảo vệ mắt cho phòng ngủ & bàn trà.",
    details: [
      "Danh mục: Đèn treo thả trần",
      "Chao giấy tròn cổ điển",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1792764462/decoho/products/wkh7trbzipxxpwdnoto0.webp",
    productLink: "https://s.shopee.vn/3g4YFNYVm2",
    image:
      "https://cdn.21st.dev/assets/mirror/dd/dd85e367f381884fa9147495c1025af4faed8a2f7ec1bc3cd82bbdc9a3c2815b.webp",
    imageOn:
      "https://cdn.21st.dev/assets/mirror/a9/a9e6b40b11b3abca1a39acd32489b66f6094f3ecb5361862c16a1d36599ad60c.webp",
  },
  {
    id: "concrete-cone",
    productId: "6adb6694a448fd9321cf41b3",
    name: "Đèn Nấm - Đèn thả trần tre tròn 2 lớp",
    tag: "300.000 ₫",
    drop: 0.86,
    description:
      "Đèn thả trần hiện đại, phom chao rộng giúp phân bổ ánh sáng êm dịu.",
    details: [
      "Danh mục: Đèn thả trần",
      "Thiết kế tối giản",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1792763531/decoho/products/ykk3a0ap12uedjr4i3jo.webp",
    productLink: "https://s.shopee.vn/50ZvppTR4A",
    image:
      "https://cdn.21st.dev/assets/mirror/a8/a89caec23d33213a849f40b76789ead7c88f0c2d91eb7e91e60987c72e566032.webp",
    imageOn:
      "https://cdn.21st.dev/assets/mirror/b1/b17f53b4eb8ff9d544bc2ce66802e46c7134d760cd225f9059aec2f7799ffbb7.webp",
  },
  {
    id: "copper-bell",
    productId: "6ae853fa9b2181304066c2a9",
    name: "Đèn Cây Đứng Hình Nấm",
    tag: "440.000 ₫",
    drop: 0.8,
    description:
      "Đèn decor chao vòm hình nấm sang trọng, mang lại bầu không khí ấm áp cho góc sofa.",
    details: [
      "Danh mục: Đèn decor",
      "Chao vòm phản quang",
      "Có sẵn trên DECOHO & Shopee",
    ],
    productImage:
      "https://res.cloudinary.com/djzzwjznn/image/upload/v1793610743/decoho/products/hqdq0rbavm5jpoesesig.webp",
    productLink: "https://s.shopee.vn/9V2inio8nJ",
    image:
      "https://cdn.21st.dev/assets/mirror/3d/3d6d7c813c8d408fff25a92204f49cfcfa3cdf445e27b21b350c666177380c47.webp",
    imageOn:
      "https://cdn.21st.dev/assets/mirror/bf/bf643df2bd7d8eb4af9aeeffa53c5ff6dca49f702b88bde2a584697ca82aa862.webp",
  },
];

/* Exact constants & physics from decoho-fe/src/components/ui/pendant-lamp-rail.tsx */
const ASPECT = 2 / 3;
const MAX_H = 230;
const MIN_WIDE_H = 78;
const CAROUSEL_H = 224;
const FIT = 1.1;
const SPREAD = 1.65;
const SHADE = 0.88;
const CORD = 0.7;
const CORD_W = 0.02;
const SHADE_TOP = 0.32;
const MOUTH = 0.74;
const REACH = 0.55;
const METRES = 0.5;
const GRAVITY = 9.8;
const DAMPING = 2;
const COUPLING = 0.15;
const MAX_SWING = 14;
const AMBIENT = 0.12;
const FADE = 0.1;
const SWAY = 26;
const NUDGE = 14;
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

const METAL_X =
  "linear-gradient(to right, #b5bcb4, #70796f 55%, #343934)";
const TRACK_BG =
  "linear-gradient(to bottom, #cdd3cc 0%, #ffffff 16%, #969f95 36%, #70796f 64%, #383e38 100%)";
const BRUSHED =
  "repeating-linear-gradient(90deg, transparent 0 2px, rgba(255,255,255,0.4) 2px 3px, transparent 3px 7px)";
const CORD_BG =
  "linear-gradient(to right, #454545, #4f4f4f 10%, #4f4f4f 20%, #464646 30%, #333333 40%, #252525 50%, #262626 60%, #303030 70%, #3b3b3b 80%, #3d3d3d 90%, #3b3b3b)";
const POOL_BG =
  "radial-gradient(closest-side, color-mix(in oklab, var(--lamp-glow, #ffd98a) 88%, transparent), color-mix(in oklab, var(--lamp-glow, #ffd98a) 36%, transparent) 48%, transparent)";
const BEAM_GLOW =
  "color-mix(in oklab, var(--lamp-glow, #ffd98a) 72%, transparent)";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type Geometry = {
  h: number;
  w: number;
  width: number;
  carousel: boolean;
  track: number;
  trackTop: number;
  adapter: number;
  pivot: number;
  cords: number[];
  reach: number[];
  metres: number[];
  overlap: boolean[];
  foot: number;
  height: number;
  inset: number;
  min: number;
  max: number;
  poolW: number;
  poolH: number;
  beamW: number;
  cordW: number;
};

function geometry(
  h: number,
  width: number,
  carousel: boolean,
  drops: number[],
): Geometry {
  const w = h * ASPECT;
  const track = Math.round(clamp(h * 0.05, 6, 12));
  const trackTop = 8;
  const adapter = Math.round(clamp(h * 0.075, 8, 17));
  const pivot = trackTop + Math.round(track * 0.6) + adapter;
  const cords = drops.map((drop) => Math.round(h * CORD * drop));
  const reach = cords.map((cord) => cord + h * REACH);
  const metres = reach.map((r) => (r / h) * METRES);
  const overlap = cords.map(
    (cord, i) =>
      i < cords.length - 1 &&
      Math.abs(cord - (cords[i + 1] ?? 0)) < h * (MOUTH - SHADE_TOP),
  );
  const lowest = Math.max(0, ...cords) + h * 0.8;
  const inset = 0;
  const foot = w * SHADE;
  return {
    h,
    w,
    width,
    carousel,
    track,
    trackTop,
    adapter,
    pivot,
    cords,
    reach,
    metres,
    overlap,
    foot,
    height: Math.round(pivot + lowest + h * 0.12),
    inset,
    min: inset + foot / 2,
    max: width - inset - foot / 2,
    poolW: w * 2.4,
    poolH: h * 0.95,
    beamW: w * 3,
    cordW: Math.max(1.2, w * CORD_W),
  };
}

function restTargets(
  g: Geometry,
  count: number,
  front: number | null,
  swipe: number,
) {
  if (g.carousel) {
    const gap = g.w * 1.08;
    const centre = front ?? 0;
    return Array.from(
      { length: count },
      (_, i) => g.width / 2 + (i - centre) * gap + swipe,
    );
  }
  const edge = Math.max(16, g.w * 0.3);
  const spacing = clamp(
    (g.width - edge * 2) / Math.max(1, count),
    g.foot * 1.04,
    g.w * SPREAD,
  );
  const start = (g.width - spacing * count) / 2 + spacing / 2;
  return Array.from({ length: count }, (_, i) => start + i * spacing);
}

type Sim = {
  x: number[];
  vx: number[];
  pv: number[];
  tx: number[];
  swing: number[];
  vswing: number[];
  lit: number[];
  tlit: number[];
  drag: number;
  dragX: number;
  grab: number;
  free: number;
  last: number;
  raf: number;
};

function emptySim(): Sim {
  return {
    x: [],
    vx: [],
    pv: [],
    tx: [],
    swing: [],
    vswing: [],
    lit: [],
    tlit: [],
    drag: -1,
    dragX: 0,
    grab: 0,
    free: 0,
    last: 0,
    raf: 0,
  };
}

function constrain(s: Sim, n: number, gap: number, min: number, max: number) {
  const anchor = s.drag;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n - 1; i++) {
      const a = s.x[i] ?? 0;
      const b = s.x[i + 1] ?? 0;
      const overlap = gap - (b - a);
      if (overlap <= 0) continue;
      if (i === anchor) s.x[i + 1] = b + overlap;
      else if (i + 1 === anchor) s.x[i] = a - overlap;
      else {
        s.x[i] = a - overlap / 2;
        s.x[i + 1] = b + overlap / 2;
      }
      const va = s.vx[i] ?? 0;
      const vb = s.vx[i + 1] ?? 0;
      if (va > vb) {
        const shared = (va + vb) / 2;
        if (i !== anchor) s.vx[i] = shared;
        if (i + 1 !== anchor) s.vx[i + 1] = shared;
      }
    }
  }
  if ((s.x[n - 1] ?? 0) > max) {
    s.x[n - 1] = max;
    s.vx[n - 1] = -Math.abs(s.vx[n - 1] ?? 0) * 0.3;
  }
  for (let i = n - 2; i >= 0; i--) {
    const limit = (s.x[i + 1] ?? 0) - gap;
    if ((s.x[i] ?? 0) > limit) {
      s.x[i] = limit;
      s.vx[i] = Math.min(s.vx[i] ?? 0, s.vx[i + 1] ?? 0);
    }
  }
  if ((s.x[0] ?? 0) < min) {
    s.x[0] = min;
    s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3;
  }
  for (let i = 1; i < n; i++) {
    const limit = (s.x[i - 1] ?? 0) + gap;
    if ((s.x[i] ?? 0) < limit) {
      s.x[i] = limit;
      s.vx[i] = Math.max(s.vx[i] ?? 0, s.vx[i - 1] ?? 0);
    }
  }
}

function knock(s: Sim, n: number, g: Geometry) {
  for (let i = 0; i < n - 1; i++) {
    if (!g.overlap[i]) continue;
    const li = g.reach[i] ?? 1;
    const lj = g.reach[i + 1] ?? 1;
    const ai = (s.swing[i] ?? 0) * RAD;
    const aj = (s.swing[i + 1] ?? 0) * RAD;
    const xi = (s.x[i] ?? 0) - li * Math.sin(ai);
    const xj = (s.x[i + 1] ?? 0) - lj * Math.sin(aj);
    const pen = g.foot - (xj - xi);
    if (pen <= 0) continue;
    s.swing[i] = clamp(
      (s.swing[i] ?? 0) + (pen / 2 / li) * DEG,
      -MAX_SWING,
      MAX_SWING,
    );
    s.swing[i + 1] = clamp(
      (s.swing[i + 1] ?? 0) - (pen / 2 / lj) * DEG,
      -MAX_SWING,
      MAX_SWING,
    );
    const ui =
      (s.vx[i] ?? 0) - li * Math.cos(ai) * (s.vswing[i] ?? 0) * RAD;
    const uj =
      (s.vx[i + 1] ?? 0) - lj * Math.cos(aj) * (s.vswing[i + 1] ?? 0) * RAD;
    if (ui > uj) {
      const d = (1.35 * (ui - uj)) / 2;
      s.vswing[i] = (s.vswing[i] ?? 0) + (d / (li * Math.cos(ai))) * DEG;
      s.vswing[i + 1] =
        (s.vswing[i + 1] ?? 0) - (d / (lj * Math.cos(aj))) * DEG;
    }
  }
}

/**
 * 100% Exact Web DOM PendantLampRail (used when Platform.OS === "web")
 */
function WebPendantLampRail({
  items,
  dims,
  onOpenLamp,
}: {
  items: PendantLamp[];
  dims: number[];
  onOpenLamp: (index: number) => void;
}) {
  const count = items.length;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const slots = useRef<(HTMLButtonElement | null)[]>([]);
  const pendulums = useRef<(HTMLSpanElement | null)[]>([]);
  const photos = useRef<(HTMLSpanElement | null)[]>([]);
  const pools = useRef<(HTMLSpanElement | null)[]>([]);
  const beams = useRef<(HTMLSpanElement | null)[]>([]);
  const sim = useRef(emptySim());
  const [size, setSize] = useState({ width: 0, h: 150, carousel: false });
  const [innerActive, setInnerActive] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const pendingOpen = useRef(-1);
  const pointer = useRef({
    id: -1,
    index: -1,
    x: 0,
    y: 0,
    moved: false,
    kind: "",
    swipe: 0,
    lastX: 0,
    lastT: 0,
    v: 0,
  });
  const hover = useRef({ x: 0, t: 0, v: 0 });

  const active =
    innerActive !== null && innerActive >= 0 && innerActive < count
      ? innerActive
      : null;
  const drops = useMemo(
    () => items.map((item) => clamp(item.drop ?? 0.75, 0.3, 1.2)),
    [items],
  );
  const geo = useMemo(
    () => geometry(size.h, size.width, size.carousel, drops),
    [size, drops],
  );
  const live = useRef({
    active: null as number | null,
    geo,
    count,
    carouselIndex: 0,
  });
  live.current = { ...live.current, active, geo, count };

  const front = size.carousel ? (active ?? live.current.carouselIndex) : null;
  const litIndex = active ?? front;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (width: number) => {
      const fit = (width - 32) / (Math.max(1, count) * ASPECT * FIT);
      const carousel = count > 1 && fit < MIN_WIDE_H;
      const h =
        Math.round(
          (carousel
            ? Math.min(CAROUSEL_H, Math.max(170, width * 0.56))
            : Math.min(MAX_H, Math.max(60, fit))) * 10,
        ) / 10;
      setSize((old) =>
        Math.abs(old.width - width) < 0.5 &&
        old.carousel === carousel &&
        Math.abs(old.h - h) < 0.5
          ? old
          : { width, h, carousel },
      );
    };
    measure(stage.clientWidth || window.innerWidth);
    const observer = new ResizeObserver((entries) => {
      const box = entries[0];
      if (box) measure(box.contentRect.width);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count]);

  const painted = useRef<string[][]>([]);
  useEffect(() => {
    painted.current = [];
  });

  const paint = React.useCallback((i: number) => {
    const s = sim.current;
    const g = live.current.geo;
    const slot = slots.current[i];
    if (!slot) return;
    const x = s.x[i] ?? 0;
    const swing = s.swing[i] ?? 0;
    const lit = (s.lit[i] ?? AMBIENT).toFixed(3);
    const a = swing * RAD;
    const reach = (g.cords[i] ?? 0) + g.h * (MOUTH + 0.04);
    const spill = 0.1 * Math.max(s.lit[i - 1] ?? 0, s.lit[i + 1] ?? 0);
    const memo = painted.current[i] ?? (painted.current[i] = []);
    const put = (
      k: number,
      el: HTMLElement | null | undefined,
      prop: string,
      value: string,
    ) => {
      if (!el || memo[k] === value) return;
      memo[k] = value;
      el.style.setProperty(prop, value);
    };
    const beam = beams.current[i];
    const pool = pools.current[i];
    put(
      0,
      slot,
      "transform",
      `translate3d(${(x - g.w / 2).toFixed(2)}px,0,0)`,
    );
    put(1, slot, "--lit", lit);
    put(
      2,
      pendulums.current[i],
      "transform",
      `rotate(${swing.toFixed(3)}deg)`,
    );
    put(
      3,
      beam,
      "transform",
      `translate3d(${(x - g.beamW / 2).toFixed(2)}px,0,0) rotate(${swing.toFixed(3)}deg)`,
    );
    put(4, beam, "--lit", lit);
    put(
      5,
      pool,
      "transform",
      `translate3d(${(x - Math.sin(a) * reach - g.poolW / 2).toFixed(1)}px,${(g.pivot + Math.cos(a) * reach - g.poolH / 2).toFixed(1)}px,0) rotate(${(swing * 0.5).toFixed(2)}deg)`,
    );
    put(6, pool, "--lit", lit);
    put(7, pool, "--pool", Math.min(1, (s.lit[i] ?? 0) + spill).toFixed(3));
  }, []);

  const step = React.useCallback(
    (now: number) => {
      const s = sim.current;
      const { count: n, geo: g } = live.current;
      const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 1 / 60;
      s.last = now;
      const fade = 1 - Math.exp(-dt / FADE);
      for (let i = 0; i < n; i++)
        s.lit[i] =
          (s.lit[i] ?? 0) + ((s.tlit[i] ?? 0) - (s.lit[i] ?? 0)) * fade;
      const sub = Math.max(3, Math.ceil(dt / 0.011));
      const h = dt / sub;
      const couple = (COUPLING * METRES * DEG) / Math.max(1, g.h);
      const restoring = now > s.free;
      for (let k = 0; k < sub; k++) {
        for (let i = 0; i < n; i++) {
          const v = s.vx[i] ?? 0;
          s.pv[i] = v;
          if (i === s.drag)
            s.vx[i] = v + (-900 * ((s.x[i] ?? 0) - s.dragX) - 60 * v) * h;
          else if (restoring)
            s.vx[i] =
              v +
              (-130 * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) -
                2 * Math.sqrt(130) * 0.86 * v) *
                h;
          else s.vx[i] = v * Math.exp(-6 * h);
          s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
        }
        if (!g.carousel && n > 0) constrain(s, n, g.foot, g.min, g.max);
        for (let i = 0; i < n; i++) {
          const accel = clamp(
            ((s.vx[i] ?? 0) - (s.pv[i] ?? 0)) / h,
            -12000,
            12000,
          );
          const metres = g.metres[i] ?? 0.6;
          const sa =
            -(GRAVITY / metres) * (s.swing[i] ?? 0) -
            DAMPING * (s.vswing[i] ?? 0) +
            (accel * couple) / metres;
          s.vswing[i] = (s.vswing[i] ?? 0) + sa * h;
          const next = (s.swing[i] ?? 0) + (s.vswing[i] ?? 0) * h;
          if (Math.abs(next) > MAX_SWING) {
            s.swing[i] = Math.sign(next) * MAX_SWING;
            s.vswing[i] = -(s.vswing[i] ?? 0) * 0.2;
          } else s.swing[i] = next;
        }
        knock(s, n, g);
      }
      let busy = s.drag >= 0 || now < s.free;
      for (let i = 0; i < n; i++) {
        paint(i);
        if (busy) continue;
        if (
          Math.abs(s.vx[i] ?? 0) > 0.5 ||
          Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25 ||
          Math.abs(s.swing[i] ?? 0) > 0.02 ||
          Math.abs(s.vswing[i] ?? 0) > 0.05 ||
          Math.abs((s.lit[i] ?? 0) - (s.tlit[i] ?? 0)) > 0.002
        )
          busy = true;
      }
      if (busy) {
        s.raf = requestAnimationFrame(step);
        return;
      }
      s.raf = 0;
      s.last = 0;
      for (let i = 0; i < n; i++) {
        s.x[i] = s.tx[i] ?? 0;
        s.vx[i] = 0;
        s.swing[i] = 0;
        s.vswing[i] = 0;
        s.lit[i] = s.tlit[i] ?? 0;
        paint(i);
      }
    },
    [paint],
  );

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (!s.raf) {
      s.last = 0;
      s.raf = requestAnimationFrame(step);
    }
  }, [step]);

  const impulse = React.useCallback(
    (i: number, amount: number) => {
      const s = sim.current;
      if (i < 0 || i >= live.current.count) return;
      s.vswing[i] = (s.vswing[i] ?? 0) + amount;
      kick();
    },
    [kick],
  );

  useEffect(() => {
    if (!size.width) return;
    const s = sim.current;
    const xs = restTargets(
      geo,
      count,
      front,
      size.carousel ? pointer.current.swipe : 0,
    );
    const fresh = s.x.length !== count;
    for (let i = 0; i < count; i++) {
      s.tx[i] = xs[i] ?? 0;
      if (fresh) {
        s.x[i] = s.tx[i] ?? 0;
        s.vx[i] = 0;
        s.swing[i] = s.swing[i] ?? 0;
        s.vswing[i] = s.vswing[i] ?? 0;
      }
    }
    for (const list of [s.x, s.vx, s.pv, s.tx, s.swing, s.vswing])
      list.length = count;
    for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [size.width, size.carousel, geo, count, front, paint, kick]);

  useEffect(() => {
    const s = sim.current;
    for (let i = 0; i < count; i++) {
      s.tlit[i] = (i === litIndex ? 1 : AMBIENT) * (dims[i] ?? 1);
      if (s.lit[i] === undefined) s.lit[i] = s.tlit[i] ?? AMBIENT;
    }
    s.lit.length = count;
    s.tlit.length = count;
    for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [litIndex, dims, count, paint, kick]);

  const swayed = useRef(false);
  useEffect(() => {
    if (!size.width || swayed.current || count === 0) return;
    const timers = items.map((_, i) =>
      window.setTimeout(() => {
        swayed.current = true;
        impulse(i, -SWAY);
      }, 90 + i * 70),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [size.width, items, count, impulse]);

  useEffect(
    () => () => {
      cancelAnimationFrame(sim.current.raf);
      sim.current.raf = 0;
    },
    [],
  );

  const choose = React.useCallback(
    (index: number | null, brush = 0) => {
      if (live.current.active === index) return;
      live.current.active = index;
      if (index !== null) {
        impulse(index - 1, NUDGE);
        impulse(index + 1, -NUDGE);
        if (brush) impulse(index, brush);
        live.current.carouselIndex = index;
      }
      setInnerActive(index);
    },
    [impulse],
  );

  const stop = React.useCallback(() => setPlaying(false), []);

  useEffect(() => {
    if (!playing || count === 0 || !size.width) return;
    let timer = window.setTimeout(
      function advance() {
        const now = live.current.active;
        const first = live.current.geo.carousel
          ? Math.min(live.current.count - 1, live.current.carouselIndex + 1)
          : 0;
        choose(now === null ? first : (now + 1) % live.current.count);
        timer = window.setTimeout(advance, 2600);
      },
      active === null ? 1100 : 2600,
    );
    return () => window.clearTimeout(timer);
  }, [playing, count, size.width, choose, active]);

  function nearest(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const g = live.current.geo;
    if (y < 0 || y > g.height + 24) return null;
    const s = sim.current;
    let best = null as number | null;
    let distance = Infinity;
    let held = Infinity;
    for (let i = 0; i < live.current.count; i++) {
      const tip =
        (s.x[i] ?? 0) - Math.sin((s.swing[i] ?? 0) * RAD) * (g.reach[i] ?? 0);
      const d = Math.abs(x - tip);
      if (i === live.current.active) held = d;
      if (d < g.w * 0.7 && d < distance) {
        best = i;
        distance = d;
      }
    }
    if (
      best !== null &&
      best !== live.current.active &&
      held < g.w * 0.7 &&
      distance + 8 > held
    )
      return live.current.active;
    return best;
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const s = sim.current;
    const stage = stageRef.current;
    const now = performance.now();
    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x;
      if (
        !p.moved &&
        Math.abs(dx) > 6 &&
        Math.abs(dx) > Math.abs(event.clientY - p.y)
      ) {
        p.moved = true;
        stop();
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
        if (!live.current.geo.carousel && p.index >= 0) {
          s.drag = p.index;
          s.grab =
            event.clientX -
            stage.getBoundingClientRect().left -
            (s.x[p.index] ?? 0);
        }
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / Math.max(1, now - p.lastT);
        p.v = p.v * 0.6 + v * 0.4;
        p.lastX = event.clientX;
        p.lastT = now;
        if (s.drag >= 0) {
          s.dragX =
            event.clientX - stage.getBoundingClientRect().left - s.grab;
          s.free = now + 900;
          kick();
        } else if (live.current.geo.carousel) {
          p.swipe = dx;
          const xs = restTargets(
            live.current.geo,
            live.current.count,
            live.current.active ?? live.current.carouselIndex,
            dx,
          );
          for (let i = 0; i < live.current.count; i++) s.tx[i] = xs[i] ?? 0;
          kick();
        }
      }
      return;
    }
    const last = hover.current;
    const v = last.t ? (event.clientX - last.x) / Math.max(1, now - last.t) : 0;
    hover.current = { x: event.clientX, t: now, v: last.v * 0.5 + v * 0.5 };
    if (event.pointerType !== "mouse" || live.current.geo.carousel) return;
    const hit = nearest(event.clientX, event.clientY);
    if (hit !== null && hit !== live.current.active) {
      stop();
      choose(hit, clamp(-hover.current.v * 16, -22, 22));
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = performance.now();
    pendingOpen.current = -1;
    pointer.current = {
      id: event.pointerId,
      index: hit ?? -1,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      kind: event.pointerType,
      swipe: 0,
      lastX: event.clientX,
      lastT: now,
      v: 0,
    };
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId))
      stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    const now = performance.now();
    if (s.drag >= 0) {
      s.vx[s.drag] =
        now - p.lastT > 90 ? 0 : clamp(p.v * 1000, -2500, 2500);
      s.drag = -1;
      s.free = now + 350;
      kick();
      return;
    }
    if (p.moved && live.current.geo.carousel) {
      const dx = event.clientX - p.x;
      const from = live.current.active ?? live.current.carouselIndex;
      const shift =
        Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
      pointer.current.swipe = 0;
      const next = clamp(from + shift, 0, live.current.count - 1);
      if (next === from) {
        const xs = restTargets(
          live.current.geo,
          live.current.count,
          from,
          0,
        );
        for (let i = 0; i < live.current.count; i++) s.tx[i] = xs[i] ?? 0;
        kick();
      }
      choose(next);
      return;
    }
    if (cancelled || p.moved || p.index < 0) return;
    stop();
    if (p.kind !== "mouse" && live.current.active !== p.index) choose(p.index);
    else pendingOpen.current = p.index;
  };

  const trackLeft = geo.carousel ? -4 : geo.inset;
  const carouselIndex = size.carousel ? front : null;
  const adapterW = Math.round(clamp(geo.w * 0.2, 12, 28));

  return (
    <section
      style={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#f8f6f0",
        paddingBottom: 12,
        ["--lamp-glow" as string]: "#ffdb8c",
        ["--lamp-accent" as string]: "#2f6f5e",
        ["--pool-k" as string]: "0.85",
        ["--beam-k" as string]: "0.42",
        ["--bloom-k" as string]: "0.22",
        ["--shadow-k" as string]: "0.13",
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          pointer.current.id < 0 &&
          !size.carousel
        )
          choose(null);
      }}
    >
      <div
        ref={stageRef}
        style={{
          position: "relative",
          marginTop: 12,
          width: "100%",
          height: geo.height,
          overflowX: "clip",
          userSelect: "none",
          touchAction: "pan-y",
        }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
      >
        {/* Beams & Glow Pools */}
        <div
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            zIndex: 0,
            visibility: size.width ? undefined : "hidden",
          }}
        >
          {items.map((item, i) => {
            const cord = geo.cords[i] ?? 0;
            const apex = cord + geo.h * 0.3;
            return (
              <React.Fragment key={item.id}>
                <span
                  ref={(node) => {
                    beams.current[i] = node;
                  }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: geo.pivot,
                    width: geo.beamW,
                    height: cord + geo.h * 1.5,
                    transformOrigin: "50% 0",
                    opacity: "calc(var(--lit, 0) * var(--beam-k))",
                    background: `conic-gradient(from 140deg at 50% ${apex.toFixed(1)}px, transparent 0deg, ${BEAM_GLOW} 24deg, ${BEAM_GLOW} 56deg, transparent 80deg)`,
                    WebkitMaskImage: `linear-gradient(to bottom, transparent ${(cord + geo.h * (MOUTH - 0.04)).toFixed(1)}px, black ${(cord + geo.h * (MOUTH + 0.14)).toFixed(1)}px, black ${(cord + geo.h * 0.98).toFixed(1)}px, transparent)`,
                    maskImage: `linear-gradient(to bottom, transparent ${(cord + geo.h * (MOUTH - 0.04)).toFixed(1)}px, black ${(cord + geo.h * (MOUTH + 0.14)).toFixed(1)}px, black ${(cord + geo.h * 0.98).toFixed(1)}px, transparent)`,
                    ["--lamp-glow" as string]: item.glow ?? "#ffdb8c",
                  }}
                />
                <span
                  ref={(node) => {
                    pools.current[i] = node;
                  }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    borderRadius: "9999px",
                    width: geo.poolW,
                    height: geo.poolH,
                    opacity: "calc(var(--pool, 0) * var(--pool-k))",
                    background: POOL_BG,
                    ["--lamp-glow" as string]: item.glow ?? "#ffdb8c",
                  }}
                />
              </React.Fragment>
            );
          })}
        </div>

        {/* Track */}
        <div
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            position: "absolute",
            zIndex: 1,
            left: trackLeft,
            right: trackLeft,
            top: geo.trackTop,
            height: geo.track,
            visibility: size.width ? undefined : "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: geo.track + 1,
              height: 12,
              borderRadius: 9999,
              backgroundColor: "rgba(0,0,0,0.1)",
              filter: "blur(5px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 3,
              background: TRACK_BG,
              boxShadow: "0 1px 0 rgba(0,0,0,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 3,
              opacity: 0.4,
              background: BRUSHED,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 4,
              right: 4,
              bottom: "18%",
              height: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          {!geo.carousel &&
            [0, 1].map((side) => (
              <div
                key={side}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderRadius: 3,
                  [side ? "right" : "left"]: -2,
                  width: Math.max(10, geo.track * 1.3),
                  height: geo.track * 1.9,
                  background: METAL_X,
                  boxShadow: "0 3px 6px rgba(0,0,0,0.18)",
                }}
              />
            ))}
        </div>

        {/* Lamps */}
        {items.map((item, i) => {
          const lit = litIndex === i;
          const cord = geo.cords[i] ?? 0;
          const mask = `url("${item.image}") top center / contain no-repeat`;
          return (
            <button
              key={item.id}
              ref={(node) => {
                slots.current[i] = node;
              }}
              type="button"
              aria-label={item.name}
              style={{
                position: "absolute",
                left: 0,
                top: geo.pivot - geo.adapter,
                width: geo.w,
                height: geo.adapter + cord + geo.h * 0.82,
                zIndex: lit ? 20 : 10,
                visibility: !size.width ? "hidden" : undefined,
                transform: `translate3d(${((sim.current.x[i] ?? 0) - geo.w / 2).toFixed(2)}px,0,0)`,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                outline: "none",
                ["--lit" as string]: (sim.current.lit[i] ?? AMBIENT).toFixed(3),
                ["--lamp-glow" as string]: item.glow ?? "#ffdb8c",
              }}
              onFocus={() => {
                setFocusIndex(i);
                if (pointer.current.id < 0) {
                  stop();
                  choose(i);
                }
              }}
              onClick={(event) => {
                const pending = pendingOpen.current;
                pendingOpen.current = -1;
                if (event.detail === 0 || pending === i) onOpenLamp(i);
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  transform: "translateX(-50%)",
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  width: adapterW,
                  height: geo.adapter,
                  background: METAL_X,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "18%",
                    right: "18%",
                    top: "30%",
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.45)",
                  }}
                />
              </span>
              <span
                ref={(node) => {
                  pendulums.current[i] = node;
                }}
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: geo.adapter,
                  transformOrigin: "50% 0",
                  transform: `rotate(${(sim.current.swing[i] ?? 0).toFixed(3)}deg)`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 0,
                    transform: "translateX(-50%)",
                    borderBottomLeftRadius: 1,
                    borderBottomRightRadius: 1,
                    width: Math.max(3, geo.cordW * 2.4),
                    height: Math.max(3, geo.adapter * 0.45),
                    background: METAL_X,
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    overflow: "hidden",
                    height: cord,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "top",
                      background: CORD_BG,
                      transform: `scaleX(${CORD_W})`,
                    }}
                  />
                </span>
                <span
                  ref={(node) => {
                    photos.current[i] = node;
                  }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: cord,
                    height: geo.h,
                    ["--bloom-r" as string]: `${(geo.w * 0.08).toFixed(1)}px`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      pointerEvents: "none",
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "#000",
                      filter: "blur(3px)",
                      opacity: "var(--shadow-k)",
                      transform: "translate(5%, 2.5%)",
                      clipPath: "inset(30% 0 0 0)",
                      WebkitMask: mask,
                      mask,
                    }}
                  />
                  {item.imageOn && (
                    <img
                      src={item.imageOn}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      style={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "top",
                        opacity: "calc(var(--lit, 0) * var(--bloom-k))",
                        filter:
                          "blur(var(--bloom-r, 10px)) saturate(1.35) brightness(1.1)",
                      }}
                    />
                  )}
                  <img
                    src={item.image}
                    alt=""
                    draggable={false}
                    style={{
                      pointerEvents: "none",
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "top",
                    }}
                  />
                  {item.imageOn && (
                    <img
                      src={item.imageOn}
                      alt=""
                      draggable={false}
                      style={{
                        pointerEvents: "none",
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "top",
                        opacity: "var(--lit, 0)",
                      }}
                    />
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Pagination Dots */}
      {size.carousel && count > 1 && (
        <div
          aria-hidden="true"
          style={{
            position: "relative",
            zIndex: 10,
            marginTop: 4,
            display: "flex",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              tabIndex={-1}
              onClick={() => {
                stop();
                choose(i);
              }}
              style={{
                height: 6,
                width: carouselIndex === i ? 24 : 6,
                borderRadius: 9999,
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "width 300ms, background-color 300ms",
                backgroundColor:
                  carouselIndex === i ? "#2f6f5e" : "rgba(41,61,50,0.25)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Self-contained HTML for Android / iOS WebView so native mobile renders the exact same
 * CSS conic-gradient, radial-gradient, SVG filters, and physics as Web!
 */
function buildNativeWebViewHtml(items: PendantLamp[]): string {
  const serialized = JSON.stringify(items);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body {
    margin: 0; padding: 0;
    background: #f8f6f0;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    font-family: system-ui, -apple-system, sans-serif;
  }
  #root {
    position: relative;
    isolation: isolate;
    width: 100%;
    overflow: hidden;
    background: #f8f6f0;
    padding-bottom: 10px;
    --lamp-glow: #ffdb8c;
    --lamp-accent: #2f6f5e;
    --pool-k: 0.85;
    --beam-k: 0.42;
    --bloom-k: 0.22;
    --shadow-k: 0.13;
  }
  #stage {
    position: relative;
    margin-top: 10px;
    width: 100%;
    overflow-x: clip;
    touch-action: pan-y;
  }
  #dots {
    position: relative;
    z-index: 10;
    margin-top: 4px;
    display: flex;
    justify-content: center;
    gap: 6px;
  }
  .dot {
    height: 6px;
    width: 6px;
    border-radius: 9999px;
    border: none;
    padding: 0;
    background: rgba(41,61,50,0.25);
    transition: width 300ms, background-color 300ms;
  }
  .dot.active {
    width: 24px;
    background: #2f6f5e;
  }
</style>
</head>
<body>
<div id="root">
  <div id="stage"></div>
  <div id="dots"></div>
</div>
<script>
const ITEMS = ${serialized};
const ASPECT = 2/3, CAROUSEL_H = 224, CORD = 0.7, CORD_W = 0.02, SHADE_TOP = 0.32, MOUTH = 0.74, REACH = 0.55, METRES = 0.5;
const GRAVITY = 9.8, DAMPING = 2, COUPLING = 0.15, MAX_SWING = 14, AMBIENT = 0.12, FADE = 0.1, RAD = Math.PI/180, DEG = 180/Math.PI;
const METAL_X = "linear-gradient(to right, #b5bcb4, #70796f 55%, #343934)";
const TRACK_BG = "linear-gradient(to bottom, #cdd3cc 0%, #ffffff 16%, #969f95 36%, #70796f 64%, #383e38 100%)";
const BRUSHED = "repeating-linear-gradient(90deg, transparent 0 2px, rgba(255,255,255,0.4) 2px 3px, transparent 3px 7px)";
const CORD_BG = "linear-gradient(to right, #454545, #4f4f4f 10%, #4f4f4f 20%, #464646 30%, #333333 40%, #252525 50%, #262626 60%, #303030 70%, #3b3b3b 80%, #3d3d3d 90%, #3b3b3b)";
const POOL_BG = "radial-gradient(closest-side, color-mix(in oklab, var(--lamp-glow, #ffd98a) 88%, transparent), color-mix(in oklab, var(--lamp-glow, #ffd98a) 36%, transparent) 48%, transparent)";
const BEAM_GLOW = "color-mix(in oklab, var(--lamp-glow, #ffd98a) 72%, transparent)";

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

const stage = document.getElementById("stage");
const dotsWrap = document.getElementById("dots");
const n = ITEMS.length;
let width = window.innerWidth || 390;
let h = Math.min(CAROUSEL_H, Math.max(170, width * 0.56));
let w = h * ASPECT;
let track = Math.round(clamp(h * 0.05, 6, 12));
let trackTop = 8;
let adapter = Math.round(clamp(h * 0.075, 8, 17));
let pivot = trackTop + Math.round(track * 0.6) + adapter;
let cords = ITEMS.map(it => Math.round(h * CORD * (it.drop || 0.75)));
let reach = cords.map(c => c + h * REACH);
let metres = reach.map(r => (r / h) * METRES);
let lowest = Math.max(0, ...cords) + h * 0.8;
let stageH = Math.round(pivot + lowest + h * 0.12);
let poolW = w * 2.4, poolH = h * 0.95, beamW = w * 3, cordW = Math.max(1.2, w * CORD_W);
let gap = w * 1.08;

stage.style.height = stageH + "px";

const sim = {
  x: ITEMS.map((_, i) => width / 2 + i * gap),
  vx: ITEMS.map(() => 0),
  pv: ITEMS.map(() => 0),
  tx: ITEMS.map((_, i) => width / 2 + i * gap),
  swing: ITEMS.map(() => 0),
  vswing: ITEMS.map(() => 0),
  lit: ITEMS.map((_, i) => i === 0 ? 1 : AMBIENT),
  tlit: ITEMS.map((_, i) => i === 0 ? 1 : AMBIENT),
  last: 0,
  raf: 0
};

let activeIdx = 0;
let playing = true;
let swipe = 0;

// Build DOM
const bgLayer = document.createElement("div");
bgLayer.style.cssText = "pointer-events:none;position:absolute;inset:0;z-index:0;";
stage.appendChild(bgLayer);

const trackEl = document.createElement("div");
trackEl.style.cssText = "pointer-events:none;position:absolute;z-index:1;left:-4px;right:-4px;top:" + trackTop + "px;height:" + track + "px;";
trackEl.innerHTML =
  '<div style="position:absolute;left:0;right:0;top:' + (track+1) + 'px;height:12px;border-radius:9999px;background:rgba(0,0,0,0.1);filter:blur(5px)"></div>' +
  '<div style="position:absolute;inset:0;border-radius:3px;background:' + TRACK_BG + ';box-shadow:0 1px 0 rgba(0,0,0,0.18)"></div>' +
  '<div style="position:absolute;inset:0;border-radius:3px;opacity:0.4;background:' + BRUSHED + '"></div>' +
  '<div style="position:absolute;left:4px;right:4px;bottom:18%;height:1px;background:rgba(0,0,0,0.4)"></div>';
stage.appendChild(trackEl);

const beams = [], pools = [], slots = [], pendulums = [], dotBtns = [];
const adapterW = Math.round(clamp(w * 0.2, 12, 28));

ITEMS.forEach((item, i) => {
  const cord = cords[i];
  const apex = cord + h * 0.3;
  const beam = document.createElement("span");
  beam.style.cssText = "position:absolute;left:0;top:" + pivot + "px;width:" + beamW + "px;height:" + (cord + h*1.5) + "px;transform-origin:50% 0;opacity:calc(var(--lit,0)*var(--beam-k));background:conic-gradient(from 140deg at 50% " + apex.toFixed(1) + "px, transparent 0deg, " + BEAM_GLOW + " 24deg, " + BEAM_GLOW + " 56deg, transparent 80deg);-webkit-mask-image:linear-gradient(to bottom, transparent " + (cord + h*(MOUTH-0.04)).toFixed(1) + "px, black " + (cord + h*(MOUTH+0.14)).toFixed(1) + "px, black " + (cord + h*0.98).toFixed(1) + "px, transparent);";
  beam.style.setProperty("--lamp-glow", item.glow || "#ffdb8c");
  bgLayer.appendChild(beam);
  beams.push(beam);

  const pool = document.createElement("span");
  pool.style.cssText = "position:absolute;left:0;top:0;border-radius:9999px;width:" + poolW + "px;height:" + poolH + "px;opacity:calc(var(--pool,0)*var(--pool-k));background:" + POOL_BG + ";";
  pool.style.setProperty("--lamp-glow", item.glow || "#ffdb8c");
  bgLayer.appendChild(pool);
  pools.push(pool);

  const slot = document.createElement("button");
  slot.type = "button";
  slot.style.cssText = "position:absolute;left:0;top:" + (pivot - adapter) + "px;width:" + w + "px;height:" + (adapter + cord + h*0.82) + "px;background:transparent;border:none;padding:0;outline:none;";
  const mask = 'url("' + item.image + '") top center / contain no-repeat';
  slot.innerHTML =
    '<span style="pointer-events:none;position:absolute;left:50%;top:0;transform:translateX(-50%);border-radius:2px 2px 4px 4px;width:' + adapterW + 'px;height:' + adapter + 'px;background:' + METAL_X + ';box-shadow:0 2px 4px rgba(0,0,0,0.2)"><span style="position:absolute;left:18%;right:18%;top:30%;height:1px;background:rgba(255,255,255,0.45)"></span></span>' +
    '<span class="pend" style="pointer-events:none;position:absolute;left:0;right:0;bottom:0;top:' + adapter + 'px;transform-origin:50% 0">' +
      '<span style="position:absolute;left:50%;top:0;transform:translateX(-50%);border-radius:0 0 1px 1px;width:' + Math.max(3, cordW*2.4) + 'px;height:' + Math.max(3, adapter*0.45) + 'px;background:' + METAL_X + '"></span>' +
      '<span style="position:absolute;left:0;right:0;top:0;overflow:hidden;height:' + cord + 'px"><span style="position:absolute;inset:0;transform-origin:top;background:' + CORD_BG + ';transform:scaleX(' + CORD_W + ')"></span></span>' +
      '<span style="position:absolute;left:0;right:0;top:' + cord + 'px;height:' + h + 'px">' +
        '<span style="pointer-events:none;position:absolute;inset:0;background:#000;filter:blur(3px);opacity:var(--shadow-k);transform:translate(5%,2.5%);clip-path:inset(30% 0 0 0);-webkit-mask:' + mask + ';mask:' + mask + '"></span>' +
        '<img src="' + item.image + '" draggable="false" style="pointer-events:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:top" />' +
        '<img src="' + item.imageOn + '" draggable="false" style="pointer-events:none;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:top;opacity:var(--lit,0)" />' +
      '</span>' +
    '</span>';
  stage.appendChild(slot);
  slots.push(slot);
  pendulums.push(slot.querySelector(".pend"));

  const dot = document.createElement("button");
  dot.className = "dot" + (i === 0 ? " active" : "");
  dot.onclick = () => { playing = false; selectLamp(i); };
  dotsWrap.appendChild(dot);
  dotBtns.push(dot);
});

function updateTargets() {
  for (let i = 0; i < n; i++) {
    sim.tx[i] = width / 2 + (i - activeIdx) * gap + swipe;
    sim.tlit[i] = i === activeIdx ? 1 : AMBIENT;
    dotBtns[i].className = "dot" + (i === activeIdx ? " active" : "");
    slots[i].style.zIndex = i === activeIdx ? "20" : "10";
  }
  kick();
}

function selectLamp(idx) {
  idx = clamp(idx, 0, n - 1);
  if (activeIdx !== idx) {
    sim.vswing[Math.max(0, idx - 1)] += 12;
    sim.vswing[Math.min(n - 1, idx + 1)] -= 12;
    activeIdx = idx;
  }
  updateTargets();
}

function paint(i) {
  const x = sim.x[i], sw = sim.swing[i], lit = sim.lit[i].toFixed(3);
  const a = sw * RAD;
  const r = cords[i] + h * (MOUTH + 0.04);
  const spill = 0.1 * Math.max(sim.lit[i-1]||0, sim.lit[i+1]||0);
  slots[i].style.transform = "translate3d(" + (x - w/2).toFixed(2) + "px,0,0)";
  slots[i].style.setProperty("--lit", lit);
  pendulums[i].style.transform = "rotate(" + sw.toFixed(3) + "deg)";
  beams[i].style.transform = "translate3d(" + (x - beamW/2).toFixed(2) + "px,0,0) rotate(" + sw.toFixed(3) + "deg)";
  beams[i].style.setProperty("--lit", lit);
  pools[i].style.transform = "translate3d(" + (x - Math.sin(a)*r - poolW/2).toFixed(1) + "px," + (pivot + Math.cos(a)*r - poolH/2).toFixed(1) + "px,0) rotate(" + (sw*0.5).toFixed(2) + "deg)";
  pools[i].style.setProperty("--pool", Math.min(1, sim.lit[i] + spill).toFixed(3));
}

function step(now) {
  const dt = sim.last ? Math.min(0.05, (now - sim.last) / 1000) : 1/60;
  sim.last = now;
  const fade = 1 - Math.exp(-dt / FADE);
  for (let i = 0; i < n; i++) sim.lit[i] += (sim.tlit[i] - sim.lit[i]) * fade;
  const sub = Math.max(3, Math.ceil(dt / 0.011));
  const sh = dt / sub;
  const couple = (COUPLING * METRES * DEG) / Math.max(1, h);
  for (let k = 0; k < sub; k++) {
    for (let i = 0; i < n; i++) {
      const v = sim.vx[i];
      sim.pv[i] = v;
      sim.vx[i] = v + (-130 * (sim.x[i] - sim.tx[i]) - 2 * Math.sqrt(130) * 0.86 * v) * sh;
      sim.x[i] += sim.vx[i] * sh;
      const accel = clamp((sim.vx[i] - sim.pv[i]) / sh, -12000, 12000);
      const m = metres[i] || 0.6;
      const sa = -(GRAVITY / m) * sim.swing[i] - DAMPING * sim.vswing[i] + (accel * couple) / m;
      sim.vswing[i] += sa * sh;
      sim.swing[i] = clamp(sim.swing[i] + sim.vswing[i] * sh, -MAX_SWING, MAX_SWING);
    }
  }
  let busy = false;
  for (let i = 0; i < n; i++) {
    paint(i);
    if (Math.abs(sim.vx[i]) > 0.4 || Math.abs(sim.x[i] - sim.tx[i]) > 0.25 || Math.abs(sim.swing[i]) > 0.03 || Math.abs(sim.lit[i] - sim.tlit[i]) > 0.003) busy = true;
  }
  if (busy) sim.raf = requestAnimationFrame(step);
  else { sim.raf = 0; sim.last = 0; }
}

function kick() {
  if (!sim.raf) { sim.last = 0; sim.raf = requestAnimationFrame(step); }
}

updateTargets();
setInterval(() => {
  if (playing) selectLamp((activeIdx + 1) % n);
}, 2600);

let pStart = 0, pMoved = false, pLastX = 0, pLastT = 0, pVel = 0;
stage.addEventListener("pointerdown", e => {
  pStart = e.clientX; pLastX = e.clientX; pLastT = performance.now(); pMoved = false; pVel = 0;
});
stage.addEventListener("pointermove", e => {
  if (!pStart) return;
  const dx = e.clientX - pStart;
  if (Math.abs(dx) > 6) {
    pMoved = true; playing = false;
    const now = performance.now();
    pVel = 0.6 * pVel + 0.4 * ((e.clientX - pLastX) / Math.max(1, now - pLastT));
    pLastX = e.clientX; pLastT = now;
    swipe = dx;
    updateTargets();
  }
});
stage.addEventListener("pointerup", e => {
  if (!pStart) return;
  const dx = e.clientX - pStart;
  pStart = 0;
  swipe = 0;
  if (pMoved) {
    const shift = Math.abs(dx) > 36 || Math.abs(pVel) > 0.4 ? (dx < 0 ? 1 : -1) : 0;
    selectLamp(activeIdx + shift);
  } else {
    playing = false;
    let best = activeIdx, dist = 9999;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(e.clientX - sim.x[i]);
      if (d < dist) { dist = d; best = i; }
    }
    if (best !== activeIdx) selectLamp(best);
    else if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: "open", index: activeIdx }));
  }
});

window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: "height", height: stageH + 34 }));
</script>
</body>
</html>`;
}

export function PendantLampRail({ products }: { products?: Product[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [dims, setDims] = useState<number[]>(() =>
    LAMP_DEMO_ITEMS.map(() => 1),
  );
  const [webViewHeight, setWebViewHeight] = useState(() => {
    const w = Dimensions.get("window").width;
    const h = Math.min(CAROUSEL_H, Math.max(170, w * 0.56));
    return Math.round(h * 1.7 + 44);
  });

  const items = useMemo(() => {
    if (!products?.length) return LAMP_DEMO_ITEMS;
    return LAMP_DEMO_ITEMS.map((item) => {
      const matched = products.find((p) => p._id === item.productId);
      if (!matched) return item;
      return {
        ...item,
        name: matched.name || item.name,
        tag: matched.price ? money(priceOf(matched)) : item.tag,
        productImage:
          matched.image || matched.images?.[0] || item.productImage,
      };
    });
  }, [products]);

  const openItem = openIndex !== null ? items[openIndex] : null;
  const openDim = openIndex !== null ? (dims[openIndex] ?? 1) : 1;
  const count = items.length;

  return (
    <View style={{ width: "100%", backgroundColor: "#f8f6f0" }}>
      {Platform.OS === "web" ? (
        <WebPendantLampRail
          items={items}
          dims={dims}
          onOpenLamp={(idx) => setOpenIndex(idx)}
        />
      ) : (
        <View style={{ width: "100%", height: webViewHeight }}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: buildNativeWebViewHtml(items) }}
            scrollEnabled={false}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: "#f8f6f0" }}
            onMessage={(e) => {
              try {
                const msg = JSON.parse(e.nativeEvent.data);
                if (msg.type === "height" && typeof msg.height === "number") {
                  setWebViewHeight(msg.height);
                } else if (
                  msg.type === "open" &&
                  typeof msg.index === "number"
                ) {
                  setOpenIndex(msg.index);
                }
              } catch {}
            }}
          />
        </View>
      )}

      {/* Detail & Dimmer Modal */}
      <Modal
        visible={openItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenIndex(null)}
      >
        {openItem && openIndex !== null && (
          <View style={styles.modalBackdrop}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalCounter}>
                    {String(openIndex + 1).padStart(2, "0")} /{" "}
                    {String(count).padStart(2, "0")}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Đóng"
                    onPress={() => setOpenIndex(null)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>Đóng</Text>
                    <Icon name="close" size={16} color={colors.ink} />
                  </Pressable>
                </View>

                <View style={styles.dimmerBox}>
                  <View style={styles.dimmerHeader}>
                    <Text style={styles.dimmerLabel}>Độ sáng (Dimmer)</Text>
                    <Text style={styles.dimmerPercent}>
                      {Math.round(openDim * 100)}%
                    </Text>
                  </View>
                  <View style={styles.dimmerPresets}>
                    {[0, 0.25, 0.5, 0.75, 1].map((val) => {
                      const selected = Math.abs(openDim - val) < 0.12;
                      return (
                        <Pressable
                          key={val}
                          onPress={() =>
                            setDims((prev) =>
                              prev.map((d, idx) =>
                                idx === openIndex ? val : d,
                              ),
                            )
                          }
                          style={[
                            styles.dimmerChip,
                            selected && styles.dimmerChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dimmerChipText,
                              selected && styles.dimmerChipTextActive,
                            ]}
                          >
                            {Math.round(val * 100)}%
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Text style={styles.modalTitle}>{openItem.name}</Text>
                <Text style={styles.modalDesc}>{openItem.description}</Text>

                <View style={styles.detailTagsRow}>
                  {openItem.details.map((d) => (
                    <View key={d} style={styles.detailPill}>
                      <Text style={styles.detailPillText}>{d}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.realProductRow}>
                  <Image
                    source={{ uri: openItem.productImage }}
                    style={styles.realProductThumb}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.realProductEyebrow}>
                      ẢNH SẢN PHẨM THỰC TẾ
                    </Text>
                    <Text numberOfLines={1} style={styles.realProductName}>
                      {openItem.name}
                    </Text>
                    <Text style={styles.realProductPrice}>{openItem.tag}</Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const pid = openItem.productId;
                      setOpenIndex(null);
                      router.push({
                        pathname: "/products/[id]",
                        params: { id: pid },
                      });
                    }}
                    style={styles.primaryActionBtn}
                  >
                    <Text style={styles.primaryActionText}>
                      Xem chi tiết sản phẩm
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      void WebBrowser.openBrowserAsync(openItem.productLink)
                    }
                    style={styles.secondaryActionBtn}
                  >
                    <Text style={styles.secondaryActionText}>
                      Mua ngay trên Shopee ↗
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 33, 27, 0.65)",
    justifyContent: "center",
    padding: 18,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#fbf9f4",
    borderRadius: 26,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalCounter: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    color: colors.muted,
    fontFamily: fontFamilies.heading,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eef2e7",
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
    fontFamily: fontFamilies.heading,
  },
  dimmerBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dimmerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dimmerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    fontFamily: fontFamilies.body,
  },
  dimmerPercent: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    fontFamily: fontFamilies.heading,
  },
  dimmerPresets: {
    flexDirection: "row",
    gap: 8,
  },
  dimmerChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#f3f0e6",
    alignItems: "center",
  },
  dimmerChipActive: {
    backgroundColor: colors.green,
  },
  dimmerChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
    fontFamily: fontFamilies.heading,
  },
  dimmerChipTextActive: {
    color: "#ffffff",
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.ink,
    fontFamily: fontFamilies.heading,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    fontFamily: fontFamilies.body,
  },
  detailTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  detailPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  detailPillText: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: fontFamilies.body,
  },
  realProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.line,
  },
  realProductThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#f2efe6",
  },
  realProductEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.muted,
    fontFamily: fontFamilies.heading,
  },
  realProductName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    fontFamily: fontFamilies.heading,
  },
  realProductPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.green,
    fontFamily: fontFamilies.heading,
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  primaryActionBtn: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.green,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: fontFamilies.heading,
  },
  secondaryActionBtn: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.green,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: fontFamilies.heading,
  },
});
