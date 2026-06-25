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
      title="Créer ton compte"
      subtitle="Quelques infos suffisent pour personnaliser tes micro-actions."
    >
      <View
        style={{
          padding: 18,
          borderRadius: 28,
          backgroundColor: "#EAF9FD",
          borderWidth: 1.5,
          borderColor: "#B9E9F3",
          gap: 12,
        }}
      >
        <View style={{ gap: 6 }}>
          <Text
            style={{
              color: "#13A8C7",
              fontSize: 12,
              lineHeight: 15,
              fontFamily: TA.fonts.black,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Démarrage
          </Text>

          <Text
            style={{
              color: TA.colors.ink,
              fontSize: 28,
              lineHeight: 32,
              fontFamily: TA.fonts.black,
              letterSpacing: -1.1,
            }}
          >
            Ton anti-scroll personnel.
          </Text>

          <Text
            style={{
              color: TA.colors.inkMuted,
              fontSize: 14,
              lineHeight: 20,
              fontFamily: TA.fonts.bold,
            }}
          >
            Tu choisis tes intérêts, tu gagnes de l’XP et ta salle évolue avec toi.
          </Text>
        </View>

        <View style={{ gap: 8 }}>
          <StepLine
            number="1"
            text="Crée ton compte"
          />

          <StepLine
            number="2"
            text="Choisis tes intérêts"
          />

          <StepLine
            number="3"
            text="Lance ta première action"
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
          width: 28,
          height: 28,
          borderRadius: 999,
          backgroundColor: "#13A8C7",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: TA.colors.white,
            fontSize: 12,
            lineHeight: 15,
            fontFamily: TA.fonts.black,
          }}
        >
          {number}
        </Text>
      </View>

      <Text
        style={{
          flex: 1,
          color: TA.colors.ink,
          fontSize: 14,
          lineHeight: 18,
          fontFamily: TA.fonts.black,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
