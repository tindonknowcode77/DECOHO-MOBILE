import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  colors,
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
import { useStore } from "../../lib/store";
export default function Home() {
  const products = useResource<Product[]>("/products");
  const boards = useResource<Board[] | { items: Board[] }>("/product-spaces", { auth: false });
  const { user } = useStore();
  return (
    <Screen>
      <View style={s.between}>
        <Text style={s.muted}>
          Chào {user?.fullName?.trim().split(/\s+/).at(-1) || "bạn"}, một ngày thật đẹp!
        </Text>
        <Icon name="sunny-outline" color={colors.orange} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Tìm nội thất" onPress={() => router.push("/explore")} style={[s.input, s.between]}>
        <View style={s.row}>
          <Icon name="search-outline" size={20} />
          <Text style={s.muted}>Tìm một món đồ cho tổ ấm…</Text>
        </View>
        <Icon name="arrow-forward" size={18} />
      </Pressable>
      <PendantLampRail products={products.data} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        {(
          [
            { icon: "layers-outline", label: "Moodboard", route: "/boards" },
            { icon: "cube-outline", label: "Showroom 3D", route: "/showrooms" },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.route}
            accessibilityRole="button"
            onPress={() => router.push(item.route)}
            style={[
              s.card,
              { flex: 1, alignItems: "center", padding: 14, gap: 10 },
            ]}
          >
            <View style={{ backgroundColor: "#eef2e7", width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
              <Icon name={item.icon} size={23} />
            </View>
            <Text
              style={{ fontSize: 13, fontWeight: "600", color: colors.green, textAlign: "center" }}
            >
              {item.label}
            </Text>
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
              onPress={() => router.push({ pathname: "/boards/[id]", params: { id: idOf(board), kind: "product-spaces" } })}
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
          title="Gặp những người yêu nhà"
          subtitle="Chia sẻ ý tưởng cùng cộng đồng"
          icon="people-outline"
          href="/community"
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
