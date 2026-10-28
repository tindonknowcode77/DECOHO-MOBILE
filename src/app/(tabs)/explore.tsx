import { useState } from "react";
import { FlatList, Text, TextInput, View, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Chips,
  colors,
  Heading,
  Icon,
  ProductCard,
  s,
  State,
} from "../../components/ui";
import { useResource } from "../../lib/hooks";
import { priceOf, type Category, type Product } from "../../lib/types";
export default function Explore() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;
  const params = useLocalSearchParams<{ q?: string }>();
  const query = params.q ?? "";
  const setQuery = (q: string) => router.setParams({ q });
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [budget, setBudget] = useState("all");
  const products = useResource<Product[]>("/products");
  const categories = useResource<Category[]>("/categories");
  const chosen = categories.data?.find((item) => item.id === category);
  const ids = chosen
    ? [chosen, ...(chosen.children ?? []).filter((item) => item.isActive)]
    : [];
  const visible = (products.data ?? []).filter(
    (p) =>
      `${p.name} ${p.category ?? ""} ${p.brand ?? ""}`
        .toLocaleLowerCase("vi")
        .includes(query.trim().toLocaleLowerCase("vi")) &&
      (!chosen ||
        ids.some((c) => p.categoryId === c.id || p.category === c.name)) &&
      (budget === "all" || priceOf(p) <= Number(budget)),
  );
  if (sort === "asc") visible.sort((a, b) => priceOf(a) - priceOf(b));
  if (sort === "desc") visible.sort((a, b) => priceOf(b) - priceOf(a));
  if (sort === "rating")
    visible.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return (
    <FlatList
      style={s.page}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      data={visible}
      numColumns={2}
      keyExtractor={(p) => p._id}
      columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
      contentContainerStyle={s.content}
      refreshing={products.loading}
      onRefresh={products.reload}
      ListHeaderComponent={
        <View style={{ gap: 18, marginBottom: 12 }}>
          <Heading
            eyebrow="THE DECOHO EDIT"
            title="Đồ đẹp. Nhà xinh."
            subtitle="Tìm món đồ dành riêng cho không gian của bạn."
          />
          <View style={[s.input, s.row, { paddingVertical: 0 }]}>
          <Icon name="search-outline" size={20} color={colors.muted} />
          <TextInput
            style={{ flex: 1, minWidth: 0, minHeight: 50, color: colors.ink, fontSize: 15 }}
            accessibilityLabel="Tìm sản phẩm"
            placeholder="Tìm sản phẩm, thương hiệu…"
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={colors.muted}
          />
          </View>
          <Chips
            value={category}
            onChange={setCategory}
            items={[
              { id: "all", label: "Tất cả" },
              ...(categories.data ?? [])
                .filter((c) => c.isActive)
                .map((c) => ({ id: c.id, label: c.name })),
            ]}
          />
          <Chips
            value={sort}
            onChange={setSort}
            items={[
              { id: "featured", label: "Nổi bật" },
              { id: "asc", label: "Giá tăng dần" },
              { id: "desc", label: "Giá giảm dần" },
              { id: "rating", label: "Đánh giá cao" },
            ]}
          />
          <Chips
            value={budget}
            onChange={setBudget}
            items={[
              { id: "all", label: "Mọi mức giá" },
              { id: "500000", label: "Dưới 500 nghìn" },
              { id: "2000000", label: "Dưới 2 triệu" },
              { id: "10000000", label: "Dưới 10 triệu" },
            ]}
          />
          <Text style={s.muted}>{visible.length} sản phẩm</Text>
          {!!categories.error && (
            <State error={categories.error} retry={categories.reload} />
          )}
        </View>
      }
      ListEmptyComponent={
        <State
          loading={products.loading}
          error={products.error}
          retry={products.reload}
          empty="Chưa tìm thấy sản phẩm phù hợp."
        />
      }
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <ProductCard product={item} />
        </View>
      )}
    />
  );
}
