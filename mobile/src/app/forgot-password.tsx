import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";

import {
  AuthField,
  AuthLink,
  AuthScreen,
} from "../components/AuthScreen";

import { ErrorBox } from "../components/ErrorBox";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
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

    try {
      setMessage(
        await requestPasswordReset(email)
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
      subtitle="Nous t’enverrons un lien pour en choisir un nouveau."
    >
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {message && (
        <Text
          style={{
            color: "#176C3A",
            fontWeight: "800",
            lineHeight: 22,
          }}
        >
          {message}
        </Text>
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
