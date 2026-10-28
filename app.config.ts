import type { ConfigContext, ExpoConfig } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME;
  const plugins = (config.plugins ?? []).filter(
    (plugin) =>
      (typeof plugin === "string" ? plugin : plugin[0]) !==
      "@react-native-google-signin/google-signin",
  );
  if (iosUrlScheme)
    plugins.push([
      "@react-native-google-signin/google-signin",
      { iosUrlScheme },
    ]);
  return {
    ...config,
    name: "DECOHO",
    slug: "decoho-mobile",
    plugins,
    ios: { ...config.ios, bundleIdentifier: "com.decoho.mobile" },
    android: { ...config.android, package: "com.decoho.mobile" },
  };
};
