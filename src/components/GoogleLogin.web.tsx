import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useStore } from "../lib/store";

export function GoogleLogin({ title = "Tiếp tục với Google" }: { title?: string }) {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    "1047142545241-pge0ccn9njp66g9sjoo6bgo8dnihlpr6.apps.googleusercontent.com";

  useEffect(() => {
    if (!clientId || typeof window === "undefined") return;

    let mounted = true;

    function initGoogle() {
      const google = (window as unknown as { google?: any }).google;
      if (!google?.accounts?.id || !containerRef.current) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (res: { credential?: string }) => {
          if (!res.credential) {
            setError("Không nhận được thông tin xác thực từ Google.");
            return;
          }
          try {
            setLoading(true);
            setError(null);
            await store.googleLogin(res.credential);
            router.replace("/account");
          } catch (err: any) {
            setError(err?.message || "Đăng nhập Google thất bại. Vui lòng thử lại.");
          } finally {
            if (mounted) setLoading(false);
          }
        },
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: 320,
        });
      }
    }

    if ((window as unknown as { google?: any }).google?.accounts?.id) {
      initGoogle();
    } else {
      const existing = document.getElementById("google-jssdk");
      if (existing) {
        existing.addEventListener("load", initGoogle);
      } else {
        const script = document.createElement("script");
        script.id = "google-jssdk";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        script.onerror = () => setError("Không thể tải Google Sign-In SDK.");
        document.head.appendChild(script);
      }
    }

    return () => {
      mounted = false;
    };
  }, [clientId, store]);

  if (!clientId) return null;

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#245c48" size="small" />
          <Text style={styles.loadingText}>Đang xác thực Google...</Text>
        </View>
      ) : (
        <div
          ref={containerRef as any}
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            minHeight: 44,
          }}
        />
      )}
      {!!error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color="#a34131" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  loadingBox: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#20382d",
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
    width: "100%",
  },
  errorText: {
    color: "#a34131",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
