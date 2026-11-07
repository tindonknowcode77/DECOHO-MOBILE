import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { colors, fontFamilies, Icon } from "./ui";
import { money, priceOf, type Product } from "../lib/types";

export interface PendantLampItem {
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

export const LAMP_DEMO_ITEMS: PendantLampItem[] = [
  {
    id: "dome-enamel",
    productId: "6ae33590f9df260a0b6cfb65",
    name: "Đèn Thả Trần Bàn Ăn Bauhaus",
    tag: "685.420 ₫",
    drop: 0.62,
    glow: "#ffdfa0",
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
    image: "cloud-svg",
    imageOn: "cloud-svg-on",
  },
  {
    id: "glass-globe",
    productId: "6ae3304df9df260a0b6cfada",
    name: "Đèn trần cổ điển",
    tag: "863.000 ₫",
    drop: 0.9,
    glow: "#ffe09e",
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
    glow: "#ffd98a",
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
    glow: "#ffd88a",
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
    glow: "#ffe7ad",
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
    glow: "#ffe19c",
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
    glow: "#ffd384",
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

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function CloudLampGraphic({
  width,
  height,
  lit,
}: {
  width: number;
  height: number;
  lit: number;
}) {
  const cordW = Math.max(2, width * 0.02);
  const cordH = height * 0.35;
  const cloudTop = height * 0.31;
  const cloudW = width * 0.84;
  const cloudH = height * 0.33;
  const left = (width - cloudW) / 2;

  const puffs = [
    { x: 0.05, y: 0.28, w: 0.45, h: 0.56 },
    { x: 0.5, y: 0.28, w: 0.45, h: 0.56 },
    { x: 0.17, y: 0.08, w: 0.43, h: 0.56 },
    { x: 0.4, y: 0.08, w: 0.43, h: 0.56 },
    { x: 0.29, y: 0.0, w: 0.42, h: 0.52 },
    { x: 0.07, y: 0.24, w: 0.86, h: 0.62 },
  ];

  return (
    <View style={{ width, height }} pointerEvents="none">
      <View
        style={{
          position: "absolute",
          top: 0,
          left: (width - cordW) / 2,
          width: cordW,
          height: cordH,
          backgroundColor: "#262626",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: cloudTop,
          left,
          width: cloudW,
          height: cloudH,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: cloudW * 0.08,
            top: cloudH * 0.42,
            width: cloudW * 0.84,
            height: cloudH * 0.54,
            borderRadius: cloudH,
            backgroundColor: lit > 0.35 ? "#f59e0b" : "#94a3b8",
            opacity: 0.32,
          }}
        />
        {puffs.map((p, idx) => (
          <View
            key={`off-${idx}`}
            style={{
              position: "absolute",
              left: cloudW * p.x,
              top: cloudH * p.y,
              width: cloudW * p.w,
              height: cloudH * p.h,
              borderRadius: cloudW,
              backgroundColor: idx === puffs.length - 1 ? "#f8fafc" : "#f1f5f9",
              borderWidth: 0.5,
              borderColor: "rgba(203,213,225,0.5)",
            }}
          />
        ))}
        <View style={[StyleSheet.absoluteFill, { opacity: lit }]}>
          {puffs.map((p, idx) => (
            <View
              key={`on-${idx}`}
              style={{
                position: "absolute",
                left: cloudW * p.x,
                top: cloudH * p.y,
                width: cloudW * p.w,
                height: cloudH * p.h,
                borderRadius: cloudW,
                backgroundColor:
                  idx === puffs.length - 1 ? "#fffbeb" : "#fef3c7",
              }}
            />
          ))}
          <View
            style={{
              position: "absolute",
              left: cloudW * 0.18,
              top: cloudH * 0.22,
              width: cloudW * 0.64,
              height: cloudH * 0.55,
              borderRadius: cloudW,
              backgroundColor: "#fde68a",
              opacity: 0.88,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function LampVisual({
  item,
  width,
  height,
  lit,
}: {
  item: PendantLampItem;
  width: number;
  height: number;
  lit: number;
}) {
  if (item.id === "cloud-pendant") {
    return <CloudLampGraphic width={width} height={height} lit={lit} />;
  }
  return (
    <View style={{ width, height }} pointerEvents="none">
      {/* Subtle drop shadow of shade */}
      <Image
        source={{ uri: item.image }}
        style={{
          width,
          height,
          position: "absolute",
          top: 3,
          left: 4,
          opacity: 0.14,
          tintColor: "#000000",
        }}
        resizeMode="contain"
      />
      <Image
        source={{ uri: item.image }}
        style={{ width, height, position: "absolute", top: 0, left: 0 }}
        resizeMode="contain"
      />
      <Image
        source={{ uri: item.imageOn }}
        style={{
          width,
          height,
          position: "absolute",
          top: 0,
          left: 0,
          opacity: lit,
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export function PendantLampRail({ products }: { products?: Product[] }) {
  const [stageWidth, setStageWidth] = useState(
    () => Dimensions.get("window").width,
  );
  const [activeIndex, setActiveIndex] = useState<number>(4); // Default center on rattan/paper-lantern like web mobile view
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [dims, setDims] = useState<number[]>(() =>
    LAMP_DEMO_ITEMS.map(() => 1),
  );

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

  const count = items.length;

  // Match exact Web F12 mobile carousel geometry:
  // fit = (width - 32) / (count * (2/3) * 1.1) -> carousel when fit < 112 (i.e. width < 690)
  const fit = (stageWidth - 32) / (Math.max(1, count) * (2 / 3) * 1.1);
  const isCarousel = count > 1 && fit < 112;
  const h = Math.round(
    isCarousel
      ? Math.min(224, Math.max(175, stageWidth * 0.56))
      : Math.min(200, Math.max(60, fit)),
  );
  const w = Math.round(h * (2 / 3));
  const trackH = Math.round(clamp(h * 0.05, 6, 12));
  const trackTop = 8;
  const adapterH = Math.round(clamp(h * 0.075, 8, 17));
  const adapterW = Math.round(clamp(w * 0.19, 14, 28));
  const pivotY = trackTop + Math.round(trackH * 0.6) + adapterH;
  const cords = useMemo(
    () => items.map((item) => Math.round(h * 0.7 * item.drop)),
    [items, h],
  );
  const lowest = Math.max(0, ...cords) + h * 0.8;
  const stageHeight = Math.round(pivotY + lowest + h * 0.12);
  const gap = w * 1.08;
  const cordW = Math.max(1.6, w * 0.02);

  // Simulation state for smooth carousel sliding & pendulum swing
  const simRef = useRef({
    x: items.map((_, i) => stageWidth / 2 + (i - 4) * (w * 1.08)),
    vx: items.map(() => 0),
    swing: items.map(() => 0),
    vswing: items.map(() => 0),
    swipe: 0,
  });

  const [renderState, setRenderState] = useState(() => ({
    x: items.map((_, i) => stageWidth / 2 + (i - 4) * (w * 1.08)),
    swing: items.map(() => 0),
  }));

  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;
  const geoRef = useRef({ stageWidth, w, h, gap, isCarousel, cords });
  geoRef.current = { stageWidth, w, h, gap, isCarousel, cords };

  // Re-initialize positions when width changes significantly
  useEffect(() => {
    const g = geoRef.current;
    if (g.isCarousel) {
      simRef.current.x = items.map(
        (_, i) => g.stageWidth / 2 + (i - activeRef.current) * g.gap,
      );
    } else {
      const edge = Math.max(16, g.w * 0.3);
      const spacing = clamp(
        (g.stageWidth - edge * 2) / count,
        g.w * 0.88 * 1.04,
        g.w * 1.42,
      );
      const start = (g.stageWidth - spacing * count) / 2 + spacing / 2;
      simRef.current.x = items.map((_, i) => start + i * spacing);
    }
    setRenderState({
      x: [...simRef.current.x],
      swing: [...simRef.current.swing],
    });
  }, [stageWidth, isCarousel, count]);

  // Autoplay advances carousel lamp every 2.6s just like web
  useEffect(() => {
    if (!autoplay || openIndex !== null) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % count;
        simRef.current.vswing[next] = (simRef.current.vswing[next] ?? 0) + 14;
        return next;
      });
    }, 2600);
    return () => clearInterval(id);
  }, [autoplay, openIndex, count]);

  // Spring + pendulum animation loop matching web PendantLampRail
  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const s = simRef.current;
      const g = geoRef.current;
      const centre = activeRef.current;

      let dirty = false;
      for (let i = 0; i < count; i++) {
        const targetX = g.isCarousel
          ? g.stageWidth / 2 + (i - centre) * g.gap + s.swipe
          : (() => {
              const edge = Math.max(16, g.w * 0.3);
              const spacing = clamp(
                (g.stageWidth - edge * 2) / count,
                g.w * 0.88 * 1.04,
                g.w * 1.42,
              );
              const start = (g.stageWidth - spacing * count) / 2 + spacing / 2;
              return start + i * spacing;
            })();

        const prevX = s.x[i] ?? targetX;
        const prevVx = s.vx[i] ?? 0;

        // Horizontal spring along track
        let vx = prevVx + (targetX - prevX) * 65 * dt;
        vx *= Math.exp(-11 * dt);
        const nextX = prevX + vx * dt;
        const ax = (vx - prevVx) / Math.max(0.001, dt);

        // Pendulum swing coupled to track acceleration
        const cord = g.cords[i] ?? 100;
        const reach = cord + g.h * 0.55;
        let swing = s.swing[i] ?? 0;
        let vswing = s.vswing[i] ?? 0;
        const omega = 5.4;
        vswing += (-omega * omega * swing + (ax / reach) * 14) * dt;
        vswing *= Math.exp(-2.2 * dt);
        swing = clamp(swing + vswing * dt, -14, 14);

        if (
          Math.abs(targetX - nextX) > 0.25 ||
          Math.abs(vx) > 0.25 ||
          Math.abs(swing) > 0.08 ||
          Math.abs(vswing) > 0.08
        ) {
          dirty = true;
        } else {
          swing = 0;
          vswing = 0;
        }

        s.x[i] = nextX;
        s.vx[i] = vx;
        s.swing[i] = swing;
        s.vswing[i] = vswing;
      }

      if (dirty) {
        setRenderState({
          x: [...s.x],
          swing: [...s.swing],
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          setAutoplay(false);
        },
        onPanResponderMove: (_, g) => {
          simRef.current.swipe = clamp(g.dx * 0.85, -gap * 1.2, gap * 1.2);
        },
        onPanResponderRelease: (_, g) => {
          simRef.current.swipe = 0;
          const step =
            g.dx < -28 || g.vx < -0.35 ? 1 : g.dx > 28 || g.vx > 0.35 ? -1 : 0;
          if (step !== 0) {
            setActiveIndex((prev) => {
              const next = clamp(prev + step, 0, count - 1);
              simRef.current.vswing[next] =
                (simRef.current.vswing[next] ?? 0) - step * 16;
              return next;
            });
          }
        },
        onPanResponderTerminate: () => {
          simRef.current.swipe = 0;
        },
      }),
    [gap, count],
  );

  const openItem = openIndex !== null ? items[openIndex] : null;
  const openDim = openIndex !== null ? (dims[openIndex] ?? 1) : 1;
  const activeCenter = renderState.x[activeIndex] ?? stageWidth / 2;
  const activeCord = cords[activeIndex] ?? 100;

  return (
    <View
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0 && Math.abs(width - stageWidth) > 1) {
          setStageWidth(width);
        }
      }}
      style={styles.outerSection}
    >
      {/* Interactive Lamp Stage */}
      <View
        style={{
          width: "100%",
          height: stageHeight,
          position: "relative",
          overflow: "hidden",
        }}
        {...panResponder.panHandlers}
      >
        {/* Warm Radial Glow Pool & Light Cone behind active lamp */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: activeCenter - w * 1.15,
            top: pivotY + activeCord + h * 0.16,
            width: w * 2.3,
            height: h * 1.05,
            borderRadius: 999,
            backgroundColor: items[activeIndex]?.glow ?? "#ffe19a",
            opacity: 0.34 * (dims[activeIndex] ?? 1),
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: activeCenter - w * 0.72,
            top: pivotY + activeCord + h * 0.38,
            width: w * 1.44,
            height: h * 0.68,
            borderRadius: 999,
            backgroundColor: "#ffefc2",
            opacity: 0.42 * (dims[activeIndex] ?? 1),
          }}
        />

        {/* Horizontal Metallic Track (Edge-to-Edge in Carousel mode, matching web F12 mobile view) */}
        <View
          pointerEvents="none"
          style={[
            styles.trackBar,
            {
              top: trackTop,
              height: trackH,
              left: 0,
              right: 0,
            },
          ]}
        >
          <LinearGradient
            colors={["#9ba698", "#6f7b6e", "#3f473f"]}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 1,
              height: 1,
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          />
        </View>

        {/* Pendant Lamps */}
        {items.map((item, i) => {
          const x = renderState.x[i] ?? stageWidth / 2 + (i - activeIndex) * gap;
          // Skip rendering off-screen lamps far outside viewport
          if (x < -w * 1.5 || x > stageWidth + w * 1.5) return null;

          const isLit = activeIndex === i;
          const litVal = isLit ? (dims[i] ?? 1) : 0.12;
          const cord = cords[i] ?? 100;
          const swing = renderState.swing[i] ?? 0;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              onPress={() => {
                setAutoplay(false);
                if (isCarousel && activeIndex !== i) {
                  // Tapping a side lamp in carousel slides it to center first, just like web!
                  setActiveIndex(i);
                  simRef.current.vswing[i] =
                    (simRef.current.vswing[i] ?? 0) + 12;
                } else {
                  setActiveIndex(i);
                  setOpenIndex(i);
                }
              }}
              style={{
                position: "absolute",
                top: pivotY - adapterH,
                left: x - w / 2,
                width: w,
                height: adapterH + cord + h * 0.84,
                zIndex: isLit ? 20 : 10,
                alignItems: "center",
              }}
            >
              {/* Track Adapter Canopy */}
              <View
                style={[
                  styles.adapter,
                  {
                    width: adapterW,
                    height: adapterH,
                  },
                ]}
              >
                <LinearGradient
                  colors={["#5d675c", "#8e998c", "#474f46"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 3 }]}
                />
                <View style={styles.adapterHighlight} />
              </View>

              {/* Swinging Pendulum */}
              <View
                style={{
                  position: "absolute",
                  top: adapterH,
                  width: w,
                  height: cord + h,
                  alignItems: "center",
                  transform: [{ rotate: `${swing.toFixed(2)}deg` }],
                }}
              >
                {/* Metal collar under adapter */}
                <View
                  style={{
                    width: Math.max(4, cordW * 2.2),
                    height: Math.max(3, adapterH * 0.35),
                    backgroundColor: "#4f584e",
                    borderBottomLeftRadius: 1,
                    borderBottomRightRadius: 1,
                  }}
                />

                {/* Cord */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: cordW,
                    height: cord + 2,
                    backgroundColor: "#262626",
                  }}
                />

                {/* Lamp Shade Photo */}
                <View
                  style={{
                    position: "absolute",
                    top: cord,
                    width: w,
                    height: h,
                  }}
                >
                  <LampVisual item={item} width={w} height={h} lit={litVal} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Carousel Pagination Dots (exact match with web F12 mobile view) */}
      {isCarousel && count > 1 && (
        <View style={styles.dotsRow}>
          {items.map((item, i) => {
            const selected = activeIndex === i;
            return (
              <Pressable
                key={item.id}
                hitSlop={6}
                onPress={() => {
                  setAutoplay(false);
                  setActiveIndex(i);
                  simRef.current.vswing[i] =
                    (simRef.current.vswing[i] ?? 0) + 12;
                }}
                style={[
                  styles.dot,
                  selected ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>
      )}

      {/* Detail & Dimmer Modal when tapping the active center lamp */}
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

                <View style={styles.previewStage}>
                  <View
                    style={[
                      styles.previewGlowPool,
                      {
                        backgroundColor: openItem.glow ?? "#ffe29a",
                        opacity: 0.45 * openDim,
                      },
                    ]}
                  />
                  <View
                    style={{
                      width: 3,
                      height: 28,
                      backgroundColor: "#262626",
                    }}
                  />
                  <View style={{ marginTop: -2 }}>
                    <LampVisual
                      item={openItem}
                      width={136}
                      height={204}
                      lit={openDim}
                    />
                  </View>
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
  outerSection: {
    width: "100%",
    backgroundColor: "#f8f6f0",
    paddingTop: 10,
    paddingBottom: 14,
  },
  trackBar: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2,
  },
  adapter: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    overflow: "hidden",
    alignItems: "center",
  },
  adapterHighlight: {
    marginTop: 4,
    width: "64%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  dot: {
    height: 6,
    borderRadius: 999,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#2f6f5e",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(41, 61, 50, 0.25)",
  },
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
  previewStage: {
    height: 215,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.bg,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ece7dc",
  },
  previewGlowPool: {
    position: "absolute",
    top: 48,
    width: 210,
    height: 155,
    borderRadius: 999,
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
