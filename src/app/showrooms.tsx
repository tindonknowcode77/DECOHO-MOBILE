import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Heading, Photo, s, Screen, State, colors, Icon } from "../components/ui";
import { ShowroomViewer } from "../components/ShowroomViewer";
import { useResource } from "../lib/hooks";
import { money, priceOf, type Showroom } from "../lib/types";

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
  const [selected, setSelected] = useState<string | null>(null);
  const [revision, bump] = useState(0);

  const rawList = Array.isArray(data.data) ? data.data : (data.data ? [data.data as Showroom] : []);
  const rooms = rawList.length > 0 ? rawList : defaultShowrooms;
  const currentId = selected || rooms[0]?._id;
  const room = rooms.find((x) => x._id === currentId) || rooms[0];

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
      {room && (selected || rooms.length === 1) ? (
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
            <View style={{ gap: 12 }}>
              <Text style={s.heading}>Sản phẩm trong không gian ({room.items.length})</Text>
              {room.items.map((item, idx) => {
                const prod = typeof item.productId === "object" ? item.productId : null;
                const prodId = typeof item.productId === "string" ? item.productId : item.productId?._id;
                return (
                  <Pressable
                    key={item._id ?? idx}
                    accessibilityRole="button"
                    onPress={() => prodId && router.push(`/products/${prodId}`)}
                    style={[
                      s.card,
                      s.row,
                      {
                        backgroundColor: "#fff",
                        borderRadius: 18,
                        padding: 12,
                        gap: 14,
                        borderWidth: 1,
                        borderColor: colors.line,
                      },
                    ]}
                  >
                    <View style={{ width: 68, height: 68, borderRadius: 14, overflow: "hidden", backgroundColor: "#f0ede4" }}>
                      <Photo uri={prod?.image || prod?.images?.[0]} height={68} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                      {prod?.category && (
                        <Text style={{ fontSize: 10, fontWeight: "700", color: "#708164", textTransform: "uppercase" }}>
                          {prod.category}
                        </Text>
                      )}
                      <Text style={[s.body, { fontWeight: "700", color: colors.ink }]} numberOfLines={1}>
                        {prod?.name ?? "Sản phẩm nội thất"}
                      </Text>
                      {prod?.price !== undefined && (
                        <Text style={{ fontSize: 13, fontWeight: "700", color: colors.green }}>
                          {money(priceOf(prod))}
                        </Text>
                      )}
                    </View>
                    <Icon name="chevron-forward" size={18} color={colors.muted} />
                  </Pressable>
                );
              })}
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
