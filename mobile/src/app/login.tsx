import { useEffect, useState } from "react";

import { Text, View } from "react-native";

import { useRouter } from "expo-router";

import {
  AuthField,
  AuthLink,
  AuthScreen,
  SocialButton,
} from "../components/AuthScreen";

import { ErrorBox } from "../components/ErrorBox";
import { PrimaryButton } from "../components/PrimaryButton";

import { useAuth } from "../context/AuthContext";
import { loadAuthProviders } from "../services/authApi";

import {
  SocialProvider,
  startSocialAuth,
} from "../services/socialAuth";

import { TA } from "../theme/tinyActTheme";

export default function LoginScreen() {
  const router = useRouter();

  const {
    signIn,
    completeSocialSignIn,
  } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [providers, setProviders] =
    useState({
      google: false,
      facebook: false,
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    loadAuthProviders()
      .then(setProviders)
      .catch(() => {
        setProviders({
          google: false,
          facebook: false,
        });
      });
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError(
        "Renseigne ton email et ton mot de passe."
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signIn(
        email.trim(),
        password
      );
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Impossible de se connecter."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocial(
    provider: SocialProvider
  ) {
    setSocialLoading(provider);
    setError(null);

    try {
      const code =
        await startSocialAuth(provider);

      if (code) {
        await completeSocialSignIn(code);
      }
    } catch (socialError) {
      setError(
        socialError instanceof Error
          ? socialError.message
          : "Impossible de terminer la connexion."
      );
    } finally {
      setSocialLoading(null);
    }
  }

  const isBusy =
    submitting || socialLoading !== null;

  return (
    <AuthScreen
      title="Connexion"
      subtitle="Reprends tes micro-actions, ton XP et ta salle là où tu les as laissés."
    >
      <View
        style={{
          padding: 18,
          borderRadius: 28,
          backgroundColor: "#F2EDFF",
          borderWidth: 1.5,
          borderColor: "#D8CCFF",
          gap: 12,
        }}
      >
        <View style={{ gap: 6 }}>
          <Text
            style={{
              color: TA.colors.purple,
              fontSize: 12,
              lineHeight: 15,
              fontFamily: TA.fonts.black,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Ton espace Tiny Act
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
            Reprends là où tu t’es arrêté.
          </Text>

          <Text
            style={{
              color: TA.colors.inkMuted,
              fontSize: 14,
              lineHeight: 20,
              fontFamily: TA.fonts.bold,
            }}
          >
            Tes activités, ton historique et tes récompenses restent gardés dans ton compte.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <LoginPill label="Micro-actions" />
          <LoginPill label="XP" />
          <LoginPill label="Salle" />
          <LoginPill label="Historique" />
        </View>
      </View>

      <View style={{ gap: 14 }}>
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
          placeholder="Mot de passe"
          onSubmitEditing={handleLogin}
        />
      </View>

      {error && <ErrorBox message={error} />}

      <PrimaryButton
        label={
          submitting
            ? "Connexion..."
            : "Se connecter"
        }
        onPress={handleLogin}
        disabled={isBusy}
      />

      {(providers.google ||
        providers.facebook) && (
        <View style={{ gap: 10 }}>
          <Text
            style={{
              color: TA.colors.inkMuted,
              textAlign: "center",
              fontSize: 13,
              fontFamily: TA.fonts.black,
            }}
          >
            ou
          </Text>

          {providers.google && (
            <SocialButton
              label={
                socialLoading === "google_oauth2"
                  ? "Connexion Google..."
                  : "Continuer avec Google"
              }
              disabled={isBusy}
              onPress={() =>
                handleSocial("google_oauth2")
              }
            />
          )}

          {providers.facebook && (
            <SocialButton
              label={
                socialLoading === "facebook"
                  ? "Connexion Facebook..."
                  : "Continuer avec Facebook"
              }
              disabled={isBusy}
              onPress={() =>
                handleSocial("facebook")
              }
            />
          )}
        </View>
      )}

      <View
        style={{
          paddingTop: 2,
          gap: 9,
        }}
      >
        <AuthLink
          label="Mot de passe oublié ?"
          onPress={() =>
            router.push("/forgot-password")
          }
        />

        <AuthLink
          label="Créer un compte"
          onPress={() =>
            router.push("/register")
          }
        />
      </View>
    </AuthScreen>
  );
}

function LoginPill({
  label,
}: {
  label: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: TA.colors.surface,
        borderWidth: 1,
        borderColor: "#D8CCFF",
      }}
    >
      <Text
        style={{
          color: TA.colors.purple,
          fontSize: 12,
          lineHeight: 15,
          fontFamily: TA.fonts.black,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
