import { Text, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Heading,
  IconButton,
  Photo,
  s,
  Screen,
  State,
} from "../components/ui";
import { useStore } from "../lib/store";
import { money, priceOf } from "../lib/types";
export default function Cart() {
  const store = useStore();
  const total = store.cart.reduce(
    (sum, item) => sum + priceOf(item.product) * item.quantity,
    0,
  );
  return (
    <Screen>
      <Heading
        title="Những món đồ bạn chọn."
        subtitle="Thêm một chút yêu thương vào tổ ấm."
      />
      <State
        loading={!store.cartReady}
        empty={
          store.cartReady && !store.cart.length
            ? "Giỏ hàng của bạn đang trống."
            : undefined
        }
      />
      {store.cart.map(({ product: p, quantity }) => (
        <View style={s.card} key={p._id}>
          <View style={s.row}>
            <View style={{ width: 90 }}>
              <Photo uri={p.image ?? p.images?.[0]} height={90} />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={s.body}>{p.name}</Text>
              <Text style={s.heading}>{money(priceOf(p))}</Text>
            </View>
          </View>
          <View style={s.between}>
            <View style={s.row}>
              <IconButton
                name="remove"
                label="Giảm số lượng"
                onPress={() => store.quantity(p._id, quantity - 1)}
              />
              <Text style={s.body}>{quantity}</Text>
              <IconButton
                name="add"
                label="Tăng số lượng"
                onPress={() => store.quantity(p._id, quantity + 1)}
              />
            </View>
            <IconButton
              name="trash-outline"
              label={`Xóa ${p.name}`}
              onPress={() => store.quantity(p._id, 0)}
            />
          </View>
        </View>
      ))}
      {!!store.cart.length && (
        <View style={s.card}>
          <View style={s.between}>
            <Text style={s.body}>Tạm tính</Text>
            <Text style={s.heading}>{money(total)}</Text>
          </View>
          <Text style={s.muted}>
            Giá cuối cùng và tồn kho sẽ được máy chủ kiểm tra khi đặt hàng.
          </Text>
          <Button
            title="Tiến hành đặt hàng"
            onPress={() => {
              if (store.requireLogin()) router.push("/checkout");
            }}
          />
        </View>
      )}
      <Button
        title="Tiếp tục khám phá"
        light
        onPress={() => router.push("/explore")}
      />
    </Screen>
  );
}
