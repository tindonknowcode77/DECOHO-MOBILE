import { router } from "expo-router";
import { Alert, Text, View } from "react-native";
import {
  Button,
  Heading,
  Icon,
  MenuLink,
  s,
  Screen,
  State,
  colors,
} from "../../components/ui";
import { useStore } from "../../lib/store";
import { useAction } from "../../lib/hooks";
export default function Account() {
  const store = useStore();
  const action = useAction();
  return (
    <Screen>
      <Heading
        eyebrow="MY DECOHO"
        title={
          store.user ? `Xin chào, ${store.user.fullName}` : "Góc riêng của bạn."
        }
        subtitle="Lưu cảm hứng, theo dõi đơn hàng và chăm chút tổ ấm."
      />
      {!store.ready ? (
        <State loading />
      ) : !store.user ? (
        <View style={s.card}>
          <Icon name="person-circle-outline" size={56} />
          <Button
            title="Đăng nhập"
            onPress={() => router.push("/auth/login")}
          />
          <Button
            title="Tạo tài khoản"
            light
            onPress={() => router.push("/auth/register")}
          />
        </View>
      ) : (
        <View style={[s.card, { backgroundColor: colors.lime }]}>
          <Text style={s.body}>{store.user.email}</Text>
          <Text style={s.muted}>Thành viên DECOHO</Text>
        </View>
      )}
      {!!store.sessionError && (
        <Text style={s.error}>{store.sessionError}</Text>
      )}
      <View style={s.card}>
        <MenuLink
          title="Đơn hàng của tôi"
          icon="receipt-outline"
          href="/orders"
        />
        <MenuLink
          title="Sản phẩm yêu thích"
          icon="heart-outline"
          href="/favorites"
        />
        <MenuLink
          title="Moodboard của tôi"
          icon="layers-outline"
          href="/boards?mine=1"
        />
        <MenuLink title="Giỏ hàng" icon="bag-outline" href="/cart" />
      </View>
      <View style={s.card}>
        <MenuLink
          title="Thông tin cá nhân"
          icon="person-outline"
          href="/profile/edit"
        />
        <MenuLink
          title="Phong cách & sở thích"
          icon="color-palette-outline"
          href="/onboarding"
        />
        <MenuLink
          title="Trung tâm hỗ trợ"
          icon="chatbubbles-outline"
          href="/support"
        />
        <MenuLink
          title="Hành trình cùng DECOHO"
          icon="leaf-outline"
          href="/process"
        />
      </View>
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      {store.user && (
        <Button
          title="Đăng xuất"
          light
          busy={action.busy}
          onPress={() =>
            Alert.alert(
              "Đăng xuất?",
              "Bạn có thể đăng nhập lại bất cứ lúc nào.",
              [
                { text: "Ở lại", style: "cancel" },
                { text: "Đăng xuất", onPress: () => action.run(store.logout) },
              ],
            )
          }
        />
      )}
      <Text style={[s.muted, { textAlign: "center" }]}>
        DECOHO · Cảm hứng cho tổ ấm của bạn
      </Text>
    </Screen>
  );
}
