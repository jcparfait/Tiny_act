import { useEffect } from "react";

import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Stack,
  useRouter,
  useSegments,
} from "expo-router";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

import { TA } from "../theme/tinyActTheme";

function applyDefaultFonts() {
  const textDefaultProps =
    (Text as unknown as {
      defaultProps?: Record<string, unknown>;
    }).defaultProps || {};

  const inputDefaultProps =
    (TextInput as unknown as {
      defaultProps?: Record<string, unknown>;
    }).defaultProps || {};

  (Text as unknown as {
    defaultProps: Record<string, unknown>;
  }).defaultProps = {
    ...textDefaultProps,
    style: [
      textDefaultProps.style,
      {
        fontFamily: TA.fonts.regular,
      },
    ],
  };

  (TextInput as unknown as {
    defaultProps: Record<string, unknown>;
  }).defaultProps = {
    ...inputDefaultProps,
    style: [
      inputDefaultProps.style,
      {
        fontFamily: TA.fonts.regular,
      },
    ],
  };
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyDefaultFonts();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: TA.colors.bg,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

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
          backgroundColor: TA.colors.bg,
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
        contentStyle: {
          backgroundColor: TA.colors.bg,
        },
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
