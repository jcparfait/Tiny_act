import { useState } from "react";

import { Text, View } from "react-native";

import { useRouter } from "expo-router";

import {
  AuthField,
  AuthLink,
  AuthScreen,
} from "../components/AuthScreen";

import { ErrorBox } from "../components/ErrorBox";
import { PrimaryButton } from "../components/PrimaryButton";

import { useAuth } from "../context/AuthContext";
import { TA } from "../theme/tinyActTheme";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const { requestPasswordReset } = useAuth();

  const [email, setEmail] =
    useState("");

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Renseigne ton adresse email.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      setMessage(
        await requestPasswordReset(email.trim())
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossible d’envoyer la demande."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Mot de passe oublié"
      subtitle="Entre ton email, on t’enverra un lien pour choisir un nouveau mot de passe."
    >
      <View
        style={{
          padding: 18,
          borderRadius: 28,
          backgroundColor: "#FFF4E4",
          borderWidth: 1.5,
          borderColor: "#F5D7A8",
          gap: 8,
        }}
      >
        <Text
          style={{
            color: "#F39A20",
            fontSize: 12,
            lineHeight: 15,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          Récupération
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 26,
            lineHeight: 30,
            fontFamily: TA.fonts.black,
            letterSpacing: -1,
          }}
        >
          On te remet l’accès.
        </Text>

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: TA.fonts.bold,
          }}
        >
          Utilise l’adresse liée à ton compte Tiny Act.
        </Text>
      </View>

      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="email@exemple.fr"
        onSubmitEditing={handleSubmit}
      />

      {message && (
        <View
          style={{
            padding: 13,
            borderRadius: 18,
            backgroundColor: "#EAF8EF",
            borderWidth: 1.5,
            borderColor: "#2EAD63",
          }}
        >
          <Text
            style={{
              color: "#176C3A",
              fontSize: 14,
              lineHeight: 20,
              fontFamily: TA.fonts.black,
            }}
          >
            {message}
          </Text>
        </View>
      )}

      {error && <ErrorBox message={error} />}

      <PrimaryButton
        label={
          submitting
            ? "Envoi..."
            : "Envoyer le lien"
        }
        onPress={handleSubmit}
        disabled={submitting}
      />

      <AuthLink
        label="Retour à la connexion"
        onPress={() => router.replace("/login")}
      />
    </AuthScreen>
  );
}
