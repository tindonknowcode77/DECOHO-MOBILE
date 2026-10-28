import { useState } from "react";
import { Text, View } from "react-native";
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
import { appendImage, pickCommunityMedia } from "../../lib/media";
import { api } from "../../lib/client";
import { useAction } from "../../lib/hooks";
import { VideoPlayer } from "../../components/VideoPlayer";
import { rooms } from "../../lib/types";
export default function CreatePost() {
  return (
    <AuthGate>
      <Form />
    </AuthGate>
  );
}
function Form() {
  const [description, setDescription] = useState("");
  const [room, setRoom] = useState("living_room");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<ImagePickerAsset[]>([]);
  const action = useAction();
  return (
    <Screen>
      <Heading
        title="Kể câu chuyện góc nhà."
        subtitle="Chia sẻ không gian, ý tưởng và những điều bạn yêu thích."
      />
      <Field
        label="Câu chuyện của bạn"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={3000}
      />
      <Chips
        value={room}
        onChange={setRoom}
        items={Object.entries(rooms).map(([id, label]) => ({ id, label }))}
      />
      <Field
        label="Hashtag (cách nhau bằng dấu phẩy)"
        value={tags}
        onChangeText={setTags}
        placeholder="japandi, tips, nhaxinh"
      />
      {images.map((image, i) => (
        <View key={`${image.uri}-${i}`} style={{ gap: 8 }}>
          {image.type === "video" ? (
            <VideoPlayer uri={image.uri} />
          ) : (
            <Photo uri={image.uri} height={220} />
          )}
          <Button
            light
            title={`Bỏ tệp ${i + 1}`}
            onPress={() =>
              setImages((old) => old.filter((_, index) => i !== index))
            }
          />
        </View>
      ))}
      <Button
        light
        title={`Thêm ảnh/video (${images.length}/10)`}
        disabled={images.length >= 10}
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            const image = await pickCommunityMedia();
            if (image) setImages((old) => [...old, image]);
          })
        }
      />
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
      <Button
        title="Đăng bài"
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            if (!description.trim() || !images.length)
              throw new Error("Thêm nội dung và ít nhất một ảnh hoặc video.");
            const body = new FormData();
            for (const image of images) await appendImage(body, image, "files");
            body.append("description", description.trim());
            body.append("roomType", room);
            body.append("hashtags", tags.replace(/#/g, ""));
            await api("/community/posts", {
              method: "POST",
              body,
              timeout: 120000,
            });
            router.replace("/community");
          })
        }
      />
    </Screen>
  );
}
