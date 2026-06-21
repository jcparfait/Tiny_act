import { useEffect, useMemo, useState } from "react";

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
import { ScreenHeader } from "../components/ScreenHeader";
import { SecondaryButton } from "../components/SecondaryButton";

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
    description: "Bouger, respirer, relancer ton énergie.",
  },
  "Bien-être": {
    icon: "🌿",
    description: "Ralentir, te recentrer, reprendre le contrôle.",
  },
  Photo: {
    icon: "📷",
    description: "Observer, cadrer, regarder autrement.",
  },
  Dessin: {
    icon: "✏️",
    description: "Créer sans pression, même quelques minutes.",
  },
  Langues: {
    icon: "🌍",
    description: "Apprendre des mots ou des phrases utiles.",
  },
  Culture: {
    icon: "🧠",
    description: "Nourrir ta curiosité au lieu de scroller.",
  },
  Productivité: {
    icon: "✓",
    description: "Clarifier, ranger, avancer un petit peu.",
  },
  Code: {
    icon: "⌨️",
    description: "Résoudre un mini-problème technique.",
  },
  Musique: {
    icon: "♪",
    description: "Écouter, jouer, reconnaître ou créer du son.",
  },
};

export default function InterestsScreen() {
  const router = useRouter();

  const { user, updateInterests } = useAuth();

  const editingExistingSelection =
    user?.onboarding_complete === true;

  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const selectedInterests = useMemo(
    () =>
      interests.filter((interest) =>
        selectedIds.includes(interest.id)
      ),
    [interests, selectedIds]
  );

  const saveLabel = editingExistingSelection
    ? "Enregistrer mes choix"
    : "Continuer vers l’avatar";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);

        const response = await loadMobileInterests();

        if (cancelled) return;

        setInterests(response.interests);
        setSelectedIds(response.selected_interest_ids);
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
        return currentIds.filter((id) => id !== interestId);
      }

      return [...currentIds, interestId];
    });
  }

  async function handleSave() {
    if (selectedIds.length === 0) {
      setError("Choisis au moins un centre d’intérêt.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateInterests(selectedIds);

      router.replace(
        editingExistingSelection ? "/profile" : "/avatar"
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
        backgroundColor: "#F4EFE8",
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
            minHeight: "100%",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <ScreenHeader
            kicker="Personnalisation"
            title="Choisis tes centres d’intérêt"
            subtitle="Tiny Act utilisera ces choix pour te proposer des micro-actions adaptées à ce que tu veux vraiment nourrir."
          />

          <View
            style={{
              padding: 22,
              borderRadius: 28,
              backgroundColor: "#151B2F",
              gap: 14,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 25,
                lineHeight: 31,
                fontWeight: "900",
              }}
            >
              Plus tes choix sont précis, plus les activités seront utiles.
            </Text>

            <Text
              style={{
                color: "#FFFFFF",
                opacity: 0.76,
                fontSize: 15,
                lineHeight: 22,
                fontWeight: "600",
              }}
            >
              Tu peux en sélectionner plusieurs. Chaque activité terminée fera progresser la salle liée à son thème.
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <SelectionPill
                label={`${selectedIds.length} sélectionné(s)`}
              />

              {selectedInterests.slice(0, 3).map((interest) => (
                <SelectionPill
                  key={interest.id}
                  label={interest.name}
                />
              ))}
            </View>
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
                const selected = selectedIds.includes(interest.id);

                const details =
                  INTEREST_DETAILS[interest.name] || {
                    icon: "✦",
                    description: "Ajouter cette catégorie.",
                  };

                return (
                  <Pressable
                    key={interest.id}
                    onPress={() => toggleInterest(interest.id)}
                    style={({ pressed }) => ({
                      width: "48%",
                      minWidth: 155,
                      flexGrow: 1,
                      padding: 18,
                      borderRadius: 26,
                      borderWidth: 2,
                      borderColor: selected
                        ? "#7C63F2"
                        : "rgba(90, 74, 54, 0.16)",
                      backgroundColor: selected
                        ? "#FFF0EB"
                        : "#FFFFFF",
                      gap: 10,
                      opacity: pressed ? 0.82 : 1,
                      transform: [
                        {
                          translateY: pressed ? 1 : 0,
                        },
                      ],
                    })}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 34,
                        }}
                      >
                        {details.icon}
                      </Text>

                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: selected
                            ? "#7C63F2"
                            : "#F4EFE8",
                          borderWidth: 2,
                          borderColor: selected
                            ? "#7C63F2"
                            : "rgba(90, 74, 54, 0.16)",
                        }}
                      >
                        <Text
                          style={{
                            color: selected ? "#FFFFFF" : "#8E8A9D",
                            fontWeight: "900",
                          }}
                        >
                          {selected ? "✓" : "+"}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        fontSize: 21,
                        color: "#151B2F",
                        fontWeight: "900",
                      }}
                    >
                      {interest.name}
                    </Text>

                    <Text
                      style={{
                        color: "rgba(21, 27, 47, 0.58)",
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    >
                      {details.description}
                    </Text>

                    <Text
                      style={{
                        color: selected ? "#7C63F2" : "#8E8A9D",
                        fontWeight: "900",
                      }}
                    >
                      {selected ? "Sélectionné" : "Sélectionner"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {!loading && (
            <PrimaryButton
              label={saving ? "Enregistrement..." : saveLabel}
              onPress={handleSave}
              disabled={saving || selectedIds.length === 0}
            />
          )}

          {editingExistingSelection && (
            <SecondaryButton
              label="← Retour au profil"
              onPress={() => router.replace("/profile")}
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

function SelectionPill({ label }: { label: string }) {
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
