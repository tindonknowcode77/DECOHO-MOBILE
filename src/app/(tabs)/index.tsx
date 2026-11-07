import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  fontFamilies,
  Icon,
  Photo,
  ProductCard,
  Screen,
  State,
} from "../../components/ui";
import { PendantLampRail } from "../../components/PendantLampRail";
import { useResource } from "../../lib/hooks";
import { list } from "../../lib/client";
import { idOf, type Board, type Feed, type Post, type Product } from "../../lib/types";

export default function Home() {
  const products = useResource<Product[]>("/products");
  const boards = useResource<Board[] | { items: Board[] }>("/product-spaces", {
    auth: false,
  });
  const posts = useResource<Post[] | Feed<Post>>("/community/posts", {
    auth: false,
  });

  const featuredBoards = boards.data ? list(boards.data).slice(0, 3) : [];
  const featuredProducts = products.data ? products.data.slice(0, 4) : [];
  const featuredPosts = posts.data ? list(posts.data).slice(0, 3) : [];

  return (
    <Screen>
      {/* 1. Full-bleed PendantLampRail matching Web Mobile View */}
      <View style={{ marginHorizontal: -20, marginTop: -20, marginBottom: -24 }}>
        <PendantLampRail products={products.data} />
      </View>

      {/* 2. Feature Strip ("Gom ý tưởng" / "Chọn điều phù hợp" / "Kết nối & sẻ chia") */}
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

      {/* 3. Moodboards Section ("Mỗi căn phòng, một câu chuyện") */}
      <View style={{ paddingTop: 16, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#768770",
              fontFamily: fontFamilies.heading,
            }}
          >
            Mỗi căn phòng, một câu chuyện
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              lineHeight: 30,
              color: "#223329",
              fontFamily: fontFamilies.heading,
            }}
          >
            Cảm hứng cho không gian của bạn
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/boards")}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#2f6b4f",
                fontFamily: fontFamilies.heading,
              }}
            >
              Tất cả moodboards ↗
            </Text>
          </Pressable>
        </View>

        <State
          loading={boards.loading}
          error={boards.error}
          retry={boards.reload}
          empty={
            boards.data && !featuredBoards.length
              ? "Chưa có moodboard công khai."
              : undefined
          }
        />

        {featuredBoards.map((board) => {
          const pinCount = board.productPoints?.length ?? 0;
          return (
            <Pressable
              key={idOf(board)}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/boards/[id]",
                  params: { id: idOf(board), kind: "product-spaces" },
                })
              }
              style={{ gap: 12, marginBottom: 8 }}
            >
              <Photo uri={board.imageUrl} height={240} />
              <View style={{ gap: 4 }}>
                <Text
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: "#7a8675",
                    fontFamily: fontFamilies.heading,
                  }}
                >
                  {pinCount} điểm ghim
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#223329",
                      fontFamily: fontFamilies.heading,
                    }}
                    numberOfLines={1}
                  >
                    {board.title ?? "Cảm hứng cho tổ ấm"}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#7a8675" }}>↗</Text>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 19,
                    color: "#6b7466",
                    fontFamily: fontFamilies.body,
                  }}
                  numberOfLines={2}
                >
                  {board.description || "Không gian truyền cảm hứng cho tổ ấm của bạn."}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 4. Products Section ("Chi tiết nhỏ, khác biệt lớn") */}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: "#e6e8dd",
          paddingTop: 28,
          gap: 18,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#768770",
              fontFamily: fontFamilies.heading,
            }}
          >
            Chi tiết nhỏ, khác biệt lớn
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              lineHeight: 30,
              color: "#223329",
              fontFamily: fontFamilies.heading,
            }}
          >
            Tìm mảnh ghép cho tổ ấm
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/explore")}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#2f6b4f",
                fontFamily: fontFamilies.heading,
              }}
            >
              Khám phá sản phẩm ↗
            </Text>
          </Pressable>
        </View>

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

        {!!featuredProducts.length && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {featuredProducts.slice(0, 2).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </View>
            {featuredProducts.length > 2 && (
              <View style={{ flexDirection: "row", gap: 12 }}>
                {featuredProducts.slice(2, 4).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* 5. Dark Green AI Room Section ("Căn phòng quen. Một góc nhìn khác.") */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/ai")}
        style={{
          marginTop: 12,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: "#263f34",
        }}
      >
        <View style={{ position: "relative", height: 220 }}>
          <Image
            source={require("../../../assets/ai-room.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              left: 14,
              top: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(255,255,255,0.92)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Icon name="camera-outline" size={14} color="#2f6b4f" />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: "#223329",
                fontFamily: fontFamilies.heading,
              }}
            >
              Từ không gian của bạn
            </Text>
          </View>
        </View>
        <View style={{ padding: 24, gap: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#9bc4ab",
              fontFamily: fontFamilies.heading,
            }}
          >
            Một khởi đầu mới
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              lineHeight: 30,
              color: "#ffffff",
              fontFamily: fontFamilies.heading,
            }}
          >
            Căn phòng quen.{"\n"}
            <Text style={{ fontStyle: "italic", fontWeight: "400", color: "#cde3d5" }}>
              Một góc nhìn khác.
            </Text>
          </Text>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: "rgba(230,240,234,0.82)",
              fontFamily: fontFamilies.body,
            }}
          >
            Tải ảnh căn phòng và khám phá gợi ý thiết kế cùng AI. Bắt đầu bằng chính không gian bạn đang sống.
          </Text>
        </View>
      </Pressable>

      {/* 6. Community Stories Section ("Chuyện nhà, chuyện của chúng mình") */}
      <View style={{ paddingTop: 24, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#768770",
              fontFamily: fontFamilies.heading,
            }}
          >
            Đẹp hơn khi cùng sẻ chia
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              lineHeight: 30,
              color: "#223329",
              fontFamily: fontFamilies.heading,
            }}
          >
            Chuyện nhà, chuyện của chúng mình
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/community")}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#2f6b4f",
                fontFamily: fontFamilies.heading,
              }}
            >
              Ghé thăm diễn đàn ↗
            </Text>
          </Pressable>
        </View>

        {featuredPosts.map((post) => {
          const mediaUrl = post.media?.[0]?.thumbnailUrl || post.media?.[0]?.url;
          const authorName = post.userId?.fullName || "Thành viên DECOHO";
          return (
            <Pressable
              key={post._id}
              accessibilityRole="button"
              onPress={() => router.push("/community")}
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#e4e7dc",
                backgroundColor: "#ffffff",
                overflow: "hidden",
              }}
            >
              <Photo uri={mediaUrl} height={190} />
              <View style={{ padding: 16, gap: 8 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#768770",
                    fontFamily: fontFamilies.heading,
                  }}
                >
                  {authorName}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: "#2c3a30",
                    fontFamily: fontFamilies.body,
                  }}
                  numberOfLines={3}
                >
                  {post.description || "Chia sẻ góc nhỏ ấm áp cùng cộng đồng DECOHO."}
                </Text>
                <Text
                  style={{
                    paddingTop: 4,
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#2f6b4f",
                    fontFamily: fontFamilies.heading,
                  }}
                >
                  Đọc câu chuyện ↗
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* 7. Closing Quote Section ("Tổ ấm bắt đầu từ một ý tưởng.") */}
      <View
        style={{
          marginTop: 16,
          borderTopWidth: 1,
          borderColor: "#e6e8dd",
          paddingVertical: 32,
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#768770",
            textAlign: "center",
            fontFamily: fontFamilies.heading,
          }}
        >
          Không cần hoàn hảo. Chỉ cần là bạn.
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontStyle: "italic",
            color: "#223329",
            textAlign: "center",
            fontFamily: fontFamilies.heading,
          }}
        >
          Tổ ấm bắt đầu từ một ý tưởng.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/boards")}
          style={{ paddingTop: 4 }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#2f6b4f",
              textDecorationLine: "underline",
              fontFamily: fontFamilies.heading,
            }}
          >
            Tìm ý tưởng của mình →
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
