import { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Chips,
  colors,
  fontFamilies,
  Heading,
  Icon,
  ProductCard,
  s,
  State,
} from "../../components/ui";
import { useResource } from "../../lib/hooks";
import { priceOf, type Category, type Product } from "../../lib/types";

const PAGE_SIZE = 10;

export default function Explore() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;
  const listRef = useRef<FlatList<Product>>(null);
  const params = useLocalSearchParams<{ q?: string }>();
  const query = params.q ?? "";
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [budget, setBudget] = useState("all");
  const [page, setPage] = useState(1);

  const setQuery = (q: string) => {
    setPage(1);
    router.setParams({ q });
  };

  const products = useResource<Product[]>("/products");
  const categories = useResource<Category[]>("/categories");
  const chosen = categories.data?.find((item) => item.id === category);
  const ids = chosen
    ? [chosen, ...(chosen.children ?? []).filter((item) => item.isActive)]
    : [];

  const filtered = (products.data ?? []).filter(
    (p) =>
      `${p.name} ${p.category ?? ""} ${p.brand ?? ""}`
        .toLocaleLowerCase("vi")
        .includes(query.trim().toLocaleLowerCase("vi")) &&
      (!chosen ||
        ids.some((c) => p.categoryId === c.id || p.category === c.name)) &&
      (budget === "all" || priceOf(p) <= Number(budget)),
  );

  if (sort === "asc") filtered.sort((a, b) => priceOf(a) - priceOf(b));
  if (sort === "desc") filtered.sort((a, b) => priceOf(b) - priceOf(a));
  if (sort === "rating")
    filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const changePage = (next: number) => {
    const target = Math.min(totalPages, Math.max(1, next));
    setPage(target);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  return (
    <FlatList
      ref={listRef}
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
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 50,
                color: colors.ink,
                fontSize: 15,
              }}
              accessibilityLabel="Tìm sản phẩm"
              placeholder="Tìm sản phẩm, thương hiệu…"
              value={query}
              onChangeText={setQuery}
              placeholderTextColor={colors.muted}
            />
          </View>
          <Chips
            value={category}
            onChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
            items={[
              { id: "all", label: "Tất cả" },
              ...(categories.data ?? [])
                .filter((c) => c.isActive)
                .map((c) => ({ id: c.id, label: c.name })),
            ]}
          />
          <Chips
            value={sort}
            onChange={(val) => {
              setSort(val);
              setPage(1);
            }}
            items={[
              { id: "featured", label: "Nổi bật" },
              { id: "asc", label: "Giá tăng dần" },
              { id: "desc", label: "Giá giảm dần" },
              { id: "rating", label: "Đánh giá cao" },
            ]}
          />
          <Chips
            value={budget}
            onChange={(val) => {
              setBudget(val);
              setPage(1);
            }}
            items={[
              { id: "all", label: "Mọi mức giá" },
              { id: "500000", label: "Dưới 500 nghìn" },
              { id: "2000000", label: "Dưới 2 triệu" },
              { id: "10000000", label: "Dưới 10 triệu" },
            ]}
          />
          <Text style={s.muted}>
            {filtered.length} sản phẩm
            {filtered.length > 0
              ? ` · Hiển thị ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} (Trang ${currentPage}/${totalPages})`
              : ""}
          </Text>
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
      ListFooterComponent={
        !products.loading && !products.error && totalPages > 1 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 8,
              paddingTop: 16,
              paddingBottom: 8,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Trang trước"
              disabled={currentPage === 1}
              onPress={() => changePage(currentPage - 1)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                borderWidth: 1,
                borderColor: "#dfe4d2",
                backgroundColor: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
                opacity: currentPage === 1 ? 0.35 : 1,
              }}
            >
              <Icon name="chevron-back" size={16} color={colors.ink} />
            </Pressable>

            {pageNumbers.map((p, index) => {
              const prev = pageNumbers[index - 1];
              const showEllipsis = index > 0 && prev !== undefined && p - prev > 1;
              const active = currentPage === p;
              return (
                <View
                  key={p}
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  {showEllipsis && (
                    <Text style={{ color: "#a0a890", fontSize: 13 }}>…</Text>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Trang ${p}`}
                    onPress={() => changePage(p)}
                    style={{
                      minWidth: 38,
                      height: 38,
                      paddingHorizontal: 10,
                      borderRadius: 19,
                      backgroundColor: active ? colors.green : "#ffffff",
                      borderWidth: active ? 0 : 1,
                      borderColor: "#dfe4d2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: active ? "#ffffff" : "#687a61",
                        fontFamily: fontFamilies.heading,
                      }}
                    >
                      {p}
                    </Text>
                  </Pressable>
                </View>
              );
            })}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Trang sau"
              disabled={currentPage === totalPages}
              onPress={() => changePage(currentPage + 1)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                borderWidth: 1,
                borderColor: "#dfe4d2",
                backgroundColor: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
                opacity: currentPage === totalPages ? 0.35 : 1,
              }}
            >
              <Icon name="chevron-forward" size={16} color={colors.ink} />
            </Pressable>
          </View>
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <ProductCard product={item} />
        </View>
      )}
    />
  );
}
