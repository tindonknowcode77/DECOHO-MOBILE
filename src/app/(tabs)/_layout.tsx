import { Tabs, router } from "expo-router";
import { Image, Text, View } from "react-native";
import { colors, fontFamilies, Icon, IconButton, s } from "../../components/ui";
import { useStore } from "../../lib/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const tabs = [
  ["index", "Trang chủ", "home-outline"],
  ["explore", "Khám phá", "grid-outline"],
  ["community", "Cộng đồng", "people-outline"],
  ["account", "Cá nhân", "person-outline"],
] as const;
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { cart } = useStore();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitle: () => (
          <Image
            source={require("../../../assets/decoho-logo-horizontal.png")}
            style={{ width: 155, height: 40 }}
            resizeMode="contain"
            accessibilityLabel="DECOHO"
          />
        ),
        headerRight: () => (
          <View style={[s.row, { marginRight: 16 }]}>
            <IconButton
              name="bag-outline"
              label={`Giỏ hàng, ${count} sản phẩm`}
              onPress={() => router.push("/cart")}
            />
            {!!count && <View pointerEvents="none" style={{ position: "absolute", right: -3, top: 0, minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: 10, backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{count > 99 ? "99+" : count}</Text></View>}
          </View>
        ),
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: "#708164",
        tabBarStyle: {
          backgroundColor: "#fffefb",
          borderTopColor: colors.line,
          height: 64 + insets.bottom,
          paddingTop: 5,
          paddingBottom: Math.max(8, insets.bottom),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          fontFamily: fontFamilies.heading,
        },
      }}
    >
      {tabs.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => (
              <View style={{ width: 48, height: 30, borderRadius: 15, backgroundColor: focused ? colors.lime : "transparent", alignItems: "center", justifyContent: "center" }}>
                <Icon name={icon} color={color} size={22} />
              </View>
            ),
          }}
        />
      ))}
      <Tabs.Screen name="ai" options={{ href: null }} />
    </Tabs>
  );
}
