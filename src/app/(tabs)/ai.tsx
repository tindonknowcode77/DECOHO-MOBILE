import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import type { ImagePickerAsset } from "expo-image-picker";
import {
  Button,
  colors,
  Heading,
  Icon,
  Photo,
  s,
  Screen,
} from "../../components/ui";
import { useStore } from "../../lib/store";
import { useAction } from "../../lib/hooks";
import { api } from "../../lib/client";
import { imageForm, pickImage } from "../../lib/media";
type Scan = {
  id: string;
  roomType: string;
  dominantColors: string[];
  products: {
    name: string;
    category: string;
    material: string;
    color: string;
    style: string;
    dimensions: string;
    confidence: number;
    matchedProductIds?: string[];
  }[];
};
export default function Ai() {
  const store = useStore();
  const action = useAction();
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [result, setResult] = useState<Scan>();
  const choose = (camera = false) =>
    action.run(async () => {
      const next = await pickImage(camera);
      if (next) {
        setImage(next);
        setResult(undefined);
      }
    });
  return (
    <Screen>
      <Heading
        eyebrow="DECOHO AI STUDIO"
        title={"Một bức ảnh.\nVạn nguồn cảm hứng."}
        subtitle="Để AI giúp bạn khám phá những món đồ trong không gian yêu thích."
      />
      <Photo
        source={!image ? require("../../../assets/ai-room.png") : undefined}
        uri={image?.uri}
        height={260}
      />
      <View style={[s.card, { backgroundColor: colors.lime }]}>
        <View style={s.row}>
          <Icon name="scan-outline" size={30} />
          <Text style={s.heading}>Nhận diện nội thất</Text>
        </View>
        <Text style={s.body}>
          Chọn ảnh rõ nét, đủ sáng. AI sẽ gợi ý tên, chất liệu, phong cách và
          màu sắc của nội thất.
        </Text>
        <Button
          title={image ? "Chọn ảnh khác" : "Chọn ảnh từ thư viện"}
          light
          busy={action.busy}
          onPress={() => choose()}
        />
        <Button
          title="Chụp ảnh không gian"
          light
          disabled={action.busy}
          onPress={() => choose(true)}
        />
      </View>
      {!!image && (
        <Button
          title="Phân tích với AI"
          busy={action.busy}
          onPress={() => {
            if (store.requireLogin())
              void action.run(async () => {
                setResult(
                  await api<Scan>("/ai-scanner/scan", {
                    method: "POST",
                    body: await imageForm(image),
                    timeout: 120000,
                  }),
                );
              });
          }}
        />
      )}
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      {action.busy && image && (
        <Text style={s.muted}>
          Quá trình phân tích có thể mất một chút thời gian…
        </Text>
      )}
      {result && (
        <>
          <Heading
            title="Những điều AI nhìn thấy"
            subtitle={`${result.roomType} · ${result.products.length} món đồ được nhận diện`}
          />
          <Text style={s.muted}>
            Màu chủ đạo: {result.dominantColors.join(", ")}
          </Text>
          {result.products.map((p, i) => (
            <View style={s.card} key={i}>
              <View style={s.between}>
                <Text style={[s.heading, { flex: 1 }]}>{p.name}</Text>
                <Text style={s.muted}>{Math.round(p.confidence * 100)}%</Text>
              </View>
              <Text style={s.body}>
                {p.material} · {p.color}
              </Text>
              <Text style={s.muted}>
                {p.style} · Kích thước ước tính: {p.dimensions}
              </Text>
              <Button
                title="Tìm sản phẩm tương tự"
                light
                onPress={() =>
                  router.push({
                    pathname: "/explore",
                    params: { q: p.category || p.name },
                  })
                }
              />
            </View>
          ))}
          {!result.products.length && (
            <Text style={s.muted}>
              Chưa nhận diện được nội thất. Hãy thử ảnh khác rõ hơn.
            </Text>
          )}
          <Text style={s.muted}>
            Kết quả là gợi ý từ AI; kích thước và chất liệu cần được kiểm tra
            thực tế.
          </Text>
        </>
      )}
      <View style={s.card}>
        <Text style={s.heading}>3 bước thật đơn giản</Text>
        <Text style={s.body}>
          01 Chụp hoặc chọn ảnh không gian{"\n"}02 Khám phá gợi ý từ AI{"\n"}03
          Tìm món đồ và lưu cảm hứng
        </Text>
      </View>
    </Screen>
  );
}
