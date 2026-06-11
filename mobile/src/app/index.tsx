import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

type Mood = {
  id: number;
  name: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMoods() {
      try {
        const response = await fetch(`${API_URL}/api/v1/moods`);

        if (!response.ok) {
          throw new Error(`Erreur API : ${response.status}`);
        }

        const data = await response.json();
        setMoods(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    loadMoods();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF4EA" }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          justifyContent: "center",
        }}
      >
        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#FF4B2B" }}>
              Tiny Act
            </Text>

            <Text style={{ fontSize: 36, fontWeight: "900", color: "#17152F" }}>
              Comment tu te sens ?
            </Text>

            <Text style={{ fontSize: 16, color: "#5D5A70", lineHeight: 24 }}>
              Choisis ton état actuel, puis on te proposera une micro-action.
            </Text>
          </View>

          {loading && <ActivityIndicator />}

          {error && (
            <Text style={{ color: "red", fontSize: 16 }}>
              {error}
            </Text>
          )}

          <View style={{ gap: 14 }}>
            {moods.map((mood) => {
              const isSelected = selectedMoodId === mood.id;

              return (
                <Pressable
                  key={mood.id}
                  onPress={() => setSelectedMoodId(mood.id)}
                  style={{
                    padding: 20,
                    borderRadius: 24,
                    backgroundColor: isSelected ? "#17152F" : "#FFFFFF",
                    borderWidth: 2,
                    borderColor: isSelected ? "#17152F" : "#F2D7C8",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: isSelected ? "#FFFFFF" : "#17152F",
                    }}
                  >
                    {mood.name === "Mitigé" ? "Bof" : mood.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedMoodId && (
            <Pressable
              style={{
                marginTop: 12,
                padding: 18,
                borderRadius: 999,
                backgroundColor: "#FF4B2B",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800" }}>
                Continuer
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
