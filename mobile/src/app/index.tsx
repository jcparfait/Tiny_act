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

type Location = {
  id: number;
  name: string;
};

type Step = "mood" | "location";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [step, setStep] = useState<Step>("mood");

  const [moods, setMoods] = useState<Mood[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [moodsResponse, locationsResponse] = await Promise.all([
          fetch(`${API_URL}/api/v1/moods`),
          fetch(`${API_URL}/api/v1/locations`),
        ]);

        if (!moodsResponse.ok) {
          throw new Error(`Erreur API moods : ${moodsResponse.status}`);
        }

        if (!locationsResponse.ok) {
          throw new Error(`Erreur API locations : ${locationsResponse.status}`);
        }

        const moodsData = await moodsResponse.json();
        const locationsData = await locationsResponse.json();

        setMoods(moodsData);
        setLocations(locationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const title =
    step === "mood" ? "Comment tu te sens ?" : "Tu es où ?";

  const subtitle =
    step === "mood"
      ? "Choisis ton état actuel, puis on te proposera une micro-action."
      : "Choisis le contexte dans lequel tu peux faire ton activité.";

  function handleContinue() {
    if (step === "mood" && selectedMoodId) {
      setStep("location");
    }
  }

  function handleBack() {
    if (step === "location") {
      setStep("mood");
    }
  }

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
              {title}
            </Text>

            <Text style={{ fontSize: 16, color: "#5D5A70", lineHeight: 24 }}>
              {subtitle}
            </Text>
          </View>

          {loading && <ActivityIndicator />}

          {error && (
            <Text style={{ color: "red", fontSize: 16 }}>
              {error}
            </Text>
          )}

          {!loading && !error && step === "mood" && (
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
          )}

          {!loading && !error && step === "location" && (
            <View style={{ gap: 14 }}>
              {locations.map((location) => {
                const isSelected = selectedLocationId === location.id;

                return (
                  <Pressable
                    key={location.id}
                    onPress={() => setSelectedLocationId(location.id)}
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
                      {location.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {step === "location" && (
            <Pressable
              onPress={handleBack}
              style={{
                padding: 16,
                borderRadius: 999,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#17152F", fontSize: 16, fontWeight: "700" }}>
                ← Retour
              </Text>
            </Pressable>
          )}

          {step === "mood" && selectedMoodId && (
            <Pressable
              onPress={handleContinue}
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

          {step === "location" && selectedLocationId && (
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
