import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Heading, Photo, s, Screen, State } from "../components/ui";
import { ShowroomViewer } from "../components/ShowroomViewer";
import { useResource } from "../lib/hooks";
import type { Showroom } from "../lib/types";
export default function Showrooms() {
  const data = useResource<Showroom[]>("/showrooms");
  const [selected, setSelected] = useState<string | null>(null);
  const [revision, bump] = useState(0);
  const room = data.data?.find((x) => x._id === selected);
  return (
    <Screen>
      <Heading
        eyebrow="A NEW PERSPECTIVE"
        title="Bước vào không gian 3D."
        subtitle="Xoay, thu phóng và khám phá cách nội thất hòa vào căn phòng."
      />
      <State
        loading={data.loading}
        error={data.error}
        retry={data.reload}
        empty={
          data.data?.length === 0
            ? "Chưa có showroom được xuất bản."
            : undefined
        }
      />
      {room ? (
        <>
          <Text style={s.heading}>{room.title}</Text>
          <ShowroomViewer key={`${room._id}-${revision}`} room={room} />
          <Text style={s.muted}>{room.description}</Text>
          <View style={s.row}>
            <Button
              title="Tải lại 3D"
              light
              onPress={() => bump((n) => n + 1)}
            />
            <Button
              title="Đổi không gian"
              light
              onPress={() => setSelected(null)}
            />
          </View>
          <Text style={s.heading}>Sản phẩm trong không gian</Text>
          {room.items.map((item) => (
            <Button
              key={item._id}
              light
              title={
                typeof item.productId === "object"
                  ? item.productId.name
                  : "Xem sản phẩm"
              }
              onPress={() =>
                router.push(
                  `/products/${typeof item.productId === "string" ? item.productId : item.productId._id}`,
                )
              }
            />
          ))}
        </>
      ) : (
        data.data?.map((item) => (
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
