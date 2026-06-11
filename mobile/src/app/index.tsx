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

type Duration = {
  id: number;
  value: number;
  label: string;
};

type ActivitySession = {
  id: number;
  status: string;
  finished: boolean;
  elapsed_seconds: number;
  activity_id: number;
};

type Activity = {
  id: number;
  name: string;
  description: string;
  content: string;
  activity_type: string;
  interest: {
    id: number;
    name: string;
  };
  duration: {
    id: number;
    value: number;
    label: string;
  };
  location: {
    id: number;
    name: string;
  };
  mood: {
    id: number;
    name: string;
  };
};

type CreateActivitySessionResponse = {
  activity_session: ActivitySession;
  activities: Activity[];
};

type Step = "mood" | "location" | "duration" | "recommendations";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [step, setStep] = useState<Step>("mood");

  const [moods, setMoods] = useState<Mood[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);

  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedDurationId, setSelectedDurationId] = useState<number | null>(null);

  const [activitySession, setActivitySession] = useState<ActivitySession | null>(null);
  const [recommendedActivities, setRecommendedActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [moodsResponse, locationsResponse, durationsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/v1/moods`),
            fetch(`${API_URL}/api/v1/locations`),
            fetch(`${API_URL}/api/v1/durations`),
          ]);

        if (!moodsResponse.ok) {
          throw new Error(`Erreur API moods : ${moodsResponse.status}`);
        }

        if (!locationsResponse.ok) {
          throw new Error(`Erreur API locations : ${locationsResponse.status}`);
        }

        if (!durationsResponse.ok) {
          throw new Error(`Erreur API durations : ${durationsResponse.status}`);
        }

        const moodsData = await moodsResponse.json();
        const locationsData = await locationsResponse.json();
        const durationsData = await durationsResponse.json();

        setMoods(moodsData);
        setLocations(locationsData);
        setDurations(durationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const title =
    step === "mood"
      ? "Comment tu te sens ?"
      : step === "location"
        ? "Tu es où ?"
        : step === "duration"
          ? "Tu as combien de temps ?"
          : "On a trouvé ça pour toi";

  const subtitle =
    step === "mood"
      ? "Choisis ton état actuel, puis on te proposera une micro-action."
      : step === "location"
        ? "Choisis le contexte dans lequel tu peux faire ton activité."
        : step === "duration"
          ? "Choisis une durée réaliste pour commencer maintenant."
          : "Choisis une activité pour transformer ton envie de scroll en action.";

  function handleContinue() {
    if (step === "mood" && selectedMoodId) {
      setStep("location");
      return;
    }

    if (step === "location" && selectedLocationId) {
      setStep("duration");
      return;
    }
  }

  function handleBack() {
    setError(null);

    if (step === "location") {
      setStep("mood");
      return;
    }

    if (step === "duration") {
      setStep("location");
      return;
    }

    if (step === "recommendations") {
      setStep("duration");
      return;
    }
  }

  function resetFlow() {
    setStep("mood");
    setSelectedMoodId(null);
    setSelectedLocationId(null);
    setSelectedDurationId(null);
    setActivitySession(null);
    setRecommendedActivities([]);
    setError(null);
  }

  async function createActivitySession() {
    if (!selectedMoodId || !selectedLocationId || !selectedDurationId) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/activity_sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_session: {
            mood_id: selectedMoodId,
            location_id: selectedLocationId,
            duration_id: selectedDurationId,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur API : ${response.status}`);
      }

      const result = data as CreateActivitySessionResponse;

      setActivitySession(result.activity_session);
      setRecommendedActivities(result.activities);
      setStep("recommendations");

      console.log("Activity session created:", result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
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
            <View
              style={{
                padding: 16,
                borderRadius: 18,
                backgroundColor: "#FFE1DD",
                borderWidth: 1,
                borderColor: "#FF9B8F",
              }}
            >
              <Text style={{ color: "#B42318", fontSize: 15, fontWeight: "700" }}>
                {error}
              </Text>
            </View>
          )}

          {!loading && !error && step === "mood" && (
            <View style={{ gap: 14 }}>
              {moods.map((mood) => (
                <ChoiceCard
                  key={mood.id}
                  label={mood.name === "Mitigé" ? "Bof" : mood.name}
                  selected={selectedMoodId === mood.id}
                  onPress={() => setSelectedMoodId(mood.id)}
                />
              ))}
            </View>
          )}

          {!loading && !error && step === "location" && (
            <View style={{ gap: 14 }}>
              {locations.map((location) => (
                <ChoiceCard
                  key={location.id}
                  label={location.name}
                  selected={selectedLocationId === location.id}
                  onPress={() => setSelectedLocationId(location.id)}
                />
              ))}
            </View>
          )}

          {!loading && !error && step === "duration" && (
            <View style={{ gap: 14 }}>
              {durations.map((duration) => (
                <ChoiceCard
                  key={duration.id}
                  label={duration.label}
                  selected={selectedDurationId === duration.id}
                  onPress={() => setSelectedDurationId(duration.id)}
                />
              ))}
            </View>
          )}

          {!loading && step === "recommendations" && (
            <View style={{ gap: 14 }}>
              {activitySession && (
                <View
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#F2D7C8",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: "#FF4B2B",
                      textTransform: "uppercase",
                    }}
                  >
                    Session créée
                  </Text>

                  <Text style={{ marginTop: 4, color: "#5D5A70" }}>
                    Session #{activitySession.id} · {activitySession.status}
                  </Text>
                </View>
              )}

              {recommendedActivities.length === 0 && (
                <View
                  style={{
                    padding: 20,
                    borderRadius: 24,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 2,
                    borderColor: "#F2D7C8",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#17152F",
                    }}
                  >
                    Aucune activité trouvée
                  </Text>

                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 15,
                      color: "#5D5A70",
                      lineHeight: 22,
                    }}
                  >
                    Essaie avec un autre mood, un autre lieu ou une autre durée.
                  </Text>
                </View>
              )}

              {recommendedActivities.map((activity) => (
                <View
                  key={activity.id}
                  style={{
                    padding: 20,
                    borderRadius: 26,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 2,
                    borderColor: "#F2D7C8",
                    gap: 12,
                  }}
                >
                  <View style={{ gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: "#FF4B2B",
                        textTransform: "uppercase",
                      }}
                    >
                      {activity.interest.name} · {activity.duration.label}
                    </Text>

                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "900",
                        color: "#17152F",
                      }}
                    >
                      {activity.name}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 15,
                      color: "#5D5A70",
                      lineHeight: 22,
                    }}
                  >
                    {activity.description}
                  </Text>

                  <Pressable
                    onPress={() => {
                      console.log("Selected activity:", activity);
                    }}
                    style={{
                      marginTop: 8,
                      padding: 15,
                      borderRadius: 999,
                      backgroundColor: "#17152F",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "800",
                      }}
                    >
                      Choisir cette activité
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {step !== "mood" && (
            <SecondaryButton label="← Retour" onPress={handleBack} />
          )}

          {step === "mood" && selectedMoodId && (
            <PrimaryButton label="Continuer" onPress={handleContinue} />
          )}

          {step === "location" && selectedLocationId && (
            <PrimaryButton label="Continuer" onPress={handleContinue} />
          )}

          {step === "duration" && selectedDurationId && (
            <PrimaryButton
              label={submitting ? "Recherche..." : "Trouver une activité"}
              onPress={createActivitySession}
              disabled={submitting}
            />
          )}

          {step === "recommendations" && (
            <PrimaryButton
              label="Recommencer"
              onPress={resetFlow}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ChoiceCard({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 20,
        borderRadius: 24,
        backgroundColor: selected ? "#17152F" : "#FFFFFF",
        borderWidth: 2,
        borderColor: selected ? "#17152F" : "#F2D7C8",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: selected ? "#FFFFFF" : "#17152F",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        marginTop: 12,
        padding: 18,
        borderRadius: 999,
        backgroundColor: disabled ? "#C8C4BE" : "#FF4B2B",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 16,
        borderRadius: 999,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#17152F", fontSize: 16, fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
