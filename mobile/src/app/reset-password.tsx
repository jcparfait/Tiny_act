import { useState } from "react";
import { useLocalSearchParams } from "expo-router";

import {
  AuthField,
  AuthScreen,
} from "../components/AuthScreen";

import { ErrorBox } from "../components/ErrorBox";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    reset_password_token?: string | string[];
  }>();

  const { resetPassword } = useAuth();

  const rawToken = params.reset_password_token;

  const token =
    Array.isArray(rawToken)
      ? rawToken[0]
      : rawToken || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      token ? null : "Le lien est incomplet."
    );

  async function handleReset() {
    if (!token) return;

    if (!password || password !== confirmation) {
      setError(
        "Les deux mots de passe doivent être identiques."
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await resetPassword(
        token,
        password,
        confirmation
      );
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Impossible de modifier le mot de passe."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Nouveau mot de passe"
      subtitle="Choisis un nouveau mot de passe pour ton compte."
    >
      <AuthField
        label="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <AuthField
        label="Confirmation"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
      />

      {error && <ErrorBox message={error} />}

      <PrimaryButton
        label={
          submitting
            ? "Modification..."
            : "Modifier le mot de passe"
        }
        onPress={handleReset}
        disabled={submitting || !token}
      />
    </AuthScreen>
  );
}
