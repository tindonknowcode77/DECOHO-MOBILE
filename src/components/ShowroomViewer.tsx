import { WebView } from "react-native-webview";
import { useMemo } from "react";
import { showroomHtml } from "../lib/showroom-html";
import type { Showroom } from "../lib/types";
export function ShowroomViewer({ room }: { room: Showroom }) {
  const html = useMemo(() => showroomHtml(room), [room]);
  return (
    <WebView
      source={{ html, baseUrl: "https://decoho.local" }}
      originWhitelist={["https://*", "about:*"]}
      onShouldStartLoadWithRequest={(r) =>
        r.url === "about:blank" || r.url.startsWith("https://decoho.local")
      }
      javaScriptEnabled
      style={{ height: 420, backgroundColor: "#eeeee4" }}
      scrollEnabled={false}
    />
  );
}
