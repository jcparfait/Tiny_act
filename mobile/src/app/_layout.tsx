import {
  ActivityIndicator,
  View,
} from "react-native";

import { Stack } from "expo-router";

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
  const { user, loading } = useAuth();

  if (loading) {
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
      </Stack.Protected>

      <Stack.Protected guard={Boolean(user)}>
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="session/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
