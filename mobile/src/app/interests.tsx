import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { loadMobileInterests } from "../services/interestsApi";
import { Interest } from "../types/tinyAct";

const INTEREST_DETAILS: Record<
  string,
  {
    icon: string;
    description: string;
  }
> = {
  Sport: {
    icon: "🏃",
    description: "Bouger et relancer ton énergie.",
  },
  "Bien-être": {
    icon: "🌿",
    description: "Respirer, ralentir et te recentrer.",
  },
  Photo: {
    icon: "📷",
    description: "Regarder autrement ce qui t’entoure.",
  },
  Dessin: {
    icon: "✏️",
    description: "Dessiner sans pression.",
  },
  Langues: {
    icon: "🌍",
    description: "Apprendre quelques mots utiles.",
  },
  Culture: {
    icon: "🧠",
    description: "Nourrir ta curiosité.",
  },
  Productivité: {
    icon: "✓",
    description: "Clarifier et avancer.",
  },
  Code: {
    icon: "⌨️",
    description: "Résoudre un petit problème.",
  },
  Musique: {
    icon: "♪",
    description: "Écouter, créer ou jouer avec le son.",
  },
};

export default function InterestsScreen() {
  const router = useRouter();

  const {
    user,
    updateInterests,
  } = useAuth();

  const editingExistingSelection =
    user?.onboarding_complete === true;

  const [interests, setInterests] =
    useState<Interest[]>([]);

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);

        const response =
          await loadMobileInterests();

        if (cancelled) return;

        setInterests(response.interests);
        setSelectedIds(
          response.selected_interest_ids
        );
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les centres d’intérêt."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleInterest(interestId: number) {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(interestId)) {
        return currentIds.filter(
          (id) => id !== interestId
        );
      }

      return [...currentIds, interestId];
    });
  }

  async function handleSave() {
    if (selectedIds.length === 0) {
      setError(
        "Choisis au moins un centre d’intérêt."
      );

      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateInterests(selectedIds);

      router.replace(
        editingExistingSelection
          ? "/profile"
          : "/"
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d’enregistrer tes choix."
      );
    } finally {
      setSaving(false);
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
          padding: 18,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 620,
            gap: 22,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: "#FF4B2B",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Personnalisation
            </Text>

            <Text
              style={{
                fontSize: 36,
                lineHeight: 42,
                color: "#17152F",
                fontWeight: "900",
              }}
            >
              Tes centres d’intérêt
            </Text>

            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: "#5D5A70",
              }}
            >
              Choisis ce que tu souhaites retrouver
              dans tes recommandations.
            </Text>
          </View>

          {loading && <ActivityIndicator />}

          {error && <ErrorBox message={error} />}

          {!loading && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {interests.map((interest) => {
                const selected =
                  selectedIds.includes(interest.id);

                const details =
                  INTEREST_DETAILS[interest.name] || {
                    icon: "✦",
                    description:
                      "Ajouter cette catégorie.",
                  };

                return (
                  <Pressable
                    key={interest.id}
                    onPress={() =>
                      toggleInterest(interest.id)
                    }
                    style={({ pressed }) => ({
                      width: "48%",
                      minWidth: 150,
                      flexGrow: 1,
                      padding: 18,
                      borderRadius: 24,
                      borderWidth: 2,
                      borderColor: selected
                        ? "#FF4B2B"
                        : "#F2D7C8",
                      backgroundColor: selected
                        ? "#FFF0EB"
                        : "#FFFFFF",
                      gap: 10,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 32,
                      }}
                    >
                      {details.icon}
                    </Text>

                    <Text
                      style={{
                        fontSize: 20,
                        color: "#17152F",
                        fontWeight: "900",
                      }}
                    >
                      {interest.name}
                    </Text>

                    <Text
                      style={{
                        color: "#5D5A70",
                        lineHeight: 20,
                      }}
                    >
                      {details.description}
                    </Text>

                    <Text
                      style={{
                        color: selected
                          ? "#FF4B2B"
                          : "#8E8A9D",
                        fontWeight: "900",
                      }}
                    >
                      {selected
                        ? "✓ Sélectionné"
                        : "Sélectionner"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {!loading && (
            <PrimaryButton
              label={
                saving
                  ? "Enregistrement..."
                  : "Enregistrer mes choix"
              }
              onPress={handleSave}
              disabled={
                saving ||
                selectedIds.length === 0
              }
            />
          )}

          {editingExistingSelection && (
            <MobileNav active="profile" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
