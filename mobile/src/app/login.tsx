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
      title="Tiny Act"
      subtitle="Transforme une envie de scroll en petite action utile."
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
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "900",
          }}
        >
          Reprends là où tu t’es arrêté.
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
          Tes activités, ton XP, ta salle et tes récompenses sont gardés dans ton compte.
        </Text>

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
              color: "rgba(21, 27, 47, 0.58)",
              textAlign: "center",
              fontWeight: "800",
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
          paddingTop: 4,
          gap: 12,
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
        backgroundColor: "rgba(255,255,255,0.12)",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
