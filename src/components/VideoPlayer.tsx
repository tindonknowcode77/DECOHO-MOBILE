import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { Text, View } from "react-native";
import { s } from "./ui";
export function VideoPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  const { error } = useEvent(player, "statusChange", { status: player.status });
  useFocusEffect(
    useCallback(
      () => () => {
        player.pause();
      },
      [player],
    ),
  );
  return (
    <View style={{ gap: 8 }}>
      <VideoView
        player={player}
        nativeControls
        fullscreenOptions={{ enable: true }}
        contentFit="contain"
        style={{
          width: "100%",
          height: 250,
          backgroundColor: "#1d2923",
          borderRadius: 18,
        }}
      />
      {error && (
        <Text style={s.error}>
          Không tải được video. Vui lòng kiểm tra kết nối.
        </Text>
      )}
    </View>
  );
}
