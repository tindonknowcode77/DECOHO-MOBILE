import { useState } from "react";
import { Alert, Text } from "react-native";
import { router } from "expo-router";
import {
  AuthGate,
  Button,
  Field,
  Heading,
  Photo,
  s,
  Screen,
} from "../../components/ui";
import { useStore } from "../../lib/store";
import { useAction } from "../../lib/hooks";
import { api, saveTokens } from "../../lib/client";
import { avatarOf } from "../../lib/types";
import { imageForm, pickImage } from "../../lib/media";
export default function Profile() {
  return (
    <AuthGate>
      <EditProfile />
    </AuthGate>
  );
}
function EditProfile() {
  const store = useStore();
  const action = useAction();
  const [name, setName] = useState(store.user?.fullName ?? "");
  const [phone, setPhone] = useState(store.user?.phone ?? "");
  const [message, setMessage] = useState("");
  return (
    <Screen>
      <Heading title="Một chút về bạn" />
      <Photo uri={avatarOf(store.user ?? undefined)} height={160} />
      <Button
        light
        title="Đổi ảnh đại diện"
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            const image = await pickImage();
            if (!image) return;
            await api("/users/me/avatar", {
              method: "PATCH",
              body: await imageForm(image, "avatar"),
            });
            await store.refreshUser();
          })
        }
      />
      <Field
        label="Họ tên"
        value={name}
        onChangeText={setName}
        maxLength={120}
      />
      <Field
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={20}
      />
      <Text style={s.muted}>{store.user?.email}</Text>
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      {!!message && <Text style={s.body}>{message}</Text>}
      <Button
        title="Lưu thay đổi"
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            if (name.trim().length < 2)
              throw new Error("Họ tên cần ít nhất 2 ký tự.");
            await api("/users/me", {
              method: "PATCH",
              body: {
                fullName: name.trim(),
                ...(phone.trim() ? { phone: phone.trim() } : {}),
              },
            });
            await store.refreshUser();
            setMessage("Đã lưu thông tin cá nhân.");
          })
        }
      />
      <Button
        light
        title="Xóa tài khoản"
        busy={action.busy}
        onPress={() =>
          Alert.alert(
            "Xóa tài khoản?",
            "Tài khoản sẽ bị vô hiệu hóa. Bạn sẽ không thể tiếp tục đăng nhập.",
            [
              { text: "Giữ tài khoản", style: "cancel" },
              {
                text: "Xóa tài khoản",
                style: "destructive",
                onPress: () =>
                  action.run(async () => {
                    await api("/users/me", { method: "DELETE" });
                    await saveTokens(null);
                    await store.logout().catch(() => {});
                    router.replace("/");
                  }),
              },
            ],
          )
        }
      />
    </Screen>
  );
}
