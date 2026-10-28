import { Image, Pressable, Text, View, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Heading,
  Photo,
  s,
  Screen,
  State,
  colors,
} from "../../components/ui";
import { useResource, useAction } from "../../lib/hooks";
import { list } from "../../lib/client";
import { idOf, rooms, type Board, type Product } from "../../lib/types";
export default function BoardDetail() {
  const {
    id,
    kind = "moodboards",
    mine,
  } = useLocalSearchParams<{ id: string; kind?: string; mine?: string }>();
  const source = kind === "product-spaces" ? "product-spaces" : "moodboards";
  const data = useResource<Board | Board[] | { items: Board[] }>(
    mine ? "/moodboards/user/mine" : id ? `/${source}/${encodeURIComponent(id)}` : null,
    { auth: Boolean(mine) },
  );
  const products = useResource<{ moodboardId: string; count: number; items: Product[] }>(
    !mine && source === "moodboards" && id
      ? `/moodboards/${encodeURIComponent(id)}/products`
      : null,
    { auth: false },
  );
  const action = useAction();
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
        {points.map((point, i) => (
          <Pressable
            key={point._id ?? i}
            accessibilityRole="button"
            accessibilityLabel={`Xem sản phẩm ${i + 1}`}
            onPress={() => router.push(`/products/${productId(point)}`)}
            style={{
              position: "absolute",
              left: `${Math.max(0, Math.min(100, point.x))}%`,
              top: `${Math.max(0, Math.min(100, point.y))}%`,
              transform: [{ translateX: -22 }, { translateY: -22 }],
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#ffffffdd",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: colors.green,
            }}
          >
            <Text style={{ color: colors.green, fontWeight: "700" }}>
              {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.muted}>
        Chạm vào điểm ghim để xem sản phẩm trong không gian.
      </Text>
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
      {points.map((point, i) => {
        const p =
          products.data?.items.find((product) => product._id === productId(point)) ??
          point.product ??
          (typeof point.productId === "object" ? point.productId : undefined);
        return (
          <Pressable
            accessibilityRole="button"
            key={point._id ?? i}
            style={[s.card, s.row]}
            onPress={() => router.push(`/products/${productId(point)}`)}
          >
            <View style={{ width: 75 }}>
              <Photo uri={p?.image || p?.images?.[0]} height={75} />
            </View>
            <Text style={[s.body, { flex: 1 }]}>
              {i + 1}. {p?.name ?? "Xem chi tiết sản phẩm"}
            </Text>
          </Pressable>
        );
      })}
      {!points.length && (
        <State empty="Không gian này chưa được gắn sản phẩm." />
      )}
    </Screen>
  );
}
