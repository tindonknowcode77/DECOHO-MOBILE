import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import {
  AuthGate,
  Button,
  Chips,
  colors,
  Heading,
  s,
  Screen,
} from "../components/ui";
import { api } from "../lib/client";
import { useAction } from "../lib/hooks";
import { useStore } from "../lib/store";
export default function Onboarding() {
  return (
    <AuthGate>
      <Preferences />
    </AuthGate>
  );
}
function Preferences() {
  const [styles, setStyles] = useState<string[]>([]);
  const [budget, setBudget] = useState("25m-75m");
  const [message, setMessage] = useState("");
  const action = useAction();
  const store = useStore();
  return (
    <Screen>
      <Heading
        eyebrow="YOUR HOME, YOUR STYLE"
        title="Nhà mang dấu ấn bạn."
        subtitle="Chọn tối đa 3 phong cách bạn yêu thích."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          "Japandi",
          "Minimalist",
          "Scandinavian",
          "Modern",
          "Bohemian",
          "Industrial",
        ].map((style) => (
          <Pressable
            key={style}
            accessibilityRole="button"
            accessibilityState={{ selected: styles.includes(style) }}
            onPress={() =>
              setStyles((old) =>
                old.includes(style)
                  ? old.filter((x) => x !== style)
                  : old.length < 3
                    ? [...old, style]
                    : old,
              )
            }
            style={[
              s.card,
              {
                width: "47%",
                minHeight: 110,
                justifyContent: "center",
                backgroundColor: styles.includes(style) ? colors.lime : "#fff",
              },
            ]}
          >
            <Text style={s.heading}>{style}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.heading}>Ngân sách dự kiến</Text>
      <Chips
        value={budget}
        onChange={setBudget}
        items={[
          { id: "under-25m", label: "Dưới 25 triệu" },
          { id: "25m-75m", label: "25–75 triệu" },
          { id: "75m-150m", label: "75–150 triệu" },
          { id: "over-150m", label: "Trên 150 triệu" },
        ]}
      />
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      {!!message && <Text style={s.body}>{message}</Text>}
      <Button
        title="Lưu sở thích"
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            await api("/users/me/onboarding", {
              method: "PATCH",
              body: { styles, budget },
            });
            await store.refreshUser();
            setMessage("Đã lưu phong cách của bạn.");
          })
        }
      />
    </Screen>
  );
}
