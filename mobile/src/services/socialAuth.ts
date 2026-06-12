import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { getApiBaseUrl } from "./authApi";

export type SocialProvider =
  | "google_oauth2"
  | "facebook";

WebBrowser.maybeCompleteAuthSession();

export async function startSocialAuth(
  provider: SocialProvider
): Promise<string | null> {
  const returnTo =
    Platform.OS === "web"
      ? `${window.location.origin}/oauth-callback`
      : Linking.createURL("oauth-callback");

  const startUrl =
    `${getApiBaseUrl()}/mobile_oauth/${provider}` +
    `?return_to=${encodeURIComponent(returnTo)}`;

  if (Platform.OS === "web") {
    window.location.assign(startUrl);
    return null;
  }

  const result =
    await WebBrowser.openAuthSessionAsync(
      startUrl,
      returnTo
    );

  if (result.type !== "success") {
    return null;
  }

  const parsed = Linking.parse(result.url);

  const error = parsed.queryParams?.error;
  const code = parsed.queryParams?.code;

  if (typeof error === "string") {
    throw new Error(error);
  }

  return typeof code === "string" ? code : null;
}
