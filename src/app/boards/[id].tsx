import { useState } from "react";
import { Image, Pressable, Text, View, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Heading,
  Photo,
  s,
  Screen,
  State,
  colors, Icon,
} from "../../components/ui";
import { useResource, useAction } from "../../lib/hooks";
import { list } from "../../lib/client";
import { idOf, rooms, money, priceOf, type Board, type Product } from "../../lib/types";
export default function BoardDetail() {
  const {
    id,
    kind = "product-spaces",
    mine,
  } = useLocalSearchParams<{ id: string; kind?: string; mine?: string }>();
  const source = kind === "product-spaces" ? "product-spaces" : "moodboards";
  const data = useResource<Board | Board[] | { items: Board[] }>(
    mine ? "/product-spaces/mine" : id ? `/${source}/${encodeURIComponent(id)}` : null,
    { auth: Boolean(mine) },
  );
  const products = useResource<{ moodboardId: string; count: number; items: Product[] }>(
    !mine && source === "moodboards" && id
      ? `/moodboards/${encodeURIComponent(id)}/products`
      : null,
    { auth: false },
  );
  const action = useAction();
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const board = data.data
    ? mine
      ? list(data.data as Board[]).find((x) => idOf(x) === id)
      : (data.data as Board)
    : undefined;
  if (!board)
    return (
      <Screen>
        <State
          loading={data.loading}
          error={data.error}
          retry={data.reload}
          empty="Không tìm thấy không gian này."
        />
      </Screen>
    );
  const points = (board.productPoints ?? []).filter((point) =>
    Boolean(typeof point.productId === "string" ? point.productId : point.productId?._id),
  );
  const ratio =
    board.imageWidth && board.imageHeight
      ? board.imageWidth / board.imageHeight
      : 1;
  const productId = (point: (typeof points)[number]) =>
    typeof point.productId === "string" ? point.productId : point.productId._id;
  return (
    <Screen>
      <Heading
        eyebrow={rooms[board.roomType] ?? board.roomType}
        title={board.title ?? "Cảm hứng cho tổ ấm"}
        subtitle={board.description}
      />
      <View
        style={{
          aspectRatio: ratio,
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: colors.line,
        }}
      >
        <Image
          source={{ uri: board.imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="stretch"
        />
        {points.map((point, i) => {
          const isSelected = selectedPointIndex === i;
          const dotSize = isSelected ? 18 : 13;
          return (
            <Pressable
              key={point._id ?? i}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Xem sản phẩm ${i + 1}`}
              onPress={() => setSelectedPointIndex(isSelected ? null : i)}
              style={{
                position: "absolute",
                left: `${Math.max(0, Math.min(100, point.x))}%`,
                top: `${Math.max(0, Math.min(100, point.y))}%`,
                transform: [
                  { translateX: -dotSize / 2 },
                  { translateY: -dotSize / 2 },
                ],
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: isSelected ? colors.green : "#ef6e61",
                borderWidth: 2,
                borderColor: "#ffffff",
                shadowColor: "#000",
                shadowOpacity: isSelected ? 0.35 : 0.22,
                shadowRadius: 4,
                elevation: isSelected ? 6 : 3,
                zIndex: isSelected ? 10 : 2,
              }}
            />
          );
        })}
      </View>
      <Text style={s.muted}>
        Chạm vào chấm tròn trên ảnh để xem nhanh thông tin món đồ.
      </Text>

      {/* Thẻ xem nhanh món đồ được chạm (Quick preview active pin) */}
      {selectedPointIndex !== null && points[selectedPointIndex] && (() => {
        const pt = points[selectedPointIndex];
        const p =
          products.data?.items.find((prod) => prod._id === productId(pt)) ??
          pt.product ??
          (typeof pt.productId === "object" ? pt.productId : undefined);
        return (
          <View
            style={[
              s.card,
              {
                backgroundColor: "#fff",
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: colors.green,
                padding: 14,
                gap: 12,
                shadowColor: colors.green,
                shadowOpacity: 0.12,
                shadowRadius: 10,
                elevation: 4,
              },
            ]}
          >
            <View style={s.between}>
              <View style={s.row}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.green,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 11 }}>
                    {selectedPointIndex + 1}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#708164", textTransform: "uppercase" }}>
                  Món đồ được chọn trong phòng
                </Text>
              </View>
              <Pressable
                hitSlop={8}
                onPress={() => setSelectedPointIndex(null)}
                style={{ padding: 4 }}
              >
                <Icon name="close" size={18} color={colors.muted} />
              </Pressable>
            </View>

            <View style={s.row}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  overflow: "hidden",
                  backgroundColor: "#f0ede4",
                }}
              >
                <Photo uri={p?.image || p?.images?.[0]} height={72} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                {p?.category && (
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#708164", textTransform: "uppercase" }}>
                    {p.category}
                  </Text>
                )}
                <Text style={[s.body, { fontWeight: "700", color: colors.ink }]} numberOfLines={2}>
                  {p?.name ?? "Sản phẩm nội thất"}
                </Text>
                {p?.price !== undefined && (
                  <Text style={{ fontSize: 14, fontWeight: "800", color: colors.green }}>
                    {money(priceOf(p))}
                  </Text>
                )}
              </View>
            </View>

            <Button
              title="Xem chi tiết sản phẩm  ↗"
              onPress={() => router.push(`/products/${productId(pt)}`)}
            />
          </View>
        );
      })()}

      <Button
        title="Chia sẻ cảm hứng"
        light
        onPress={() =>
          action.run(async () => {
            await Share.share({
              message: `${board.title ?? "DECOHO"}\n${board.imageUrl}`,
            });
          })
        }
      />
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      <State loading={products.loading} error={products.error} retry={products.reload} />

      <View style={{ gap: 10 }}>
        <Text style={s.heading}>
          Sản phẩm trong moodboard ({points.length})
        </Text>
        {points.map((point, i) => {
          const p =
            products.data?.items.find((product) => product._id === productId(point)) ??
            point.product ??
            (typeof point.productId === "object" ? point.productId : undefined);
          const isSelected = selectedPointIndex === i;
          return (
            <Pressable
              accessibilityRole="button"
              key={point._id ?? i}
              style={[
                s.card,
                s.row,
                {
                  backgroundColor: isSelected ? "#f0f6f3" : "#fff",
                  borderRadius: 18,
                  padding: 12,
                  gap: 14,
                  borderWidth: isSelected ? 1.5 : 1,
                  borderColor: isSelected ? colors.green : colors.line,
                },
              ]}
              onPress={() => setSelectedPointIndex(isSelected ? null : i)}
            >
              <View style={{ width: 68, height: 68, borderRadius: 14, overflow: "hidden", backgroundColor: "#f0ede4" }}>
                <Photo uri={p?.image || p?.images?.[0]} height={68} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <View style={s.row}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: isSelected ? colors.green : colors.lime,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#fff" : colors.green,
                        fontWeight: "800",
                        fontSize: 10,
                      }}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  {p?.category && (
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#708164", textTransform: "uppercase" }}>
                      {p.category}
                    </Text>
                  )}
                </View>
                <Text style={[s.body, { fontWeight: "700", color: colors.ink }]} numberOfLines={1}>
                  {p?.name ?? "Xem chi tiết sản phẩm"}
                </Text>
                {p?.price !== undefined && (
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.green }}>
                    {money(priceOf(p))}
                  </Text>
                )}
              </View>
              <Icon
                name="chevron-forward"
                size={18}
                color={isSelected ? colors.green : colors.muted}
              />
            </Pressable>
          );
        })}
      </View>
      {!points.length && (
        <State empty="Không gian này chưa được gắn sản phẩm." />
      )}
    </Screen>
  );
}
