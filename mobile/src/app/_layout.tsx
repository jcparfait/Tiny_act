import { useEffect } from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import {
  Stack,
  useRouter,
  useSegments,
} from "expo-router";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const {
    user,
    loading,
  } = useAuth();

  const router = useRouter();
  const segments = useSegments();

  const currentRoute = segments[0];

  const needsInterests =
    Boolean(user) &&
    user!.interest_ids.length === 0;

  const needsAvatar =
    Boolean(user) &&
    user!.interest_ids.length > 0 &&
    !user!.avatar;

  const redirectingToInterests =
    needsInterests &&
    currentRoute !== "interests";

  const redirectingToAvatar =
    needsAvatar &&
    currentRoute !== "avatar";

  useEffect(() => {
    if (loading || !user) return;

    if (redirectingToInterests) {
      router.replace("/interests");
      return;
    }

    if (redirectingToAvatar) {
      router.replace("/avatar");
    }
  }, [
    loading,
    redirectingToAvatar,
    redirectingToInterests,
    router,
    user,
  ]);

  if (
    loading ||
    redirectingToInterests ||
    redirectingToAvatar
  ) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF4EA",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="oauth-callback" />
      </Stack.Protected>

      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="interests" />
        <Stack.Screen name="avatar" />
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="session/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
