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
  const [password, setPassword] = useState("");

  const [providers, setProviders] = useState({
    google: false,
    facebook: false,
  });

  const [submitting, setSubmitting] = useState(false);
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
      await signIn(email, password);
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
      const code = await startSocialAuth(provider);

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

  return (
    <AuthScreen
      title="Tiny Act"
      subtitle="Connecte-toi pour retrouver tes activités et ta progression."
    >
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

      {error && <ErrorBox message={error} />}

      <PrimaryButton
        label={
          submitting
            ? "Connexion..."
            : "Se connecter"
        }
        onPress={handleLogin}
        disabled={submitting || socialLoading !== null}
      />

      {(providers.google || providers.facebook) && (
        <View style={{ gap: 10 }}>
          <Text
            style={{
              color: "#5D5A70",
              textAlign: "center",
              fontWeight: "700",
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
              disabled={socialLoading !== null}
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
              disabled={socialLoading !== null}
              onPress={() =>
                handleSocial("facebook")
              }
            />
          )}
        </View>
      )}

      <AuthLink
        label="Mot de passe oublié ?"
        onPress={() =>
          router.push("/forgot-password")
        }
      />

      <AuthLink
        label="Créer un compte"
        onPress={() => router.push("/register")}
      />
    </AuthScreen>
  );
}
