import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useStore } from "../lib/store";
import { money, priceOf, type Product } from "../lib/types";

export const colors = {
  bg: "#f7f3ec",
  green: "#2e6f5e",
  greenDark: "#245747",
  ink: "#254f43",
  muted: "#646a61",
  lime: "#dfe8d3",
  limeBright: "#cbe782",
  line: "#ded6c9",
  white: "#ffffff",
  orange: "#c77b57",
  badgeBg: "#fbf3e7",
  badgeText: "#9f663d",
};

export const fontFamilies = {
  body: Platform.select({
    web: 'Calibri, Carlito, "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    ios: "System",
    android: "sans-serif",
  }),
  heading: Platform.select({
    web: 'Calibri, Carlito, "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    ios: "System",
    android: "sans-serif",
  }),
};

export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
    lineHeight: 34,
    fontFamily: fontFamilies.heading,
  },
  heading: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: "700",
    letterSpacing: -0.4,
    fontFamily: fontFamilies.heading,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
    fontFamily: fontFamilies.body,
  },
  muted: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muted,
    fontFamily: fontFamilies.body,
  },
  label: {
    color: colors.green,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: "700",
    fontFamily: fontFamilies.heading,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: "#253c2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fontFamilies.body,
    minHeight: 48,
  },
  button: {
    backgroundColor: colors.green,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
    fontFamily: fontFamilies.heading,
  },
  error: {
    color: "#a34131",
    fontSize: 13,
    lineHeight: 19,
    fontFamily: fontFamilies.body,
  },
  chip: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  divider: { height: 1, backgroundColor: colors.line },
});
export function Icon({
  name,
  size = 22,
  color = colors.green,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: any;
}) {
  return <Ionicons name={name} size={size} color={color ?? colors.green} />;
}
export function Button({
  title,
  onPress,
  busy,
  disabled,
  light = false,
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  light?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy || disabled}
      onPress={onPress}
      accessibilityState={{ disabled: Boolean(busy || disabled), busy: Boolean(busy) }}
      style={({ pressed }) => [
        s.button,
        light && { backgroundColor: colors.lime },
        (busy || disabled) && { opacity: 0.5 },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={light ? colors.green : "#fff"} />
      ) : (
        <Text style={[s.buttonText, light && { color: colors.green }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={name} />
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Text style={[s.muted, { color: colors.ink }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        style={[
          s.input,
          focused && { borderColor: colors.green, backgroundColor: "#fcfdf9" },
          props.multiline && { minHeight: 110, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );
}
export function Heading({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <View style={{ gap: 9 }}>
      {eyebrow && <Text style={s.label}>{eyebrow}</Text>}
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.muted}>{subtitle}</Text>}
    </View>
  );
}
export function Section({ title, href }: { title: string; href?: Href }) {
  return (
    <View style={s.between}>
      <Text style={[s.heading, { flex: 1 }]}>{title}</Text>
      {href && (
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push(href)}
          style={{ paddingVertical: 12 }}
        >
          <Text style={{ color: colors.green, fontSize: 12 }}>
            Xem tất cả →
          </Text>
        </Pressable>
      )}
    </View>
  );
}
export function Photo({
  uri,
  source,
  height = 200,
}: {
  uri?: string;
  source?: ImageSourcePropType;
  height?: number;
}) {
  const [failed, setFailed] = useState<string>();
  return source || (uri && failed !== uri) ? (
    <Image
      source={source ?? { uri }}
      onError={() => setFailed(uri)}
      style={{
        width: "100%",
        height,
        borderRadius: 18,
        backgroundColor: "#e8e8dd",
      }}
      resizeMode="cover"
    />
  ) : (
    <View
      style={{
        height,
        backgroundColor: "#e8e8dd",
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name="leaf-outline" size={38} />
    </View>
  );
}
export function State({
  loading,
  error,
  empty,
  retry,
}: {
  loading?: boolean;
  error?: string;
  empty?: string;
  retry?: () => void;
}) {
  if (loading)
    return (
      <View style={{ padding: 30, gap: 12 }}>
        <ActivityIndicator color={colors.green} />
        <Text style={[s.muted, { textAlign: "center" }]}>Đang tải…</Text>
      </View>
    );
  if (error)
    return (
      <View style={s.card}>
        <Icon name="cloud-offline-outline" />
        <Text style={s.error}>{error}</Text>
        {retry && <Button title="Thử lại" onPress={retry} light />}
      </View>
    );
  return empty ? (
    <View style={[s.card, { alignItems: "center", padding: 30 }]}>
      <Icon name="leaf-outline" size={32} />
      <Text style={s.muted}>{empty}</Text>
    </View>
  ) : null;
}
export function AuthGate({ children }: { children: ReactNode }) {
  const store = useStore();
  if (!store.ready) return <State loading />;
  if (!store.user)
    return (
      <Screen>
        <Heading
          title="Góc riêng của bạn"
          subtitle="Đăng nhập để lưu những điều yêu thích và tiếp tục hành trình cùng DECOHO."
        />
        <Button title="Đăng nhập" onPress={() => router.push("/auth/login")} />
        <Button
          title="Tạo tài khoản"
          onPress={() => router.push("/auth/register")}
          light
        />
      </Screen>
    );
  return children;
}
export function ProductCard({ product }: { product: Product }) {
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={() => router.push(`/products/${product._id}`)}
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.line,
        position: "relative",
      }}
    >
      {hasDiscount && (
        <View
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            backgroundColor: colors.badgeBg,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 10,
            zIndex: 2,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: colors.badgeText,
              fontFamily: fontFamilies.heading,
            }}
          >
            −{product.discount}%
          </Text>
        </View>
      )}
      <Photo uri={product.image ?? product.images?.[0]} height={155} />
      <View style={{ padding: 6, gap: 5 }}>
        <Text
          style={[
            s.muted,
            {
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontFamily: fontFamilies.body,
            },
          ]}
          numberOfLines={1}
        >
          {product.category ?? "Nội thất"}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: colors.ink,
            fontWeight: "600",
            fontSize: 14,
            lineHeight: 20,
            minHeight: 40,
            fontFamily: fontFamilies.heading,
          }}
        >
          {product.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: 6,
            marginTop: 2,
          }}
        >
          <Text
            style={{
              color: colors.green,
              fontWeight: "700",
              fontSize: 14,
              fontFamily: fontFamilies.heading,
            }}
          >
            {money(priceOf(product))}
          </Text>
          {hasDiscount && (
            <Text
              style={{
                color: "#9c9e90",
                textDecorationLine: "line-through",
                fontSize: 11,
                fontFamily: fontFamilies.body,
              }}
            >
              {money(product.price)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
export function Chips({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      keyboardShouldPersistTaps="handled"
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[
              s.chip,
              active && {
                backgroundColor: colors.green,
                borderColor: colors.green,
              },
            ]}
          >
            <Text
              style={{
                color: active ? "#fff" : colors.muted,
                fontWeight: active ? "700" : "500",
                fontSize: 13,
                fontFamily: active ? fontFamilies.heading : fontFamilies.body,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
export function MenuLink({
  title,
  subtitle,
  icon,
  href,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  href: Href;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={[s.between, { paddingVertical: 12 }]}
    >
      <View style={[s.row, { flex: 1 }]}>
        <Icon name={icon} />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              s.body,
              { fontWeight: "600", fontFamily: fontFamilies.heading },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[s.muted, { fontFamily: fontFamilies.body }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Icon name="chevron-forward" size={17} />
    </Pressable>
  );
}
