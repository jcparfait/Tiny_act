import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

type HealthResponse = {
  status: string;
  app: string;
  version: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await fetch(`${API_URL}/api/v1/health`);

        if (!response.ok) {
          throw new Error(`Erreur API : ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    }

    loadHealth();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 32, fontWeight: "800" }}>
          Tiny Act Mobile
        </Text>

        {!data && !error && <ActivityIndicator />}

        {data && (
          <Text style={{ fontSize: 18 }}>
            API connectée : {data.app} / {data.version}
          </Text>
        )}

        {error && (
          <Text style={{ color: "red", fontSize: 16 }}>
            {error}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
