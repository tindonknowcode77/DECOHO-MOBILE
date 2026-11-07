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

/**
 * Renders the 3D Cumulus Cloud Pendant Lamp natively on Android, iOS, and Web
 * with smooth cross-fade between switched-off white cloud puffs and warm golden internal light.
 */
function CloudLampGraphic({
  width,
  height,
  lit,
}: {
  width: number;
  height: number;
  lit: number;
}) {
  const cordW = Math.max(1.5, width * 0.022);
  const cordH = height * 0.35;
  const cloudTop = height * 0.31;
  const cloudW = width * 0.82;
  const cloudH = height * 0.32;
  const left = (width - cloudW) / 2;

  const puffs = [
    { x: 0.06, y: 0.28, w: 0.44, h: 0.56 },
    { x: 0.5, y: 0.28, w: 0.44, h: 0.56 },
    { x: 0.18, y: 0.08, w: 0.42, h: 0.56 },
    { x: 0.4, y: 0.08, w: 0.42, h: 0.56 },
    { x: 0.3, y: 0.0, w: 0.4, h: 0.52 },
    { x: 0.08, y: 0.24, w: 0.84, h: 0.62 },
  ];

  return (
    <View style={{ width, height }} pointerEvents="none">
      {/* Upper internal cord matching CORD_BG */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: (width - cordW) / 2,
          width: cordW,
          height: cordH,
          backgroundColor: "#2b2b2b",
        }}
      />

      {/* Cloud container */}
      <View
        style={{
          position: "absolute",
          top: cloudTop,
          left,
          width: cloudW,
          height: cloudH,
        }}
      >
        {/* Soft under-shadow */}
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

        {/* Off-state white/slate cloud puffs */}
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
              borderColor: "rgba(203,213,225,0.55)",
            }}
          />
        ))}

        {/* On-state warm golden glow puffs */}
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
          {/* Inner warm amber core */}
          <View
            style={{
              position: "absolute",
              left: cloudW * 0.18,
              top: cloudH * 0.22,
              width: cloudW * 0.64,
              height: cloudH * 0.55,
              borderRadius: cloudW,
              backgroundColor: "#fde68a",
              opacity: 0.85,
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
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [dims, setDims] = useState<number[]>(() =>
    LAMP_DEMO_ITEMS.map(() => 1),
  );
  const [swings, setSwings] = useState<number[]>(() =>
    LAMP_DEMO_ITEMS.map(() => 0),
  );
  const velocities = useRef<number[]>(LAMP_DEMO_ITEMS.map(() => 0));
  const angles = useRef<number[]>(LAMP_DEMO_ITEMS.map(() => 0));

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
  const padX = Math.max(8, stageWidth * 0.025);
  const slotSpan = (stageWidth - padX * 2) / count;
  const lampW = Math.min(118, Math.max(40, slotSpan * 0.94));
  const lampH = lampW * 1.5;
  const maxCord = lampH * 0.68;
  const trackTop = 10;
  const trackH = Math.max(5, Math.round(lampW * 0.085));
  const adapterW = Math.max(10, Math.round(lampW * 0.2));
  const adapterH = Math.max(7, Math.round(trackH * 1.45));
  const pivotY = trackTop + trackH - 1;
  const stageHeight = Math.round(pivotY + adapterH + maxCord + lampH * 0.96);

  const nudgeLamp = (index: number, impulse: number) => {
    if (index < 0 || index >= count) return;
    velocities.current[index] = Math.max(
      -28,
      Math.min(28, (velocities.current[index] ?? 0) + impulse),
    );
    if (index > 0) {
      velocities.current[index - 1] =
        (velocities.current[index - 1] ?? 0) + impulse * 0.25;
    }
    if (index + 1 < count) {
      velocities.current[index + 1] =
        (velocities.current[index + 1] ?? 0) + impulse * 0.25;
    }
  };

  // Autoplay lights lamps one by one until the user interacts
  useEffect(() => {
    if (!autoplay || openIndex !== null) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev === null ? 0 : (prev + 1) % count;
        nudgeLamp(next, 6);
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, [autoplay, openIndex, count]);

  // Simple damped pendulum simulation
  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    const step = () => {
      const now = Date.now();
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      let moving = false;
      for (let i = 0; i < count; i++) {
        const drop = items[i]?.drop ?? 0.8;
        const omega = 5.2 / Math.sqrt(Math.max(0.55, drop));
        let a = angles.current[i] ?? 0;
        let v = velocities.current[i] ?? 0;
        v += -omega * omega * a * dt;
        v *= Math.exp(-2.2 * dt);
        a += v * dt;
        if (Math.abs(a) > 0.08 || Math.abs(v) > 0.08) {
          moving = true;
        } else {
          a = 0;
          v = 0;
        }
        angles.current[i] = a;
        velocities.current[i] = v;
      }
      if (moving) {
        setSwings([...angles.current]);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [count, items]);

  const indexFromX = (x: number) => {
    const idx = Math.floor((x - padX) / slotSpan);
    return Math.max(0, Math.min(count - 1, idx));
  };

  const lastTouchIndex = useRef<number>(-1);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: (evt) => {
          setAutoplay(false);
          const idx = indexFromX(evt.nativeEvent.locationX);
          lastTouchIndex.current = idx;
          setActiveIndex(idx);
          nudgeLamp(idx, 8);
        },
        onPanResponderMove: (evt, g) => {
          const idx = indexFromX(evt.nativeEvent.locationX);
          if (idx !== lastTouchIndex.current) {
            lastTouchIndex.current = idx;
            setActiveIndex(idx);
            nudgeLamp(idx, g.vx > 0 ? 10 : -10);
          }
        },
      }),
    [padX, slotSpan, count],
  );

  const openItem = openIndex !== null ? items[openIndex] : null;
  const openDim = openIndex !== null ? (dims[openIndex] ?? 1) : 1;

  return (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - stageWidth) > 1) setStageWidth(w);
      }}
      style={[
        styles.container,
        {
          height: stageHeight,
          marginHorizontal: -20,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Warm ambient glow pool behind the active lamp */}
      {activeIndex !== null && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left:
              padX +
              (activeIndex + 0.5) * slotSpan -
              Math.max(70, lampW * 1.35),
            top:
              pivotY +
              maxCord * (items[activeIndex]?.drop ?? 0.8) +
              lampH * 0.25,
            width: Math.max(140, lampW * 2.7),
            height: Math.max(110, lampH * 1.25),
            borderRadius: 999,
            backgroundColor: items[activeIndex]?.glow ?? "#ffe29a",
            opacity: 0.32 * (dims[activeIndex] ?? 1),
          }}
        />
      )}

      {/* Brushed horizontal metallic track */}
      <View
        pointerEvents="none"
        style={[
          styles.trackOuter,
          {
            top: trackTop,
            height: trackH,
            left: Math.max(4, padX * 0.35),
            right: Math.max(4, padX * 0.35),
          },
        ]}
      >
        <LinearGradient
          colors={["#9ba699", "#6d786c", "#424a42"]}
          style={StyleSheet.absoluteFill}
        />
        {/* Left & Right end caps */}
        <View
          style={[
            styles.trackCap,
            {
              left: -2,
              width: Math.max(7, trackH * 1.25),
              height: trackH * 1.85,
              top: -trackH * 0.42,
            },
          ]}
        />
        <View
          style={[
            styles.trackCap,
            {
              right: -2,
              width: Math.max(7, trackH * 1.25),
              height: trackH * 1.85,
              top: -trackH * 0.42,
            },
          ]}
        />
      </View>

      {/* Hanging Pendant Lamps */}
      {items.map((item, i) => {
        const isLit = activeIndex === i;
        const litVal = isLit ? (dims[i] ?? 1) : 0.12;
        const cordLen = Math.round(maxCord * item.drop);
        const centerX = padX + (i + 0.5) * slotSpan;
        const swingDeg = swings[i] ?? 0;
        const cordW = Math.max(1.5, lampW * 0.022);

        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onHoverIn={
              Platform.OS === "web"
                ? () => {
                    setAutoplay(false);
                    setActiveIndex(i);
                    nudgeLamp(i, 7);
                  }
                : undefined
            }
            onPress={() => {
              setAutoplay(false);
              setActiveIndex(i);
              nudgeLamp(i, 9);
              setOpenIndex(i);
            }}
            style={{
              position: "absolute",
              top: pivotY - Math.round(adapterH * 0.35),
              left: centerX - lampW / 2,
              width: lampW,
              height: adapterH + cordLen + lampH * 0.84,
              zIndex: isLit ? 20 : 10,
              alignItems: "center",
            }}
          >
            {/* Track Adapter */}
            <View
              style={[
                styles.adapter,
                {
                  width: adapterW,
                  height: adapterH,
                },
              ]}
            >
              <View style={styles.adapterHighlight} />
            </View>

            {/* Swinging Pendulum Group */}
            <View
              style={{
                width: lampW,
                height: cordLen + lampH,
                alignItems: "center",
                transform: [{ rotate: `${swingDeg.toFixed(2)}deg` }],
              }}
            >
              {/* Cord from track adapter to lamp photo */}
              <View
                style={{
                  width: cordW,
                  height: cordLen + 2,
                  backgroundColor: "#262626",
                }}
              />

              {/* Lamp Photo (Off + On cross-fade) */}
              <View
                style={{
                  position: "absolute",
                  top: cordLen,
                  width: lampW,
                  height: lampH,
                }}
              >
                <LampVisual
                  item={item}
                  width={lampW}
                  height={lampH}
                  lit={litVal}
                />
              </View>
            </View>
          </Pressable>
        );
      })}

      {/* Detail & Dimmer Modal when user taps a lamp */}
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
                {/* Header row */}
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

                {/* Lamp Preview with Live Dimmer Glow */}
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

                {/* Dimmer Control */}
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

                {/* Product Info */}
                <Text style={styles.modalTitle}>{openItem.name}</Text>
                <Text style={styles.modalDesc}>{openItem.description}</Text>

                <View style={styles.detailTagsRow}>
                  {openItem.details.map((d) => (
                    <View key={d} style={styles.detailPill}>
                      <Text style={styles.detailPillText}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Real Product Card */}
                <View style={styles.realProductRow}>
                  <Image
                    source={{ uri: openItem.productImage }}
                    style={styles.realProductThumb}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.realProductEyebrow}>
                      SẢN PHẨM THỰC TẾ TRÊN DECOHO
                    </Text>
                    <Text numberOfLines={1} style={styles.realProductName}>
                      {openItem.name}
                    </Text>
                    <Text style={styles.realProductPrice}>{openItem.tag}</Text>
                  </View>
                </View>

                {/* Actions */}
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
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  trackOuter: {
    position: "absolute",
    borderRadius: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  trackCap: {
    position: "absolute",
    borderRadius: 2,
    backgroundColor: "#5e685d",
    borderWidth: 0.5,
    borderColor: "#3e463e",
  },
  adapter: {
    backgroundColor: "#636e62",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    alignItems: "center",
    paddingTop: 2,
  },
  adapterHighlight: {
    width: "64%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
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
