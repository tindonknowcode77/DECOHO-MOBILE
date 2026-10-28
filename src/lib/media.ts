import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
export async function pickImage(camera = false) {
  if (camera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted)
      throw new Error("Hãy cho phép truy cập camera trong cài đặt thiết bị.");
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    quality: 0.8,
  };
  const result = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;
  const image = result.assets[0];
  if ((image.fileSize ?? 0) > 10 * 1024 * 1024)
    throw new Error("Vui lòng chọn ảnh nhỏ hơn 10 MB.");
  return image;
}
export async function pickCommunityMedia() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    quality: 0.8,
  });
  if (result.canceled) return null;
  const media = result.assets[0];
  const limit = media.type === "video" ? 50 : 10;
  if ((media.fileSize ?? 0) > limit * 1024 * 1024)
    throw new Error(`Vui lòng chọn tệp nhỏ hơn ${limit} MB.`);
  return media;
}
export async function imageForm(
  image: ImagePicker.ImagePickerAsset,
  field = "image",
) {
  const form = new FormData();
  await appendImage(form, image, field);
  return form;
}
export async function appendImage(
  form: FormData,
  image: ImagePicker.ImagePickerAsset,
  field: string,
) {
  if (Platform.OS === "web")
    form.append(
      field,
      await (await fetch(image.uri)).blob(),
      image.fileName ?? "photo.jpg",
    );
  else
    form.append(field, {
      uri: image.uri,
      name: image.fileName ?? "photo.jpg",
      type: image.mimeType ?? "image/jpeg",
    } as unknown as Blob);
}
