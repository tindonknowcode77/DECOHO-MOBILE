import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import {
  AuthGate,
  Chips,
  Heading,
  s,
  Screen,
  State,
} from "../../components/ui";
import { useResource } from "../../lib/hooks";
import { money, statuses, type Order } from "../../lib/types";
export default function Orders() {
  return (
    <AuthGate>
      <OrderList />
    </AuthGate>
  );
}
function OrderList() {
  const data = useResource<Order[]>("/orders/mine");
  const [status, setStatus] = useState("all");
  const orders = (data.data ?? []).filter(
    (x) => status === "all" || x.status === status,
  );
  return (
    <Screen>
      <Heading title="Hành trình về tổ ấm." />
      <Chips
        value={status}
        onChange={setStatus}
        items={[
          { id: "all", label: "Tất cả" },
          ...["PENDING", "SHIPPING", "DELIVERED", "CANCELLED"].map((id) => ({
            id,
            label: statuses[id],
          })),
        ]}
      />
      <State
        loading={data.loading}
        error={data.error}
        retry={data.reload}
        empty={
          !data.loading && !orders.length
            ? "Bạn chưa có đơn hàng ở trạng thái này."
            : undefined
        }
      />
      {orders.map((order) => (
        <Pressable
          accessibilityRole="button"
          key={order._id}
          onPress={() => router.push(`/orders/${order._id}`)}
          style={s.card}
        >
          <View style={s.between}>
            <Text style={s.heading}>{order.orderCode}</Text>
            <Text style={s.muted}>
              {statuses[order.status] ?? order.status}
            </Text>
          </View>
          <Text style={s.body}>
            {order.items.map((x) => x.name).join(", ")}
          </Text>
          <Text style={s.heading}>{money(order.totalAmount)}</Text>
          <Text style={s.muted}>
            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}
