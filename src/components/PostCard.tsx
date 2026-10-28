import { Alert, Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import { VideoPlayer } from "./VideoPlayer";
import { colors, Icon, IconButton, Photo, s } from "./ui";
import { useStore } from "../lib/store";
import { useAction } from "../lib/hooks";
import { api } from "../lib/client";
import { rooms, type Post } from "../lib/types";
export function PostCard({
  post,
  reload,
  detail = false,
}: {
  post: Post;
  reload: () => void;
  detail?: boolean;
}) {
  const store = useStore();
  const action = useAction();
  const mutate = (suffix: string, body?: unknown) => {
    if (store.requireLogin())
      void action.run(async () => {
        await api(`/community/posts/${post._id}/${suffix}`, {
          method: "POST",
          body,
        });
        reload();
      });
  };
  return (
    <View style={s.card}>
      <View style={s.between}>
        <View style={[s.row, { flex: 1 }]}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: colors.lime,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={s.heading}>{post.userId?.fullName?.[0] ?? "D"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.body}>
              {post.userId?.fullName ?? "Thành viên DECOHO"}
            </Text>
            <Text style={s.muted}>
              {rooms[post.roomType] ?? post.roomType} ·{" "}
              {new Date(post.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        </View>
        {store.user?._id === post.userId?._id && (
          <IconButton
            name="trash-outline"
            label="Xóa bài đăng"
            onPress={() =>
              Alert.alert("Xóa bài đăng?", "Bài đăng và bình luận sẽ bị xóa.", [
                { text: "Giữ lại", style: "cancel" },
                {
                  text: "Xóa",
                  style: "destructive",
                  onPress: () =>
                    action.run(async () => {
                      await api(`/community/posts/${post._id}`, {
                        method: "DELETE",
                      });
                      if (detail) router.replace("/community");
                      else reload();
                    }),
                },
              ])
            }
          />
        )}
      </View>
      <Text style={s.body}>{post.description}</Text>
      {post.media.map((media, i) => (
        <View key={i}>
          {media.type === "video" ? (
            <VideoPlayer uri={media.url} />
          ) : (
            <Photo uri={media.url} height={250} />
          )}
        </View>
      ))}
      {!!post.hashtags.length && (
        <Text style={{ color: colors.green, fontSize: 13 }}>
          {post.hashtags.map((x) => `#${x}`).join(" ")}
        </Text>
      )}
      <View style={s.between}>
        <Pressable
          accessibilityRole="button"
          disabled={action.busy}
          onPress={() => mutate("react", { type: "love" })}
          style={s.row}
        >
          <Icon
            name={post.myReaction ? "heart" : "heart-outline"}
            color={post.myReaction ? "#b96753" : colors.green}
          />
          <Text style={s.muted}>{post.likeCount ?? 0}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (store.requireLogin()) router.push(`/community/${post._id}`);
          }}
          style={s.row}
        >
          <Icon name="chatbubble-outline" />
          <Text style={s.muted}>{post.commentCount}</Text>
        </Pressable>
        <IconButton
          name={post.saved ? "bookmark" : "bookmark-outline"}
          label="Lưu bài đăng"
          onPress={() => mutate("save")}
        />
        <IconButton
          name="share-outline"
          label="Chia sẻ bài đăng"
          onPress={() =>
            action.run(async () => {
              await Share.share({
                message: `${post.description}\n${process.env.EXPO_PUBLIC_WEB_URL ?? "https://decoho-fe.vercel.app"}/community/post/${post._id}`,
              });
            })
          }
        />
      </View>
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
    </View>
  );
}
