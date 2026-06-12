import { useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { ErrorBox } from "../components/ErrorBox";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFF4EA",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 440,
            gap: 22,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "900",
                color: "#17152F",
              }}
            >
              Tiny Act
            </Text>

            <Text
              style={{
                fontSize: 17,
                color: "#5D5A70",
                lineHeight: 24,
              }}
            >
              Connecte-toi pour retrouver tes activités
              et ta progression.
            </Text>
          </View>

          <View
            style={{
              padding: 22,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              borderWidth: 2,
              borderColor: "#F2D7C8",
              gap: 16,
            }}
          >
            <View style={{ gap: 7 }}>
              <Text
                style={{
                  fontWeight: "800",
                  color: "#17152F",
                }}
              >
                Email
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="email@exemple.fr"
                placeholderTextColor="#8E8A9D"
                style={{
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "#F2D7C8",
                  fontSize: 16,
                  color: "#17152F",
                  outlineStyle: "none" as never,
                }}
              />
            </View>

            <View style={{ gap: 7 }}>
              <Text
                style={{
                  fontWeight: "800",
                  color: "#17152F",
                }}
              >
                Mot de passe
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder="Mot de passe"
                placeholderTextColor="#8E8A9D"
                onSubmitEditing={handleLogin}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "#F2D7C8",
                  fontSize: 16,
                  color: "#17152F",
                  outlineStyle: "none" as never,
                }}
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
              disabled={submitting}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
