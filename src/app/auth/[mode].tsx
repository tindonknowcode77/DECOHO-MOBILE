import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { GoogleLogin } from "../../components/GoogleLogin";
import { colors } from "../../components/ui";
import { api } from "../../lib/client";
import { useAction } from "../../lib/hooks";
import { useStore } from "../../lib/store";

const logoImg = require("../../../assets/decoho-logo-horizontal.png");

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: "email" | "name" | "current-password" | "new-password" | "off";
  maxLength?: number;
  rightAction?: React.ReactNode;
}

function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  autoComplete,
  maxLength,
  rightAction,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name={iconName}
          size={19}
          color={focused ? colors.green : "#8d968b"}
          style={styles.inputLeftIcon}
        />
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca399"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.textInputField}
        />
        {rightAction && <View style={styles.inputRightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

export default function AuthScreen() {
  const {
    mode = "login",
    token: linkToken,
    returnTo,
  } = useLocalSearchParams<{
    mode: string;
    token?: string;
    returnTo?: string;
  }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState(linkToken ?? "");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const action = useAction();
  const store = useStore();

  const isMainAuth = mode === "login" || mode === "register";

  async function submit() {
    setMessage("");
    if (
      ["login", "register", "forgot"].includes(mode) &&
      !/^\S+@\S+\.\S+$/.test(email.trim())
    ) {
      throw new Error("Vui lòng nhập địa chỉ email hợp lệ.");
    }
    if (
      ["login", "register", "reset"].includes(mode) &&
      (password.length < 6 || password.length > 72)
    ) {
      throw new Error("Mật khẩu cần từ 6 đến 72 ký tự.");
    }

    if (mode === "login") {
      await store.login(email.trim(), password);
      router.replace(
        returnTo?.startsWith("/") &&
          !returnTo.startsWith("//") &&
          !returnTo.startsWith("/auth")
          ? (returnTo as Href)
          : "/account",
      );
      return;
    }

    if (mode === "register") {
      if (name.trim().length < 2) throw new Error("Vui lòng nhập họ và tên của bạn.");
      const result = await api<{ emailSent?: boolean }>("/auth/register", {
        method: "POST",
        auth: false,
        body: { fullName: name.trim(), email: email.trim(), password },
      });
      setMessage(
        result.emailSent === false
          ? "Tài khoản đã tạo thành công, nhưng máy chủ chưa gửi được email. Vui lòng thử lại hoặc gửi lại mã."
          : "Đã tạo tài khoản thành công! Vui lòng kiểm tra hộp thư email để kích hoạt tài khoản.",
      );
    } else if (mode === "forgot") {
      await api("/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: { email: email.trim() },
      });
      setMessage(
        "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.",
      );
    } else if (mode === "reset") {
      if (token.trim().length < 20) {
        throw new Error("Vui lòng nhập mã token hợp lệ từ liên kết trong email.");
      }
      await api("/auth/reset-password", {
        method: "POST",
        auth: false,
        body: { token: token.trim(), password },
      });
      setMessage("Đổi mật khẩu thành công! Bây giờ bạn có thể đăng nhập.");
    } else if (mode === "verify") {
      if (token.trim().length < 20) {
        throw new Error("Vui lòng nhập mã token xác thực nhận được trong email.");
      }
      await api("/auth/verify-token", {
        method: "POST",
        auth: false,
        body: { token: token.trim() },
      });
      setMessage("Email đã được xác thực thành công. Bạn có thể đăng nhập ngay!");
    } else {
      throw new Error("Trang xác thực không hợp lệ.");
    }
  }

  async function handleResendEmail() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      throw new Error("Vui lòng nhập email để gửi lại mã xác thực.");
    }
    const result = await api<{ emailSent?: boolean }>("/auth/resend-token", {
      method: "POST",
      auth: false,
      body: { email: email.trim() },
    });
    setMessage(
      result.emailSent === false
        ? "Máy chủ chưa thể gửi email lúc này. Vui lòng liên hệ hỗ trợ."
        : "Đã gửi lại email xác thực. Bạn vui lòng kiểm tra hộp thư (cả mục Spam/Rác).",
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Bar */}
        <View style={styles.topNav}>
          {!isMainAuth ? (
            <Pressable
              onPress={() => router.replace("/auth/login")}
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Quay lại đăng nhập"
            >
              <Ionicons name="arrow-back" size={20} color={colors.ink} />
              <Text style={styles.backButtonText}>Đăng nhập</Text>
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}

          <Pressable
            onPress={() => router.push("/")}
            style={({ pressed }) => [
              styles.homeButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Về trang chủ"
          >
            <Ionicons name="close-outline" size={24} color={colors.ink} />
          </Pressable>
        </View>

        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Image
            source={logoImg}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTagline}>
            {mode === "login" && "Mừng bạn quay trở lại tổ ấm DECOHO"}
            {mode === "register" && "Khởi đầu không gian sống mơ ước của bạn"}
            {mode === "forgot" && "Khôi phục quyền truy cập tài khoản"}
            {mode === "reset" && "Thiết lập mật khẩu bảo mật mới"}
            {mode === "verify" && "Xác thực địa chỉ email tài khoản"}
          </Text>
        </View>

        {/* Tab Switcher (Chỉ hiện khi ở Login / Register) */}
        {isMainAuth && (
          <View style={styles.tabSwitcher}>
            <Pressable
              onPress={() => {
                if (mode !== "login") router.replace("/auth/login");
              }}
              style={[
                styles.tabItem,
                mode === "login" && styles.tabItemActive,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "login" }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "login" && styles.tabTextActive,
                ]}
              >
                Đăng nhập
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (mode !== "register") router.replace("/auth/register");
              }}
              style={[
                styles.tabItem,
                mode === "register" && styles.tabItemActive,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "register" }}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "register" && styles.tabTextActive,
                ]}
              >
                Đăng ký
              </Text>
            </Pressable>
          </View>
        )}

        {/* Main Card */}
        <View style={styles.card}>
          {/* Form Fields */}
          {mode === "register" && (
            <AuthInput
              label="Họ và tên"
              value={name}
              onChangeText={setName}
              placeholder="Nguyễn Văn A"
              iconName="person-outline"
              autoCapitalize="words"
              autoComplete="name"
              maxLength={160}
            />
          )}

          {["login", "register", "forgot"].includes(mode) && (
            <AuthInput
              label="Địa chỉ Email"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              iconName="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              maxLength={254}
            />
          )}

          {["verify", "reset"].includes(mode) && (
            <AuthInput
              label="Mã token xác thực"
              value={token}
              onChangeText={setToken}
              placeholder="Nhập mã token từ email..."
              iconName="key-outline"
              autoCapitalize="none"
            />
          )}

          {["login", "register", "reset"].includes(mode) && (
            <View style={{ gap: 6 }}>
              <AuthInput
                label={mode === "reset" ? "Mật khẩu mới" : "Mật khẩu"}
                value={password}
                onChangeText={setPassword}
                placeholder="Ít nhất 6 ký tự"
                iconName="lock-closed-outline"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                maxLength={72}
                rightAction={
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#8c9489"
                    />
                  </Pressable>
                }
              />

              {mode === "login" && (
                <Pressable
                  onPress={() => router.push("/auth/forgot")}
                  style={styles.forgotPasswordPressable}
                  accessibilityRole="link"
                >
                  <Text style={styles.forgotPasswordText}>
                    Quên mật khẩu?
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Error Banner */}
          {!!action.error && (
            <View style={styles.alertError}>
              <Ionicons
                name="alert-circle"
                size={18}
                color="#a34131"
                style={{ marginTop: 1 }}
              />
              <Text style={styles.alertErrorText}>{action.error}</Text>
            </View>
          )}

          {/* Success / Info Message Banner */}
          {!!message && (
            <View style={styles.alertSuccess}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#245c48"
                style={{ marginTop: 1 }}
              />
              <Text style={styles.alertSuccessText}>{message}</Text>
            </View>
          )}

          {/* Primary Action Button */}
          <Pressable
            disabled={action.busy}
            onPress={() => action.run(submit)}
            style={({ pressed }) => [
              styles.primaryButton,
              action.busy && { opacity: 0.6 },
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
            accessibilityRole="button"
          >
            {action.busy ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.primaryButtonText}>
                  {mode === "login" && "Đăng nhập"}
                  {mode === "register" && "Tạo tài khoản"}
                  {mode === "forgot" && "Gửi hướng dẫn đặt lại"}
                  {mode === "reset" && "Đổi mật khẩu"}
                  {mode === "verify" && "Xác nhận kích hoạt"}
                </Text>
                <Ionicons
                  name={
                    mode === "login"
                      ? "arrow-forward"
                      : mode === "register"
                        ? "sparkles"
                        : "checkmark"
                  }
                  size={18}
                  color="#ffffff"
                />
              </View>
            )}
          </Pressable>

          {/* Social Divider & Google Sign-in for Login / Register */}
          {isMainAuth && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
                <View style={styles.dividerLine} />
              </View>

              <GoogleLogin
                title={
                  mode === "login"
                    ? "Đăng nhập bằng Google"
                    : "Đăng ký bằng Google"
                }
              />
            </>
          )}

          {/* Terms notice for Register */}
          {mode === "register" && (
            <Text style={styles.termsText}>
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> &{" "}
              <Text style={styles.termsLink}>Chính sách bảo mật</Text> của DECOHO.
            </Text>
          )}
        </View>

        {/* Footer Navigation Links */}
        <View style={styles.footerLinks}>
          {mode === "login" && (
            <View style={styles.switchRow}>
              <Text style={styles.switchPromptText}>Chưa có tài khoản?</Text>
              <Pressable onPress={() => router.replace("/auth/register")}>
                <Text style={styles.switchActionText}> Đăng ký ngay</Text>
              </Pressable>
            </View>
          )}

          {mode === "register" && (
            <View style={styles.switchRow}>
              <Text style={styles.switchPromptText}>Đã có tài khoản?</Text>
              <Pressable onPress={() => router.replace("/auth/login")}>
                <Text style={styles.switchActionText}> Đăng nhập ngay</Text>
              </Pressable>
            </View>
          )}

          {/* Sub actions for verify / forgot */}
          {mode === "forgot" && (
            <Pressable
              onPress={() => router.push("/auth/reset")}
              style={styles.subLinkButton}
            >
              <Text style={styles.subLinkText}>
                Đã có mã token đặt lại mật khẩu? Nhập token →
              </Text>
            </Pressable>
          )}

          {(mode === "register" || mode === "verify") && (
            <View style={styles.resendCard}>
              <Pressable
                onPress={() => setShowResend(!showResend)}
                style={styles.resendToggle}
              >
                <Ionicons
                  name="mail-unread-outline"
                  size={16}
                  color={colors.green}
                />
                <Text style={styles.resendToggleText}>
                  Chưa nhận được email xác thực?
                </Text>
                <Ionicons
                  name={showResend ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.green}
                />
              </Pressable>

              {showResend && (
                <View style={styles.resendForm}>
                  <AuthInput
                    label="Email cần gửi lại mã"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    iconName="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Pressable
                    disabled={action.busy}
                    onPress={() => action.run(handleResendEmail)}
                    style={({ pressed }) => [
                      styles.resendButton,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.resendButtonText}>
                      Gửi lại email kích hoạt
                    </Text>
                  </Pressable>

                  {mode !== "verify" && (
                    <Pressable
                      onPress={() => router.push("/auth/verify")}
                      style={{ marginTop: 6 }}
                    >
                      <Text style={styles.enterTokenText}>
                        Đã có mã xác thực? Bấm vào đây để nhập mã →
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 32,
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  homeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e5da",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoImage: {
    width: 170,
    height: 48,
  },
  brandTagline: {
    fontSize: 14,
    color: "#6b7568",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#ebe9e2",
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#747c71",
  },
  tabTextActive: {
    color: colors.green,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: "#e6e2d8",
    shadowColor: "#20382d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2f382d",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faf9f6",
    borderWidth: 1.5,
    borderColor: "#e7e2d7",
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: colors.green,
    backgroundColor: "#ffffff",
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    height: "100%",
  },
  inputRightAction: {
    paddingLeft: 8,
  },
  forgotPasswordPressable: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: colors.green,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: colors.green,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 4,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eae5dc",
  },
  dividerText: {
    fontSize: 12,
    color: "#979e94",
    fontWeight: "500",
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#838c80",
    textAlign: "center",
    marginTop: 2,
  },
  termsLink: {
    color: colors.green,
    fontWeight: "600",
  },
  alertError: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fdf3f2",
    borderWidth: 1,
    borderColor: "#f7cac4",
    borderRadius: 14,
    padding: 12,
  },
  alertErrorText: {
    flex: 1,
    fontSize: 13,
    color: "#a34131",
    lineHeight: 19,
  },
  alertSuccess: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f1f8f3",
    borderWidth: 1,
    borderColor: "#cde3d4",
    borderRadius: 14,
    padding: 12,
  },
  alertSuccessText: {
    flex: 1,
    fontSize: 13,
    color: "#245c48",
    lineHeight: 19,
  },
  footerLinks: {
    marginTop: 22,
    alignItems: "center",
    gap: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  switchPromptText: {
    fontSize: 14,
    color: "#6b7568",
  },
  switchActionText: {
    fontSize: 14,
    color: colors.green,
    fontWeight: "700",
  },
  subLinkButton: {
    paddingVertical: 6,
  },
  subLinkText: {
    fontSize: 13,
    color: colors.green,
    fontWeight: "600",
  },
  resendCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8e5dc",
    padding: 14,
    marginTop: 4,
  },
  resendToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  resendToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.green,
  },
  resendForm: {
    marginTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0ece4",
    paddingTop: 12,
  },
  resendButton: {
    backgroundColor: "#edf3e7",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resendButtonText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "700",
  },
  enterTokenText: {
    fontSize: 12,
    color: "#838c80",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
