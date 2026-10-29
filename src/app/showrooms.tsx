import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Heading, Photo, s, Screen, State } from "../components/ui";
import { ShowroomViewer } from "../components/ShowroomViewer";
import { useResource } from "../lib/hooks";
import type { Showroom } from "../lib/types";

const defaultShowrooms: Showroom[] = [
  {
    _id: "tripo-interior-room",
    title: "Phòng mẫu nội thất 3D (Tripo3D AI)",
    description: "Không gian nội thất hiện đại được tạo tự động bởi Tripo3D AI. Trải nghiệm xoay 360°, chạm để khám phá từng góc phòng.",
    thumbnailUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    environmentModelUrl: "/models/interiorroom.glb",
    items: [],
  },
];

export default function Showrooms() {
  const data = useResource<Showroom[]>("/showrooms");
  const [selected, setSelected] = useState<string | null>("tripo-interior-room");
  const [revision, bump] = useState(0);

  const rooms = (data.data && data.data.length > 0) ? data.data : defaultShowrooms;
  const room = rooms.find((x) => x._id === selected) || rooms[0];

  return (
    <Screen>
      <Heading
        eyebrow="TRIPO3D AI SHOWROOM"
        title="Bước vào không gian 3D."
        subtitle="Xoay 360°, thu phóng và khám phá cách nội thất hòa vào căn phòng thực tế."
      />
      <State
        loading={data.loading && !rooms.length}
        error={data.error && !rooms.length ? data.error : undefined}
        retry={data.reload}
      />
      {room && selected ? (
        <>
          <View style={s.card}>
            <Text style={s.heading}>{room.title}</Text>
            <ShowroomViewer key={`${room._id}-${revision}`} room={room} />
            <Text style={s.muted}>{room.description}</Text>
            <View style={s.row}>
              <Button
                title="Tải lại 3D"
                light
                onPress={() => bump((n) => n + 1)}
              />
              {rooms.length > 1 && (
                <Button
                  title="Đổi không gian"
                  light
                  onPress={() => setSelected(null)}
                />
              )}
            </View>
          </View>

          {room.items && room.items.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={s.heading}>Sản phẩm trong không gian</Text>
              {room.items.map((item) => (
                <Button
                  key={item._id}
                  light
                  title={
                    typeof item.productId === "object"
                      ? item.productId.name
                      : "Xem chi tiết sản phẩm"
                  }
                  onPress={() =>
                    router.push(
                      `/products/${typeof item.productId === "string" ? item.productId : item.productId._id}`,
                    )
                  }
                />
              ))}
            </View>
          )}
        </>
      ) : (
        rooms.map((item) => (
          <View key={item._id} style={s.card}>
            <Photo uri={item.thumbnailUrl} height={210} />
            <Text style={s.heading}>{item.title}</Text>
            <Text style={s.muted}>{item.description}</Text>
            <Button title="Khám phá 3D" onPress={() => setSelected(item._id)} />
          </View>
        ))
      )}
    </Screen>
  );
}
