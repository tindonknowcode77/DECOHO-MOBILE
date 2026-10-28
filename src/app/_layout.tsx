import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StoreProvider } from "../lib/store";
import { colors } from "../components/ui";
export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.green,
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 17 },
          contentStyle: { backgroundColor: colors.bg },
          headerBackTitle: "Quay lại",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/[mode]"
          options={{ title: "Tài khoản DECOHO" }}
        />
        <Stack.Screen
          name="products/[id]"
          options={{ title: "Chi tiết sản phẩm" }}
        />
        <Stack.Screen name="cart" options={{ title: "Giỏ hàng của bạn" }} />
        <Stack.Screen name="checkout" options={{ title: "Đặt hàng" }} />
        <Stack.Screen
          name="orders/index"
          options={{ title: "Đơn hàng của tôi" }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{ title: "Chi tiết đơn hàng" }}
        />
        <Stack.Screen
          name="favorites"
          options={{ title: "Sản phẩm yêu thích" }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ title: "Thông tin cá nhân" }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ title: "Phong cách của bạn" }}
        />
        <Stack.Screen
          name="boards/index"
          options={{ title: "Cảm hứng không gian" }}
        />
        <Stack.Screen
          name="boards/[id]"
          options={{ title: "Khám phá không gian" }}
        />
        <Stack.Screen
          name="boards/create"
          options={{ title: "Tạo moodboard" }}
        />
        <Stack.Screen
          name="community/[id]"
          options={{ title: "Câu chuyện không gian" }}
        />
        <Stack.Screen
          name="community/create"
          options={{ title: "Chia sẻ không gian" }}
        />
        <Stack.Screen name="support" options={{ title: "Trung tâm hỗ trợ" }} />
        <Stack.Screen name="showrooms" options={{ title: "Showroom 3D" }} />
        <Stack.Screen
          name="process"
          options={{ title: "Hành trình cùng DECOHO" }}
        />
      </Stack>
    </StoreProvider>
  );
}
