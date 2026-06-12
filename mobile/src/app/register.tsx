import { useState } from "react";
import { useRouter } from "expo-router";

import {
  AuthField,
  AuthLink,
  AuthScreen,
} from "../components/AuthScreen";

import { ErrorBox } from "../components/ErrorBox";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] =
    useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function handleRegister() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password
    ) {
      setError("Remplis tous les champs.");
      return;
    }

    if (password !== confirmation) {
      setError(
        "Les deux mots de passe sont différents."
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signUp({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmation,
      });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Impossible de créer le compte."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Créer un compte"
      subtitle="Quelques informations suffisent pour commencer."
    >
      <AuthField
        label="Prénom"
        value={firstName}
        onChangeText={setFirstName}
      />

      <AuthField
        label="Nom"
        value={lastName}
        onChangeText={setLastName}
      />

      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <AuthField
        label="Mot de passe"
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
            ? "Création..."
            : "Créer mon compte"
        }
        onPress={handleRegister}
        disabled={submitting}
      />

      <AuthLink
        label="J’ai déjà un compte"
        onPress={() => router.replace("/login")}
      />
    </AuthScreen>
  );
}
