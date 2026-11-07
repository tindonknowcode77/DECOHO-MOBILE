import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import { colors, fontFamilies, Icon } from "../../components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const tabs = [
  ["index", "Trang chủ", "home-outline"],
  ["explore", "Khám phá", "grid-outline"],
  ["community", "Cộng đồng", "people-outline"],
  ["account", "Cá nhân", "person-outline"],
] as const;
export default function TabLayout() {
  const insets = useSafeAreaInsets();
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
