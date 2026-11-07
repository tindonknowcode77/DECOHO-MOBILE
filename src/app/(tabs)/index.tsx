import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  fontFamilies,
  Icon,
  MenuLink,
  Photo,
  ProductCard,
  s,
  Screen,
  Section,
  State,
} from "../../components/ui";
import { PendantLampRail } from "../../components/PendantLampRail";
import { useResource } from "../../lib/hooks";
import { list } from "../../lib/client";
import { idOf, type Board, type Product } from "../../lib/types";

export default function Home() {
  const products = useResource<Product[]>("/products");
  const boards = useResource<Board[] | { items: Board[] }>("/product-spaces", {
    auth: false,
  });

  return (
    <Screen>
      {/* Full-bleed Carousel PendantLampRail matching Web Mobile View */}
      <View style={{ marginHorizontal: -20, marginTop: -20, marginBottom: -24 }}>
        <PendantLampRail products={products.data} />
      </View>

      {/* Feature Strip ("Gom ý tưởng" / "Chọn điều phù hợp" / "Kết nối & sẻ chia") matching Web Mobile View */}
      <View
        style={{
          marginHorizontal: -20,
          backgroundColor: "#edf0e7",
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#e2e5d8",
          paddingHorizontal: 20,
          paddingVertical: 18,
          gap: 16,
        }}
      >
        {(
          [
            {
              icon: "layers-outline",
              title: "Gom ý tưởng",
              text: "Khám phá moodboard cho tổ ấm",
              route: "/boards",
            },
            {
              icon: "bed-outline",
              title: "Chọn điều phù hợp",
              text: "Tìm nội thất theo phong cách của bạn",
              route: "/explore",
            },
            {
              icon: "chatbubble-ellipses-outline",
              title: "Kết nối & sẻ chia",
              text: "Cùng cộng đồng kể chuyện không gian",
              route: "/community",
            },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            onPress={() => router.push(item.route)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={item.icon} size={24} color="#687a61" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#223329",
                  fontFamily: fontFamilies.heading,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6b7466",
                  fontFamily: fontFamilies.body,
                }}
              >
                {item.text}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Section title="Một chút mới cho nhà" href="/explore" />
      <State
        loading={products.loading}
        error={products.error}
        retry={products.reload}
        empty={
          products.data?.length === 0
            ? "Sản phẩm mới sẽ xuất hiện tại đây."
            : undefined
        }
      />
      {!!products.data?.length && (
        <View style={{ flexDirection: "row", gap: 12 }}>
          {products.data.slice(0, 2).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </View>
      )}

      <Section title="Không gian truyền cảm hứng" href="/boards" />
      <State
        loading={boards.loading}
        error={boards.error}
        retry={boards.reload}
        empty={
          boards.data && !list(boards.data).length
            ? "Chưa có moodboard công khai."
            : undefined
        }
      />
      {boards.data &&
        list(boards.data)
          .slice(0, 2)
          .map((board) => (
            <Pressable
              accessibilityRole="button"
              key={idOf(board)}
              onPress={() =>
                router.push({
                  pathname: "/boards/[id]",
                  params: { id: idOf(board), kind: "product-spaces" },
                })
              }
              style={{ gap: 10 }}
            >
              <Photo uri={board.imageUrl} height={210} />
              <Text style={s.heading}>
                {board.title ?? "Cảm hứng cho tổ ấm"}
              </Text>
            </Pressable>
          ))}
      <View style={s.card}>
        <MenuLink
          title="Showroom 3D trực quan"
          subtitle="Trải nghiệm không gian 3D tương tác"
          icon="cube-outline"
          href="/showrooms"
        />
        <MenuLink
          title="Bắt đầu từ đâu?"
          subtitle="Khám phá cách DECOHO đồng hành cùng bạn"
          icon="leaf-outline"
          href="/process"
        />
      </View>
    </Screen>
  );
}
