import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Chips,
  Field,
  Heading,
  s,
  Screen,
  State,
} from "../../components/ui";
import { PostCard } from "../../components/PostCard";
import { useResource } from "../../lib/hooks";
import { useStore } from "../../lib/store";
import type { Feed, Post } from "../../lib/types";
export default function Community() {
  const store = useStore();
  const [tab, setTab] = useState("for-you");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const path = search
    ? `/community/search?q=${encodeURIComponent(search)}&page=${page}`
    : `/community/${store.user ? "feed" : "posts"}?tab=${tab}&page=${page}&limit=10`;
  const data = useResource<Feed<Post>>(path);
  return (
    <Screen>
      <Heading
        eyebrow="THE DECOHO COMMUNITY"
        title={"Nhà đẹp hơn\nkhi cùng sẻ chia."}
        subtitle="Những góc nhỏ, những câu chuyện lớn từ người yêu nhà."
      />
      <Button
        title="+ Chia sẻ không gian của bạn"
        onPress={() => {
          if (store.requireLogin()) router.push("/community/create");
        }}
      />
      <Field
        label="Tìm câu chuyện"
        placeholder="Tìm theo nội dung, hashtag…"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => {
          if (store.requireLogin()) {
            setPage(1);
            setSearch(query.trim());
          }
        }}
      />
      <Button
        light
        title="Tìm kiếm"
        onPress={() => {
          if (store.requireLogin()) {
            setPage(1);
            setSearch(query.trim());
          }
        }}
      />
      <Chips
        value={tab}
        onChange={(value) => {
          if (["following", "saved"].includes(value) && !store.requireLogin())
            return;
          setTab(value);
          setPage(1);
          setSearch("");
          setQuery("");
        }}
        items={[
          { id: "for-you", label: "Dành cho bạn" },
          { id: "following", label: "Đang theo dõi" },
          { id: "saved", label: "Đã lưu" },
          { id: "tips", label: "Mẹo hay" },
          { id: "makeovers", label: "Thay đổi không gian" },
        ]}
      />
      <State
        loading={data.loading}
        error={data.error}
        retry={data.reload}
        empty={
          data.data?.items.length === 0
            ? "Chưa có bài đăng trong mục này."
            : undefined
        }
      />
      {data.data?.items.map((post) => (
        <PostCard key={post._id} post={post} reload={data.reload} />
      ))}
      {!!data.data?.totalPages && (
        <View style={s.between}>
          <Button
            title="Trước"
            light
            disabled={page <= 1}
            onPress={() => setPage((p) => p - 1)}
          />
          <Text style={s.muted}>
            {page} / {data.data.totalPages}
          </Text>
          <Button
            title="Sau"
            light
            disabled={page >= data.data.totalPages}
            onPress={() => setPage((p) => p + 1)}
          />
        </View>
      )}
    </Screen>
  );
}
