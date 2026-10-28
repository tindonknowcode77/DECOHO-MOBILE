import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button, colors, Heading, s, Screen } from "../components/ui";
export default function Process() {
  return (
    <Screen>
      <Heading
        eyebrow="MAKE YOURSELF AT HOME"
        title={"Tổ ấm đẹp,\nbắt đầu thật đơn giản."}
        subtitle="DECOHO đồng hành từ cảm hứng đầu tiên đến món đồ cuối cùng."
      />
      {[
        [
          "01",
          "Tìm cảm hứng",
          "Khám phá moodboard, không gian thực tế và câu chuyện từ cộng đồng.",
          "/boards",
        ],
        [
          "02",
          "Hiểu không gian",
          "Khám phá không gian thực tế và trải nghiệm showroom 3D sống động.",
          "/showrooms",
        ],
        [
          "03",
          "Chọn món đồ yêu thích",
          "So sánh sản phẩm, đọc đánh giá và lưu vào bộ sưu tập.",
          "/explore",
        ],
        [
          "04",
          "Mang cảm hứng về nhà",
          "Đặt hàng và theo dõi trạng thái giao hàng ngay trong tài khoản.",
          "/orders",
        ],
      ].map(([number, title, text, href]) => (
        <View key={number} style={s.card}>
          <Text
            style={{ fontSize: 40, color: colors.green, fontWeight: "800" }}
          >
            {number}
          </Text>
          <Text style={s.heading}>{title}</Text>
          <Text style={s.body}>{text}</Text>
          <Button
            title="Khám phá →"
            light
            onPress={() => router.push(href as "/boards")}
          />
        </View>
      ))}
    </Screen>
  );
}
