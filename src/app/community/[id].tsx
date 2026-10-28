import { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AuthGate, Button, Field, s, Screen, State } from "../../components/ui";
import { PostCard } from "../../components/PostCard";
import { useAction, useResource } from "../../lib/hooks";
import { api } from "../../lib/client";
import { useStore } from "../../lib/store";
import type { Comment, Feed, Post } from "../../lib/types";
export default function Detail() {
  return (
    <AuthGate>
      <PostDetails />
    </AuthGate>
  );
}
function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [parent, setParent] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const action = useAction();
  const store = useStore();
  const post = useResource<Post>(`/community/posts/${id}`);
  const comments = useResource<Feed<Comment>>(
    `/community/posts/${id}/comments?page=${page}${parent ? `&parentId=${parent}` : ""}`,
  );
  const following = useResource<string[]>("/community/following");
  const followed = post.data && following.data?.includes(post.data.userId?._id);
  return (
    <Screen>
      <State loading={post.loading} error={post.error} retry={post.reload} />
      {post.data && (
        <>
          <PostCard post={post.data} reload={post.reload} detail />
          {post.data.userId?._id !== store.user?._id && (
            <Button
              light
              busy={action.busy}
              title={followed ? "Bỏ theo dõi tác giả" : "Theo dõi tác giả"}
              onPress={() =>
                action.run(async () => {
                  await api(
                    `/community/users/${post.data!.userId._id}/follow`,
                    { method: "POST" },
                  );
                  following.reload();
                })
              }
            />
          )}
        </>
      )}
      <Text style={s.heading}>
        {parent ? "Trả lời bình luận" : "Bình luận"}
      </Text>
      {parent && (
        <Button
          light
          title="Về tất cả bình luận"
          onPress={() => {
            setParent(null);
            setPage(1);
          }}
        />
      )}
      <State
        loading={comments.loading}
        error={comments.error}
        retry={comments.reload}
        empty={
          comments.data?.items.length === 0
            ? "Chưa có bình luận. Hãy bắt đầu câu chuyện."
            : undefined
        }
      />
      {comments.data?.items.map((comment) => (
        <View key={comment._id} style={s.card}>
          <Text style={s.body}>{comment.userId?.fullName ?? "Thành viên"}</Text>
          <Text style={s.muted}>{comment.content}</Text>
          <View style={s.row}>
            <Button
              light
              title="Thích"
              busy={action.busy}
              onPress={() =>
                action.run(async () => {
                  await api(
                    `/community/posts/${id}/comments/${comment._id}/react`,
                    { method: "POST", body: { type: "like" } },
                  );
                  comments.reload();
                })
              }
            />
            {!parent && (
              <Button
                title={`Trả lời (${comment.replyCount ?? 0})`}
                light
                onPress={() => {
                  setParent(comment._id);
                  setPage(1);
                }}
              />
            )}
          </View>
        </View>
      ))}
      {(comments.data?.totalPages ?? 0) > 1 && (
        <View style={s.between}>
          <Button
            light
            title="Trước"
            disabled={page <= 1}
            onPress={() => setPage((p) => p - 1)}
          />
          <Text>{page}</Text>
          <Button
            light
            title="Sau"
            disabled={page >= (comments.data?.totalPages ?? 1)}
            onPress={() => setPage((p) => p + 1)}
          />
        </View>
      )}
      <Field
        label={parent ? "Nội dung trả lời" : "Viết bình luận"}
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={1000}
      />
      <Button
        title="Gửi bình luận"
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            if (!content.trim()) throw new Error("Nhập nội dung bình luận.");
            await api(`/community/posts/${id}/comments`, {
              method: "POST",
              body: {
                content: content.trim(),
                ...(parent ? { parentId: parent } : {}),
              },
            });
            setContent("");
            comments.reload();
            post.reload();
          })
        }
      />
      {!!action.error && <Text style={s.error}>{action.error}</Text>}
    </Screen>
  );
}
