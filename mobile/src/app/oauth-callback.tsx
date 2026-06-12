import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  AuthLink,
  AuthScreen,
} from "../components/AuthScreen";

import { ErrorBox } from "../components/ErrorBox";
import { useAuth } from "../context/AuthContext";

export default function OauthCallbackScreen() {
  const router = useRouter();

  const { completeSocialSignIn } = useAuth();

  const params = useLocalSearchParams<{
    code?: string | string[];
    error?: string | string[];
  }>();

  const code =
    Array.isArray(params.code)
      ? params.code[0]
      : params.code;

  const oauthError =
    Array.isArray(params.error)
      ? params.error[0]
      : params.error;

  const [error, setError] =
    useState<string | null>(
      oauthError || null
    );

  useEffect(() => {
    if (!code || oauthError) return;

    completeSocialSignIn(code).catch(
      (exchangeError) => {
        setError(
          exchangeError instanceof Error
            ? exchangeError.message
            : "Impossible de terminer la connexion."
        );
      }
    );
  }, [
    code,
    oauthError,
    completeSocialSignIn,
  ]);

  return (
    <AuthScreen
      title="Connexion"
      subtitle="Tiny Act termine la connexion à ton compte."
    >
      {!error && <ActivityIndicator />}

      {!error && (
        <Text
          style={{
            textAlign: "center",
            color: "#5D5A70",
            fontWeight: "700",
          }}
        >
          Connexion en cours…
        </Text>
      )}

      {error && <ErrorBox message={error} />}

      {error && (
        <AuthLink
          label="Retour à la connexion"
          onPress={() => router.replace("/login")}
        />
      )}
    </AuthScreen>
  );
}
