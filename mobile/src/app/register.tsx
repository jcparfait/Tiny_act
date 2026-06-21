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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmation, setConfirmation] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

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

    if (password.length < 6) {
      setError(
        "Choisis un mot de passe d’au moins 6 caractères."
      );
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
      subtitle="Quelques informations suffisent pour commencer ton parcours."
    >
      <View
        style={{
          padding: 20,
          borderRadius: 26,
          backgroundColor: "#151B2F",
          gap: 12,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 27,
            lineHeight: 33,
            fontWeight: "900",
          }}
        >
          Ton anti-scroll personnel.
        </Text>

        <Text
          style={{
            color: "#FFFFFF",
            opacity: 0.75,
            fontSize: 15,
            lineHeight: 22,
            fontWeight: "600",
          }}
        >
          Choisis tes intérêts, gagne de l’XP, débloque des meubles et construis ta salle.
        </Text>

        <View style={{ gap: 8 }}>
          <StepLine
            number="1"
            text="Crée ton compte"
          />
          <StepLine
            number="2"
            text="Choisis tes centres d’intérêt"
          />
          <StepLine
            number="3"
            text="Lance ta première micro-action"
          />
        </View>
      </View>

      <View style={{ gap: 14 }}>
        <AuthField
          label="Prénom"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          placeholder="Ton prénom"
        />

        <AuthField
          label="Nom"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          placeholder="Ton nom"
        />

        <AuthField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="email@exemple.fr"
        />

        <AuthField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="6 caractères minimum"
        />

        <AuthField
          label="Confirmation"
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Répète le mot de passe"
          onSubmitEditing={handleRegister}
        />
      </View>

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
        onPress={() =>
          router.replace("/login")
        }
      />
    </AuthScreen>
  );
}

function StepLine({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          backgroundColor: "#7C63F2",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontWeight: "900",
            fontSize: 12,
          }}
        >
          {number}
        </Text>
      </View>

      <Text
        style={{
          color: "#FFFFFF",
          opacity: 0.82,
          fontSize: 14,
          fontWeight: "800",
        }}
      >
        {text}
      </Text>
    </View>
  );
}
