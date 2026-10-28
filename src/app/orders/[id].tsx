import { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  AuthGate,
  Button,
  Field,
  Heading,
  s,
  Screen,
  State,
} from "../../components/ui";
import { useAction, useResource } from "../../lib/hooks";
import { api } from "../../lib/client";
import { money, statuses, type Order } from "../../lib/types";
export default function OrderDetail() {
  return (
    <AuthGate>
      <Details />
    </AuthGate>
  );
}
function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // The current backend exposes /orders/mine, but no GET /orders/mine/:id.
  const data = useResource<Order[]>("/orders/mine");
  const order = data.data?.find((x) => x._id === id);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const action = useAction();
  const bank = useResource<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }>(order?.paymentMethod === "BANK_TRANSFER" ? "/payments/bank-info" : null);
  if (!order)
    return (
      <Screen>
        <State
          loading={data.loading}
          error={data.error}
          retry={data.reload}
          empty="Không tìm thấy đơn hàng trong tài khoản của bạn."
        />
      </Screen>
    );
  return (
    <Screen>
      <Heading
        eyebrow={order.orderCode}
        title={statuses[order.status] ?? order.status}
        subtitle={`Thanh toán: ${statuses[order.paymentStatus] ?? order.paymentStatus}`}
      />
      <View style={s.card}>
        <Text style={s.heading}>Địa chỉ nhận hàng</Text>
        <Text style={s.body}>
          {order.customerName} · {order.customerPhone}
        </Text>
        <Text style={s.muted}>{order.shippingAddress}</Text>
      </View>
      <View style={s.card}>
        {order.items.map((item, i) => (
          <View key={`${item.productId}-${i}`} style={s.between}>
            <Text style={[s.body, { flex: 1 }]}>
              {item.name} × {item.quantity}
            </Text>
            <Text style={s.body}>{money(item.lineTotal)}</Text>
          </View>
        ))}
        <View style={s.divider} />
        <View style={s.between}>
          <Text style={s.heading}>Tổng thanh toán</Text>
          <Text style={s.heading}>{money(order.totalAmount)}</Text>
        </View>
        <Text style={s.muted}>Phương thức: {order.paymentMethod}</Text>
      </View>
      {order.paymentMethod === "BANK_TRANSFER" && (
        <View style={s.card}>
          <State
            loading={bank.loading}
            error={bank.error}
            retry={bank.reload}
          />
          {bank.data && (
            <>
              <Text style={s.heading}>{bank.data.bankName}</Text>
              <Text selectable style={s.body}>
                {bank.data.accountNumber} · {bank.data.accountHolder}
              </Text>
              <Text style={s.muted}>
                Nội dung chuyển khoản: {order.orderCode}
              </Text>
            </>
          )}
        </View>
      )}
      {["VNPAY", "MOMO"].includes(order.paymentMethod) &&
        order.paymentStatus !== "SUCCESS" &&
        !["CANCELLED", "REFUNDED"].includes(order.status) && (
          <Button
            title="Mở cổng thanh toán"
            busy={action.busy}
            onPress={() =>
              action.run(async () => {
                const result = await api<{ paymentUrl: string }>(
                  `/payments/${order.paymentMethod.toLowerCase()}/create`,
                  {
                    method: "POST",
                    body: { orderId: order._id, amount: order.totalAmount },
                  },
                );
                if (
                  !result.paymentUrl ||
                  !/^https:\/\//.test(result.paymentUrl)
                )
                  throw new Error(
                    "Cổng thanh toán chưa sẵn sàng. Vui lòng liên hệ hỗ trợ.",
                  );
                await WebBrowser.openBrowserAsync(result.paymentUrl);
                data.reload();
              })
            }
          />
        )}
      <Button light title="Cập nhật trạng thái" onPress={data.reload} />
      {order.statusHistory?.map((entry, i) => (
        <View key={i} style={s.card}>
          <Text style={s.body}>{statuses[entry.status] ?? entry.status}</Text>
          <Text style={s.muted}>
            {entry.note ?? ""}{" "}
            {(entry.at ?? entry.timestamp)
              ? new Date((entry.at ?? entry.timestamp)!).toLocaleString("vi-VN")
              : ""}
          </Text>
        </View>
      ))}
      <View style={s.card}>
        <Text style={s.heading}>Cần hỗ trợ đơn hàng?</Text>
        <Field
          label="Mô tả vấn đề"
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={1000}
        />
        <Button
          light
          title="Gửi yêu cầu hỗ trợ"
          busy={action.busy}
          onPress={() =>
            action.run(async () => {
              if (!reason.trim()) throw new Error("Vui lòng mô tả vấn đề.");
              await api(`/orders/mine/${id}/complaint`, {
                method: "POST",
                body: { reason: reason.trim() },
              });
              setMessage("Đã gửi yêu cầu hỗ trợ đơn hàng.");
              setReason("");
            })
          }
        />
      </View>
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      {!!message && <Text style={s.body}>{message}</Text>}
    </Screen>
  );
}
