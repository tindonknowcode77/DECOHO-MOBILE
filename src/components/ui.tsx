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
  bg: "#f8f6f1",
  green: "#245c48",
  ink: "#20382d",
  muted: "#666e63",
  lime: "#d9e8b8",
  line: "#e5e5da",
  white: "#ffffff",
  orange: "#c77b57",
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
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 35,
  },
  heading: { fontSize: 20, color: colors.ink, fontWeight: "700" },
  body: { fontSize: 15, lineHeight: 23, color: colors.ink },
  muted: { fontSize: 13, lineHeight: 21, color: colors.muted },
  label: {
    color: colors.green,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    color: colors.ink,
    minHeight: 50,
  },
  button: {
    backgroundColor: colors.green,
    minHeight: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  error: { color: "#a34131", fontSize: 14, lineHeight: 21 },
  chip: {
    borderRadius: 24,
    paddingHorizontal: 17,
    paddingVertical: 12,
    backgroundColor: "#ebece2",
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={product.name}
      onPress={() => router.push(`/products/${product._id}`)}
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 8,
        gap: 8,
        borderWidth: 1,
        borderColor: colors.line,
      }}
    >
      <Photo uri={product.image ?? product.images?.[0]} height={155} />
      <View style={{ padding: 6, gap: 6 }}>
        <Text style={s.muted} numberOfLines={1}>
          {product.category ?? "Nội thất"}
        </Text>
        <Text
          numberOfLines={2}
          style={{ color: colors.ink, fontWeight: "600", fontSize: 15, lineHeight: 21, minHeight: 42 }}
        >
          {product.name}
        </Text>
        <Text style={{ color: colors.green, fontWeight: "700" }}>
          {money(priceOf(product))}
        </Text>
        {!!product.discount && (
          <Text
            style={{
              color: colors.muted,
              textDecorationLine: "line-through",
              fontSize: 11,
            }}
          >
            {money(product.price)}
          </Text>
        )}
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
      {items.map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: item.id === value }}
          key={item.id}
          onPress={() => onChange(item.id)}
          style={[
            s.chip,
            item.id === value && { backgroundColor: colors.green },
          ]}
        >
          <Text
            style={{
              color: item.id === value ? "#fff" : colors.green,
              fontSize: 13,
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
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
          <Text style={s.body}>{title}</Text>
          {subtitle && <Text style={s.muted}>{subtitle}</Text>}
        </View>
      </View>
      <Icon name="chevron-forward" size={17} />
    </Pressable>
  );
}
