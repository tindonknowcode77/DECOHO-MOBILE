import { router } from "expo-router";
import { Button, Heading, Screen } from "../components/ui";
export default function NotFound() {
  return (
    <Screen>
      <Heading
        title="Không tìm thấy trang"
        subtitle="Đường dẫn này không còn tồn tại."
      />
      <Button title="Về trang chủ" onPress={() => router.replace("/")} />
    </Screen>
  );
}
