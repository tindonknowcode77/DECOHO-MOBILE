import { useState } from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import type { ImagePickerAsset } from "expo-image-picker";
import {
  AuthGate,
  Button,
  Chips,
  Field,
  Heading,
  Photo,
  s,
  Screen,
} from "../../components/ui";
import { api } from "../../lib/client";
import { useAction } from "../../lib/hooks";
import { imageForm, pickImage } from "../../lib/media";
import { rooms } from "../../lib/types";
export default function CreateBoard() {
  return (
    <AuthGate>
      <Form />
    </AuthGate>
  );
}
function Form() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [room, setRoom] = useState("living_room");
  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const action = useAction();
  return (
    <Screen>
      <Heading
        title="Lưu một góc cảm hứng."
        subtitle="Moodboard cá nhân được lưu riêng trong tài khoản của bạn."
      />
      {image && <Photo uri={image.uri} height={230} />}
      <Button
        title="Chọn ảnh không gian"
        light
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            const chosen = await pickImage();
            if (chosen) setImage(chosen);
          })
        }
      />
      <Field
        label="Tên moodboard"
        value={title}
        onChangeText={setTitle}
        maxLength={160}
      />
      <Field
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={1000}
      />
      <Chips
        value={room}
        onChange={setRoom}
        items={Object.entries(rooms).map(([id, label]) => ({ id, label }))}
      />
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      <Button
        title="Lưu moodboard"
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            if (!image || !title.trim())
              throw new Error("Hãy chọn ảnh và nhập tên moodboard.");
            const body = await imageForm(image);
            body.append("title", title.trim());
            body.append("description", description.trim());
            body.append("roomType", room);
            body.append("isPublic", "false");
            await api("/moodboards/upload", {
              method: "POST",
              body,
              timeout: 60000,
            });
            router.replace("/boards?mine=1");
          })
        }
      />
    </Screen>
  );
}
