import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import {
  AuthGate,
  Button,
  Chips,
  Field,
  Heading,
  s,
  Screen,
  State,
} from "../components/ui";
import { useStore } from "../lib/store";
import { api, ApiError } from "../lib/client";
import { useAction } from "../lib/hooks";
import { money, priceOf, type Order } from "../lib/types";
export default function Checkout() {
  return (
    <AuthGate>
      <CheckoutForm />
    </AuthGate>
  );
}
function CheckoutForm() {
  const store = useStore();
  const action = useAction();
  const promotionAction = useAction();
  const [name, setName] = useState(store.user?.fullName ?? "");
  const [email, setEmail] = useState(store.user?.email ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [method, setMethod] = useState("COD");
  const [promotion, setPromotion] = useState<{
    code: string;
    finalDiscount?: number;
    message?: string;
    valid: boolean;
    key: string;
  }>();
  const submitted = useRef(false);
  const [uncertain, setUncertain] = useState(false);
  const subtotal = store.cart.reduce(
    (sum, item) => sum + priceOf(item.product) * item.quantity,
    0,
  );
  const cartSignature = JSON.stringify(
    store.cart.map((x) => [x.product._id, x.quantity, priceOf(x.product)]),
  );
  const promoValid =
    promotion?.valid &&
    promotion.key === cartSignature &&
    promotion.code.toUpperCase() === code.trim().toUpperCase();
  const discount = promoValid ? (promotion.finalDiscount ?? 0) : 0;
  async function submit() {
    if (submitted.current) return;
    if (!store.cart.length) throw new Error("Giỏ hàng đang trống.");
    if (
      !name.trim() ||
      !address.trim() ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      !/^[0-9+().\s-]{9,20}$/.test(phone)
    )
      throw new Error(
        "Vui lòng kiểm tra họ tên, email, số điện thoại và địa chỉ.",
      );
    if (code.trim() && !promoValid)
      throw new Error(
        "Hãy áp dụng mã giảm giá hoặc xóa mã trước khi đặt hàng.",
      );
    submitted.current = true;
    let order: Order;
    try {
      order = await api<Order>("/orders", {
        method: "POST",
        body: {
          items: store.cart.map((x) => ({
            productId: x.product._id,
            quantity: x.quantity,
          })),
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
          shippingAddress: address.trim(),
          paymentMethod: method,
          ...(promoValid ? { promotionCode: promotion.code } : {}),
        },
      });
    } catch (error) {
      // A lost response may still represent a successfully created order. Never auto-retry a purchase.
      if (error instanceof ApiError && error.status < 500)
        submitted.current = false;
      else setUncertain(true);
      throw error;
    }
    store.clear();
    router.replace(`/orders/${order._id}`);
  }
  if (!store.cartReady) return <State loading />;
  if (!store.cart.length)
    return (
      <Screen>
        <State empty="Chưa có sản phẩm để đặt hàng." />
        <Button
          title="Khám phá sản phẩm"
          onPress={() => router.replace("/explore")}
        />
      </Screen>
    );
  return (
    <Screen>
      <Heading
        title="Sắp về nhà bạn."
        subtitle="Kiểm tra thông tin trước khi xác nhận đặt hàng."
      />
      <View style={s.card}>
        <Field
          label="Họ tên người nhận"
          value={name}
          onChangeText={setName}
          maxLength={120}
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={20}
        />
        <Field
          label="Địa chỉ đầy đủ (số nhà, đường, phường/xã, tỉnh/thành)"
          value={address}
          onChangeText={setAddress}
          multiline
          maxLength={500}
        />
      </View>
      <View style={s.card}>
        <Field
          label="Mã giảm giá"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={30}
        />
        <Button
          title="Áp dụng mã"
          light
          busy={promotionAction.busy}
          onPress={() =>
            promotionAction.run(async () => {
              if (!code.trim()) throw new Error("Nhập mã giảm giá.");
              const result = await api<{
                code: string;
                discountAmount: number;
              }>("/promotions/validate", {
                method: "POST",
                body: {
                  code: code.trim(),
                  subtotal,
                  productIds: store.cart.map((x) => x.product._id),
                  categoryIds: store.cart.flatMap((x) =>
                    x.product.categoryId ? [x.product.categoryId] : [],
                  ),
                  supplierIds: store.cart.flatMap((x) =>
                    x.product.supplierId ? [x.product.supplierId] : [],
                  ),
                },
              });
              setPromotion({
                code: result.code,
                finalDiscount: result.discountAmount,
                valid: true,
                key: cartSignature,
              });
            })
          }
        />
        {!!promotionAction.error && (
          <Text style={s.error}>{promotionAction.error}</Text>
        )}
        {promoValid && (
          <Text style={s.body}>Đã áp dụng mã {promotion.code}.</Text>
        )}
      </View>
      <Text style={s.heading}>Thanh toán</Text>
      <Chips
        value={method}
        onChange={setMethod}
        items={[
          { id: "COD", label: "Thanh toán khi nhận hàng" },
          ...(process.env.EXPO_PUBLIC_ENABLE_ONLINE_PAYMENTS === "true"
            ? [
                { id: "BANK_TRANSFER", label: "Chuyển khoản" },
                { id: "VNPAY", label: "VNPay" },
                { id: "MOMO", label: "MoMo" },
              ]
            : []),
        ]}
      />
      <View style={s.card}>
        {store.cart.map((x) => (
          <View key={x.product._id} style={s.between}>
            <Text style={[s.body, { flex: 1 }]}>
              {x.product.name} × {x.quantity}
            </Text>
            <Text style={s.body}>{money(priceOf(x.product) * x.quantity)}</Text>
          </View>
        ))}
        <View style={s.divider} />
        <View style={s.between}>
          <Text style={s.muted}>Giảm giá</Text>
          <Text style={s.body}>−{money(discount)}</Text>
        </View>
        <View style={s.between}>
          <Text style={s.heading}>Tổng dự kiến</Text>
          <Text style={s.heading}>
            {money(Math.max(0, subtotal - discount))}
          </Text>
        </View>
        <Text style={s.muted}>
          Tổng tiền chính thức được hiển thị trên đơn hàng sau khi máy chủ kiểm
          tra giá và mã giảm giá.
        </Text>
      </View>
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      {uncertain ? (
        <View style={s.card}>
          <Text style={s.body}>
            Chưa nhận được phản hồi xác nhận. Kiểm tra đơn hàng trước khi thử
            đặt lại để tránh trùng đơn.
          </Text>
          <Button
            title="Kiểm tra đơn hàng"
            onPress={() => router.replace("/orders")}
          />
        </View>
      ) : (
        <Button
          title="Xác nhận đặt hàng"
          busy={action.busy}
          onPress={() => action.run(submit)}
        />
      )}
    </Screen>
  );
}
