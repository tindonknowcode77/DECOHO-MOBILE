import { useState } from "react";
import { Text, View } from "react-native";
import {
  AuthGate,
  Button,
  Field,
  Heading,
  s,
  Screen,
  State,
} from "../components/ui";
import { useAction, useResource } from "../lib/hooks";
import { api } from "../lib/client";
import { statuses, type Ticket } from "../lib/types";
export default function Support() {
  return (
    <AuthGate>
      <Tickets />
    </AuthGate>
  );
}
function Tickets() {
  const data = useResource<Ticket[]>("/support-tickets/mine");
  const action = useAction();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const ticket = data.data?.find((x) => x._id === selected);
  return (
    <Screen>
      <Heading
        title="DECOHO luôn lắng nghe."
        subtitle="Gửi câu hỏi hoặc theo dõi trao đổi với đội ngũ hỗ trợ."
      />
      <View style={s.card}>
        <Field
          label="Chủ đề"
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />
        <Field
          label="Bạn cần hỗ trợ điều gì?"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={5000}
        />
        <Button
          title="Gửi yêu cầu mới"
          busy={action.busy}
          onPress={() =>
            action.run(async () => {
              if (!title.trim() || !message.trim())
                throw new Error("Nhập chủ đề và nội dung cần hỗ trợ.");
              await api("/support-tickets", {
                method: "POST",
                body: {
                  title: title.trim(),
                  message: message.trim(),
                  type: "SUPPORT",
                },
              });
              setTitle("");
              setMessage("");
              data.reload();
            })
          }
        />
      </View>
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      <Text style={s.heading}>Yêu cầu của bạn</Text>
      <State
        loading={data.loading}
        error={data.error}
        retry={data.reload}
        empty={data.data?.length === 0 ? "Chưa có yêu cầu hỗ trợ." : undefined}
      />
      {data.data?.map((item) => (
        <View key={item._id} style={s.card}>
          <Text style={s.muted}>
            {item.ticketCode} · {statuses[item.status] ?? item.status}
          </Text>
          <Text style={s.heading}>{item.title}</Text>
          <Button
            light
            title={selected === item._id ? "Ẩn hội thoại" : "Xem hội thoại"}
            onPress={() => {
              setSelected(selected === item._id ? null : item._id);
              setReply("");
            }}
          />
          {selected === item._id && (
            <>
              {item.messages.map((m, i) => (
                <View key={i} style={{ gap: 5 }}>
                  <Text style={s.body}>{m.content}</Text>
                  <Text style={s.muted}>
                    {new Date(m.createdAt).toLocaleString("vi-VN")}
                  </Text>
                  <View style={s.divider} />
                </View>
              ))}
              {!["CLOSED", "RESOLVED"].includes(item.status) && (
                <>
                  <Field
                    label="Trả lời"
                    value={reply}
                    onChangeText={setReply}
                    multiline
                    maxLength={5000}
                  />
                  <Button
                    title="Gửi trả lời"
                    busy={action.busy}
                    onPress={() =>
                      action.run(async () => {
                        if (!reply.trim() || !ticket)
                          throw new Error("Nhập nội dung trả lời.");
                        await api(`/support-tickets/${ticket._id}/replies`, {
                          method: "POST",
                          body: { content: reply.trim() },
                        });
                        setReply("");
                        data.reload();
                      })
                    }
                  />
                </>
              )}
            </>
          )}
        </View>
      ))}
    </Screen>
  );
}
