import * as WebBrowser from "expo-web-browser";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  colors,
  fontFamilies,
  Icon,
  Photo,
  ProductCard,
  Screen,
  State,
} from "../../components/ui";
import { useAction, useResource } from "../../lib/hooks";
import { api } from "../../lib/client";
import { useStore } from "../../lib/store";
import { money, priceOf, type Product } from "../../lib/types";

function formatDimensions(dim: Product["dimensions"]) {
  if (!dim) return undefined;
  if (typeof dim === "string") return dim.trim() || undefined;
  const parts = [dim.length, dim.width, dim.height].filter(Boolean);
  return parts.length ? parts.join(" × ") : undefined;
}

function getStyleBadge(p: Product) {
  const tags = p.tags ?? p.styleTags ?? [];
  const cat = p.category?.toLowerCase();
  const matched = tags.find((t) => {
    const lower = t.toLowerCase();
    return lower !== cat && !lower.startsWith("phòng");
  });
  return matched ?? p.brand ?? "Nội thất hiện đại";
}

function getPurchaseInfo(p: Product) {
  const raw = p.productLink?.trim();
  if (!raw) return null;
  const isShopee =
    raw.includes("shopee.vn") ||
    raw.includes("shope.ee") ||
    p.ecommercePlatform?.toLowerCase() === "shopee";
  return {
    url: raw,
    label: isShopee ? "Mua ngay trên Shopee ↗" : "Xem nơi bán ↗",
  };
}

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const product = useResource<Product>(`/products/${id}`);
  const allProducts = useResource<Product[]>("/products");
  const store = useStore();
  const favorites = useResource<string[]>(
    store.user ? "/product-favorites/ids" : null,
  );
  const action = useAction();

  const p = product.data;
  const liked = favorites.data?.includes(id);

  if (!p) {
    return (
      <Screen>
        <State
          loading={product.loading}
          error={product.error}
          retry={product.reload}
        />
      </Screen>
    );
  }

  const images = [
    ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
  ] as string[];
  const imageCardWidth = Math.max(260, width - 64);
  const styleBadge = getStyleBadge(p);
  const dimensionsText = formatDimensions(p.dimensions);
  const purchaseInfo = getPurchaseInfo(p);
  const discount = Math.min(100, Math.max(0, p.discount ?? 0));

  const specs = [
    ["Danh mục", p.category],
    ["Thương hiệu", p.brand],
    ["Chất liệu", p.material],
    ["Màu sắc", p.color],
    ["Kích thước", dimensionsText],
    ["Phong cách", (p.styleTags ?? p.tags)?.join(", ") || styleBadge],
    ["Xuất xứ", p.origin],
    ["Bảo hành", p.warranty],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  const recommended = (allProducts.data ?? [])
    .filter((item) => item._id !== p._id)
    .sort((a, b) => {
      const aMatch = a.category && a.category === p.category ? 1 : 0;
      const bMatch = b.category && b.category === p.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 4);

  return (
    <Screen>
      {/* Top Breadcrumb / Back Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.canGoBack() ? router.back() : router.push("/explore")
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#d6ded8",
            backgroundColor: "#ffffff",
          }}
        >
          <Icon name="arrow-back" size={16} color={colors.green} />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.green,
              fontFamily: fontFamilies.heading,
            }}
          >
            Quay lại catalog
          </Text>
        </Pressable>

        {!!p.category && (
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#7b7f78",
              fontFamily: fontFamilies.heading,
            }}
          >
            {p.category}
          </Text>
        )}
      </View>

      {/* Product Image Card */}
      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#ded6c9",
          padding: 12,
          gap: 12,
        }}
      >
        {images.length > 1 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {images.map((uri) => (
              <View key={uri} style={{ width: imageCardWidth }}>
                <Photo uri={uri} height={290} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <Photo uri={images[0]} height={290} />
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            paddingHorizontal: 4,
            paddingTop: 2,
          }}
        >
          <View style={{ gap: 2, flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                color: "#7b7f78",
                fontFamily: fontFamilies.heading,
              }}
            >
              Hình ảnh sản phẩm
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.ink,
                fontFamily: fontFamilies.heading,
              }}
              numberOfLines={1}
            >
              {[p.brand, p.category].filter(Boolean).join(" · ") || p.name}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#eef6f2",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.green,
                fontFamily: fontFamilies.heading,
              }}
            >
              {styleBadge}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Product Info Card */}
      <View
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#ded6c9",
          padding: 20,
          gap: 16,
        }}
      >
        {/* Badges Row */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {!!p.category && (
            <View
              style={{
                backgroundColor: "#f7f3ec",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "#6f746d",
                  fontFamily: fontFamilies.heading,
                }}
              >
                {p.category}
              </Text>
            </View>
          )}
          <View
            style={{
              backgroundColor: "#eef6f2",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                textTransform: "uppercase",
                color: colors.green,
                fontFamily: fontFamilies.heading,
              }}
            >
              {styleBadge}
            </Text>
          </View>
          {discount > 0 && (
            <View
              style={{
                backgroundColor: "#bc3d2b",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  fontFamily: fontFamilies.heading,
                }}
              >
                Giảm {discount}%
              </Text>
            </View>
          )}
        </View>

        {/* Title & Brand */}
        <View style={{ gap: 6 }}>
          <Text
            style={{
              fontSize: 25,
              fontWeight: "700",
              lineHeight: 32,
              color: colors.ink,
              fontFamily: fontFamilies.heading,
            }}
          >
            {p.name}
          </Text>
          {!!p.brand && (
            <Text
              style={{
                fontSize: 13,
                color: "#646a61",
                fontFamily: fontFamilies.body,
              }}
            >
              {p.brand}
            </Text>
          )}
        </View>

        {/* Price Block */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: 10,
            borderTopWidth: 1,
            borderColor: "#eee7dc",
            paddingTop: 16,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "700",
              color: colors.green,
              fontFamily: fontFamilies.heading,
            }}
          >
            {money(priceOf(p))}
          </Text>
          {discount > 0 && (
            <Text
              style={{
                fontSize: 14,
                color: "#848982",
                textDecorationLine: "line-through",
                fontFamily: fontFamilies.body,
              }}
            >
              {money(p.price)}
            </Text>
          )}
        </View>

        {/* Description */}
        {!!p.description && (
          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: "#5c645a",
              fontFamily: fontFamilies.body,
            }}
          >
            {p.description}
          </Text>
        )}

        {/* Quick Specs 2-Column Box (Chất liệu / Kích thước & Màu sắc) */}
        {(dimensionsText || p.material || p.color) && (
          <View
            style={{
              flexDirection: "row",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e8dfd2",
              backgroundColor: "#fcfaf6",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flex: 1,
                padding: 12,
                gap: 4,
                borderRightWidth: 1,
                borderColor: "#e8dfd2",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#51564f",
                  fontFamily: fontFamilies.heading,
                }}
              >
                {dimensionsText ? "Kích thước" : "Chất liệu"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#646a61",
                  fontFamily: fontFamilies.body,
                }}
              >
                {dimensionsText || p.material || "Đang cập nhật"}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 12, gap: 4 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#51564f",
                  fontFamily: fontFamilies.heading,
                }}
              >
                Màu sắc
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#646a61",
                  fontFamily: fontFamilies.body,
                }}
              >
                {p.color || "Tự nhiên"}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ gap: 10, paddingTop: 4 }}>
          {purchaseInfo && (
            <Button
              title={purchaseInfo.label}
              onPress={() => void WebBrowser.openBrowserAsync(purchaseInfo.url)}
            />
          )}
          <Button
            title={liked ? "Đã lưu vào yêu thích ♥" : "Lưu vào yêu thích ♡"}
            light
            busy={action.busy}
            onPress={() => {
              if (store.requireLogin())
                void action.run(async () => {
                  await api(`/product-favorites/${id}`, {
                    method: liked ? "DELETE" : "POST",
                  });
                  favorites.reload();
                });
            }}
          />
        </View>
        {!!action.error && (
          <Text style={{ fontSize: 13, color: colors.danger }}>
            {action.error}
          </Text>
        )}
      </View>

      {/* Specifications Section ("Chi tiết sản phẩm — Thông số kỹ thuật") */}
      {specs.length > 0 && (
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#ded6c9",
            padding: 20,
            gap: 14,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#b46f2c",
                fontFamily: fontFamilies.heading,
              }}
            >
              Chi tiết sản phẩm
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: colors.ink,
                fontFamily: fontFamilies.heading,
              }}
            >
              Thông số kỹ thuật
            </Text>
          </View>

          <View>
            {specs.map(([label, value], index) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  paddingVertical: 12,
                  borderBottomWidth: index === specs.length - 1 ? 0 : 1,
                  borderColor: "#eee7dc",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: "#646a61",
                    fontFamily: fontFamilies.body,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.ink,
                    fontFamily: fontFamilies.heading,
                  }}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recommended Products Section ("Sản phẩm có thể bạn sẽ thích") */}
      {recommended.length > 0 && (
        <View style={{ paddingTop: 12, gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ gap: 4, flex: 1 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#b46f2c",
                  fontFamily: fontFamilies.heading,
                }}
              >
                Phù hợp với lựa chọn của bạn
              </Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: colors.ink,
                  fontFamily: fontFamilies.heading,
                }}
              >
                Sản phẩm có thể bạn sẽ thích
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/explore")}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.green,
                  fontFamily: fontFamilies.heading,
                }}
              >
                Xem tất cả ↗
              </Text>
            </Pressable>
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {recommended.slice(0, 2).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </View>
            {recommended.length > 2 && (
              <View style={{ flexDirection: "row", gap: 12 }}>
                {recommended.slice(2, 4).map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </Screen>
  );
}
