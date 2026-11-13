import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { colors, fontFamilies } from "../../components/ui";
import { useStore } from "../../lib/store";

WebBrowser.maybeCompleteAuthSession();

function pickString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseTokensFromUrl(url: string): { accessToken: string; refreshToken: string } | null {
  const normalized = url.replace("#", "?");
  const queryIdx = normalized.indexOf("?");
  if (queryIdx === -1) return null;
  const params = new URLSearchParams(normalized.slice(queryIdx + 1));
  const accessToken = params.get("accessToken")?.trim() ?? "";
  const refreshToken = params.get("refreshToken")?.trim() ?? "";
  return accessToken ? { accessToken, refreshToken } : null;
}

export default function AuthCallbackScreen() {
  const store = useStore();
  const params = useLocalSearchParams<{
    accessToken?: string | string[];
    refreshToken?: string | string[];
  }>();
  const [error, setError] = useState("");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    async function completeAuth() {
      let accessToken = pickString(params.accessToken).trim();
      let refreshToken = pickString(params.refreshToken).trim();

      if (!accessToken) {
        const initialUrl = await Linking.getInitialURL();
        const parsed = initialUrl ? parseTokensFromUrl(initialUrl) : null;
        if (parsed) {
          accessToken = parsed.accessToken;
          refreshToken = parsed.refreshToken;
        }
      }

      if (!accessToken) {
        setError("Không nhận được token xác thực từ trình duyệt. Vui lòng thử đăng nhập lại.");
        return;
      }

      handledRef.current = true;
      try {
        await store.loginWithTokens({ accessToken, refreshToken });
        router.replace("/account");
      } catch (err) {
        handledRef.current = false;
        setError(
          err instanceof Error
            ? err.message
            : "Xác thực phiên đăng nhập thất bại. Vui lòng thử lại.",
        );
      }
    }

    void completeAuth();
  }, [params.accessToken, params.refreshToken, store]);

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập chưa hoàn tất</Text>
          <Text style={styles.message}>{error}</Text>
          <Pressable
            style={styles.button}
            onPress={() => router.replace("/auth/login")}
          >
            <Text style={styles.buttonText}>Quay lại đăng nhập</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={styles.title}>Đang xác thực tài khoản...</Text>
          <Text style={styles.message}>Vui lòng chờ trong giây lát.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
