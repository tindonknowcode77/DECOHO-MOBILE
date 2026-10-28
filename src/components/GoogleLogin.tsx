import Constants, { ExecutionEnvironment } from "expo-constants";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAction } from "../lib/hooks";
import { useStore } from "../lib/store";

import { colors, fontFamilies } from "./ui";

function loadWebGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as unknown as { google?: { accounts?: unknown } }).google?.accounts) return resolve();
    const existing = document.getElementById("google-jssdk");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "google-jssdk";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không thể tải thư viện Google Sign-in. Vui lòng thử lại."));
    document.head.appendChild(script);
  });
}

export function GoogleLogin({ title = "Tiếp tục với Google" }: { title?: string }) {
  const action = useAction();
  const store = useStore();
  const clientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    "1047142545241-pge0ccn9njp66g9sjoo6bgo8dnihlpr6.apps.googleusercontent.com";
  if (!clientId) return null;

  async function handleGoogleLogin() {
    if (Platform.OS === "web") {
      await loadWebGoogleScript();
      const google = (window as unknown as { google?: { accounts?: { id?: { initialize: (c: unknown) => void; prompt: () => void } } } }).google?.accounts?.id;
      if (!google) throw new Error("Chưa khởi tạo được Google Sign-In trên web.");

      await new Promise<void>((resolve, reject) => {
        google.initialize({
          client_id: clientId,
          callback: async (res: { credential?: string }) => {
            try {
              if (!res.credential) {
                throw new Error("Không nhận được thông tin xác thực từ Google.");
              }
              await store.googleLogin(res.credential);
              router.replace("/account");
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });
        google.prompt();
      });
      return;
    }

    // Native Mobile (Android APK / iOS)
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      throw new Error(
        "Google Sign-In native cần chạy trên file APK đã cài đặt hoặc Development Build (không hỗ trợ Expo Go cơ bản).",
      );
    }

    const { GoogleSignin, isSuccessResponse } =
      await import("@react-native-google-signin/google-signin");
    GoogleSignin.configure({
      webClientId: clientId,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return;
    if (!response.data.idToken) {
      throw new Error(
        "Google chưa trả về thông tin đăng nhập. Vui lòng thử lại.",
      );
    }
    await store.googleLogin(response.data.idToken);
    router.replace("/account");
  }

  return (
    <View style={{ gap: 8, width: "100%" }}>
      <Pressable
        accessibilityRole="button"
        disabled={action.busy}
        onPress={() => action.run(handleGoogleLogin)}
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        ]}
      >
        {action.busy ? (
          <ActivityIndicator color="#4285F4" size="small" />
        ) : (
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name="logo-google" size={17} color="#EA4335" />
            </View>
            <Text style={styles.text}>{title}</Text>
          </View>
        )}
      </Pressable>
      {!!action.error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color="#a34131" />
          <Text style={styles.errorText}>{action.error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e3ded4",
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#20382d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fdf4f2",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
    fontFamily: fontFamilies.heading,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fdf2f0",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f5cac3",
  },
  errorText: {
    color: "#a34131",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontFamily: fontFamilies.body,
  },
});
