import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  AuthGate,
  Button,
  Chips,
  Heading,
  Photo,
  s,
  Screen,
  State,
} from "../../components/ui";
import { useResource } from "../../lib/hooks";
import { list } from "../../lib/client";
import { idOf, rooms, type Board } from "../../lib/types";
export default function Boards() {
  const { mine } = useLocalSearchParams<{ mine?: string }>();
  return mine ? (
    <AuthGate>
      <Gallery mine />
    </AuthGate>
  ) : (
    <Gallery />
  );
}
function Gallery({ mine = false }: { mine?: boolean }) {
  const [kind, setKind] = useState("moodboards");
  const [room, setRoom] = useState("all");
  const data = useResource<Board[] | { items: Board[] }>(
    mine ? "/moodboards/user/mine" : `/${kind}`,
    { auth: mine },
  );
  const boards = data.data
    ? list(data.data).filter((x) => room === "all" || x.roomType === room)
    : [];
  return (
    <Screen>
      <Heading
        eyebrow="SPACES & STORIES"
        title={
          mine ? "Bộ sưu tập của bạn." : "Tìm cảm hứng.\nChạm phong cách."
        }
        subtitle="Khám phá từng góc nhà và những món đồ làm nên câu chuyện."
      />
      {!mine && (
        <Chips
          value={kind}
          onChange={setKind}
          items={[
            { id: "moodboards", label: "Moodboard" },
            { id: "product-spaces", label: "Không gian sản phẩm" },
          ]}
        />
      )}
      <Chips
        value={room}
        onChange={setRoom}
        items={[
          { id: "all", label: "Tất cả" },
          ...Object.entries(rooms).map(([id, label]) => ({ id, label })),
        ]}
      />
      {mine && (
        <Button
          title="Tạo moodboard mới"
          onPress={() => router.push("/boards/create")}
        />
      )}
      <State
        loading={data.loading}
        error={data.error}
        retry={data.reload}
        empty={!boards.length ? "Chưa có không gian phù hợp." : undefined}
      />
      {boards.map((board) => (
        <Pressable
          key={idOf(board)}
          accessibilityRole="button"
          style={s.card}
          onPress={() =>
            router.push({
              pathname: "/boards/[id]",
              params: { id: idOf(board), kind, mine: mine ? "1" : "" },
            })
          }
        >
          <Photo uri={board.imageUrl} height={230} />
          <View style={s.between}>
            <Text style={s.label}>
              {rooms[board.roomType] ?? board.roomType}
            </Text>
            <Text style={s.muted}>
              {board.productPoints?.length ?? 0} món đồ
            </Text>
          </View>
          <Text style={s.heading}>{board.title ?? "Cảm hứng mới"}</Text>
          <Text style={s.muted} numberOfLines={2}>
            {board.description}
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}
