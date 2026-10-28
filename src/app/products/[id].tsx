import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Chips,
  colors,
  Field,
  Heading,
  Icon,
  Photo,
  s,
  Screen,
  Section,
  State,
} from "../../components/ui";
import { useAction, useResource } from "../../lib/hooks";
import { api } from "../../lib/client";
import { useStore } from "../../lib/store";
import { money, priceOf, type Product, type Review } from "../../lib/types";
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useResource<Product>(`/products/${id}`);
  const reviews = useResource<Review[]>(`/reviews?productId=${id}`);
  const store = useStore();
  const favorites = useResource<string[]>(
    store.user ? "/product-favorites/ids" : null,
  );
  const action = useAction();
  const [message, setMessage] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState("5");
  const p = product.data;
  const liked = favorites.data?.includes(id);
  if (!p)
    return (
      <Screen>
        <State
          loading={product.loading}
          error={product.error}
          retry={product.reload}
        />
      </Screen>
    );
  const images = [
    ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
  ] as string[];
  return (
    <Screen>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {images.length ? (
          images.map((uri) => (
            <View key={uri} style={{ width: 310 }}>
              <Photo uri={uri} height={300} />
            </View>
          ))
        ) : (
          <View style={{ width: 310 }}>
            <Photo height={300} />
          </View>
        )}
      </ScrollView>
      <Heading
        eyebrow={(p.category ?? "NỘI THẤT").toUpperCase()}
        title={p.name}
      />
      <View style={s.between}>
        <View>
          <Text style={[s.title, { color: colors.green }]}>
            {money(priceOf(p))}
          </Text>
          {!!p.discount && (
            <Text style={[s.muted, { textDecorationLine: "line-through" }]}>
              {money(p.price)}
            </Text>
          )}
        </View>
        <View style={s.row}>
          <Icon name="star" color="#ca9849" size={17} />
          <Text style={s.body}>
            {p.rating ?? 0} ({p.reviews ?? reviews.data?.length ?? 0})
          </Text>
        </View>
      </View>
      <Text style={s.muted}>
        {p.stock === 0 || p.status === "OUT_OF_STOCK"
          ? "Tạm hết hàng"
          : p.stock !== undefined
            ? `Còn ${p.stock} sản phẩm`
            : "Liên hệ để biết tình trạng hàng"}
      </Text>
      <Button
        title="Thêm vào giỏ hàng"
        disabled={p.stock === 0 || p.status === "OUT_OF_STOCK"}
        onPress={() =>
          action.run(async () => {
            store.add(p);
            setMessage("Đã thêm vào giỏ hàng.");
          })
        }
      />
      <Button
        title={liked ? "Đã yêu thích ♥" : "Lưu vào yêu thích ♡"}
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
      {!!message && (
        <View style={s.card}>
          <Text style={s.body}>{message}</Text>
          <Button
            light
            title="Xem giỏ hàng"
            onPress={() => router.push("/cart")}
          />
        </View>
      )}
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      <View style={s.card}>
        <Section title="Chi tiết sản phẩm" />
        <Text style={s.body}>
          {p.description || "Chưa có mô tả cho sản phẩm này."}
        </Text>
        {[
          ["Thương hiệu", p.brand],
          ["Chất liệu", p.material],
          ["Màu sắc", p.color],
          ["Phong cách", p.styleTags?.join(", ")],
        ]
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <View key={label} style={s.between}>
              <Text style={s.muted}>{label}</Text>
              <Text style={[s.body, { flexShrink: 1 }]}>{value}</Text>
            </View>
          ))}
      </View>
      <Section title="Đánh giá từ cộng đồng" />
      <State
        loading={reviews.loading}
        error={reviews.error}
        retry={reviews.reload}
        empty={
          reviews.data?.length === 0
            ? "Hãy là người đầu tiên chia sẻ trải nghiệm."
            : undefined
        }
      />
      {reviews.data?.map((review) => (
        <View style={s.card} key={review._id}>
          <Text style={s.body}>
            {review.userId?.fullName ?? "Khách hàng"} ·{" "}
            {"★".repeat(review.rating)}
          </Text>
          <Text style={s.muted}>{review.content}</Text>
        </View>
      ))}
      <View style={s.card}>
        <Text style={s.heading}>Trải nghiệm của bạn</Text>
        <Chips
          value={rating}
          onChange={setRating}
          items={[1, 2, 3, 4, 5].map((n) => ({
            id: String(n),
            label: `${n} ★`,
          }))}
        />
        <Field
          label="Nội dung đánh giá"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={3000}
        />
        <Button
          title="Gửi đánh giá"
          busy={action.busy}
          onPress={() => {
            if (store.requireLogin())
              void action.run(async () => {
                if (!content.trim())
                  throw new Error("Vui lòng nhập nội dung đánh giá.");
                await api("/reviews", {
                  method: "POST",
                  body: {
                    productId: id,
                    rating: Number(rating),
                    content: content.trim(),
                  },
                });
                setContent("");
                setMessage("Đã gửi đánh giá.");
                reviews.reload();
              });
          }}
        />
      </View>
    </Screen>
  );
}
