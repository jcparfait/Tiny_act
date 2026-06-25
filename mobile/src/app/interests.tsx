import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";

import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

import { getInterestVisualByName } from "../constants/activityAssets";

import { useAuth } from "../context/AuthContext";
import { loadMobileInterests } from "../services/interestsApi";

import { TA } from "../theme/tinyActTheme";
import { Interest } from "../types/tinyAct";

export default function InterestsScreen() {
  const router = useRouter();

  const { user, updateInterests } = useAuth();

  const editingExistingSelection =
    user?.onboarding_complete === true;

  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

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

  function handleBack() {
    router.replace("/profile");
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 131,
          zIndex: 80,
          backgroundColor: TA.colors.bgStart,
        }}
      />

      <MobileNav active="profile" />

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: TA.colors.bgStart,
        }}
        contentContainerStyle={{
          paddingTop: 125,
          paddingHorizontal: 18,
          paddingBottom: editingExistingSelection ? 168 : 104,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            padding: 16,
            borderRadius: 34,
            backgroundColor: TA.colors.surface,
            borderWidth: 1.5,
            borderColor: "rgba(21, 27, 47, 0.10)",
            gap: 20,
            ...TA.shadow.soft,
          }}
        >
          <View style={{ gap: 12 }}>
            <Text
              style={{
                color: TA.colors.inkLight,
                fontSize: 13,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Personnalisation
            </Text>

            <Text
              style={{
                color: TA.colors.ink,
                fontSize: 42,
                lineHeight: 43,
                fontFamily: TA.fonts.black,
                letterSpacing: -2,
              }}
            >
              Choisis tes centres d’intérêt
            </Text>

            <View
              style={{
                alignSelf: "flex-start",
                paddingVertical: 8,
                paddingHorizontal: 13,
                borderRadius: 999,
                backgroundColor: "#F2EDFF",
                borderWidth: 1.5,
                borderColor: "#D8CCFF",
              }}
            >
              <Text
                style={{
                  color: TA.colors.purple,
                  fontSize: 13,
                  fontFamily: TA.fonts.black,
                  letterSpacing: 0.2,
                }}
              >
                {selectedIds.length} sélectionné(s)
              </Text>
            </View>
          </View>

          {loading && (
            <View
              style={{
                padding: 22,
                borderRadius: 28,
                backgroundColor: TA.colors.surface,
                borderWidth: 2,
                borderColor: TA.colors.borderMedium,
                alignItems: "center",
                ...TA.shadow.card,
              }}
            >
              <ActivityIndicator />
            </View>
          )}

          {error && (
            <ErrorBox message={error} />
          )}

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

                const visual =
                  getInterestVisualByName(
                    interest.name
                  );

                return (
                  <Pressable
                    key={interest.id}
                    onPress={() =>
                      toggleInterest(interest.id)
                    }
                    style={({ pressed }) => ({
                      width: "48%",
                      minWidth: 145,
                      flexGrow: 1,
                      minHeight: 132,
                      padding: 12,
                      borderRadius: 24,
                      borderWidth: 2,
                      borderColor: selected
                        ? visual.color
                        : TA.colors.borderMedium,
                      backgroundColor: selected
                        ? visual.softColor
                        : TA.colors.surface,
                      opacity: pressed ? 0.82 : 1,
                      transform: [
                        {
                          translateY: pressed ? 1 : 0,
                        },
                      ],
                      ...TA.shadow.soft,
                    })}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 86,
                          height: 86,
                          borderRadius: 26,
                          backgroundColor:
                            visual.softColor,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {visual.image ? (
                          <ExpoImage
                            source={visual.image}
                            contentFit="contain"
                            style={{
                              width: 84,
                              height: 84,
                            }}
                          />
                        ) : (
                          <Text
                            style={{
                              color: visual.color,
                              fontSize: 34,
                              fontFamily: TA.fonts.black,
                            }}
                          >
                            ✦
                          </Text>
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: TA.colors.ink,
                          fontSize: 21,
                          lineHeight: 24,
                          fontFamily: TA.fonts.black,
                          letterSpacing: -0.8,
                          textAlign: "center",
                        }}
                      >
                        {interest.name}
                      </Text>
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selected
                          ? visual.color
                          : TA.colors.bgMiddle,
                        borderWidth: 2,
                        borderColor: selected
                          ? visual.color
                          : TA.colors.borderMedium,
                      }}
                    >
                      <Text
                        style={{
                          color: selected
                            ? TA.colors.white
                            : TA.colors.inkLight,
                          fontSize: 14,
                          fontFamily: TA.fonts.black,
                        }}
                      >
                        {selected ? "✓" : "+"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 24,
          backgroundColor: TA.colors.bgStart,
          borderTopWidth: 1,
          borderTopColor: "rgba(21, 27, 47, 0.08)",
          zIndex: 120,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            alignSelf: "center",
            gap: 10,
          }}
        >
          {!loading && (
            <PrimaryButton
              label={
                saving
                  ? "Enregistrement..."
                  : saveLabel
              }
              onPress={handleSave}
              disabled={
                saving || selectedIds.length === 0
              }
            />
          )}

          {editingExistingSelection && (
            <SecondaryButton
              label="← Retour au profil"
              onPress={handleBack}
              disabled={saving}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
