import { View } from "react-native";
import {
  AuthGate,
  Heading,
  ProductCard,
  Screen,
  State,
} from "../components/ui";
import { useResource } from "../lib/hooks";
import type { Product } from "../lib/types";
export default function Favorites() {
  return (
    <AuthGate>
      <Saved />
    </AuthGate>
  );
}
function Saved() {
  const ids = useResource<string[]>("/product-favorites/ids");
  const products = useResource<Product[]>("/products");
  const saved = products.data?.filter((x) => ids.data?.includes(x._id)) ?? [];
  return (
    <Screen>
      <Heading title="Giữ lại điều bạn thích." />
      <State
        loading={ids.loading || products.loading}
        error={ids.error || products.error}
        retry={() => {
          ids.reload();
          products.reload();
        }}
        empty={
          !saved.length
            ? "Chưa có sản phẩm yêu thích đang được bán."
            : undefined
        }
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {saved.map((p) => (
          <View key={p._id} style={{ width: "48%" }}>
            <ProductCard product={p} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
