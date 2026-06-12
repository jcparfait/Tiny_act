import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "tiny_act_auth_token";

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") {
        return null;
      }

      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function setAuthToken(
  token: string
): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(
    AUTH_TOKEN_KEY,
    token
  );
}

export async function deleteAuthToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}
