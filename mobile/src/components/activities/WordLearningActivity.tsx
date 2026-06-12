import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

import {
  loadActivityProgress,
  saveActivityProgress,
} from "../../services/api";

import {
  Activity,
  LanguageItem,
  WordLearningProgress,
} from "../../types/tinyAct";

import {
  activityMainText,
  DarkButton,
  DarkInfoBox,
  IntroCard,
  ScoreCard,
} from "./shared";

function validProgress(
  value: WordLearningProgress | undefined
): value is WordLearningProgress {
  return (
    value !== undefined &&
    Array.isArray(value.items) &&
    typeof value.current_index === "number" &&
    typeof value.show_translation === "boolean" &&
    typeof value.completed === "boolean"
  );
}

export function WordLearningActivity({
  activity,
}: {
  activity: Activity;
}) {
  const sessionId =
    activity.payload?.activity_session_id || null;

  const payloadItems =
    activity.payload?.language_items || [];

  const languageLabel =
    activity.payload?.language_label || "langue cible";

  const [items, setItems] =
    useState<LanguageItem[]>(payloadItems);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] =
    useState(false);
  const [completed, setCompleted] = useState(false);
  const [progressLoaded, setProgressLoaded] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setProgressLoaded(false);
      setItems(payloadItems);
      setCurrentIndex(0);
      setShowTranslation(false);
      setCompleted(false);

      if (!sessionId) {
        setProgressLoaded(true);
        return;
      }

      try {
        const response =
          await loadActivityProgress(sessionId);

        if (cancelled) return;

        const saved =
          response.progress_data.word_learning;

        if (validProgress(saved)) {
          const savedItems =
            saved.items.length > 0
              ? saved.items
              : payloadItems;

          const maximumIndex = Math.max(
            savedItems.length - 1,
            0
          );

          setItems(savedItems);
          setCurrentIndex(
            Math.min(
              Math.max(saved.current_index, 0),
              maximumIndex
            )
          );
          setShowTranslation(saved.show_translation);
          setCompleted(saved.completed);
        }
      } catch (error) {
        console.warn(
          "Impossible de charger les mots",
          error
        );
      } finally {
        if (!cancelled) {
          setProgressLoaded(true);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [activity.id, sessionId]);

  useEffect(() => {
    if (
      !progressLoaded ||
      !sessionId ||
      items.length === 0
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveActivityProgress(sessionId, {
        word_learning: {
          items,
          current_index: currentIndex,
          show_translation: showTranslation,
          completed,
        },
      }).catch((error) => {
        console.warn(
          "Impossible de sauvegarder les mots",
          error
        );
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [
    completed,
    currentIndex,
    items,
    progressLoaded,
    sessionId,
    showTranslation,
  ]);

  function goNext() {
    if (currentIndex >= items.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex + 1);
    setShowTranslation(false);
  }

  if (!progressLoaded) {
    return (
      <View
        style={{
          padding: 22,
          alignItems: "center",
          gap: 12,
        }}
      >
        <ActivityIndicator />

        <Text
          style={{
            color: "#5D5A70",
            fontWeight: "700",
          }}
        >
          Chargement de la progression…
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ gap: 14 }}>
        <IntroCard
          label={`Mots en ${languageLabel}`}
          text={activityMainText(activity)}
        />

        <DarkInfoBox
          title="Aucun mot reçu"
          text="Vérifie que Rails renvoie bien language_items dans le payload."
        />
      </View>
    );
  }

  if (completed) {
    return (
      <View style={{ gap: 14 }}>
        <ScoreCard
          score={items.length}
          total={items.length}
          label="Mots vus"
        />
      </View>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <View style={{ gap: 14 }}>
      <IntroCard
        label={`Mot en ${languageLabel} · ${
          currentIndex + 1
        }/${items.length}`}
        text="Mémorise le mot, puis révèle sa traduction."
      />

      <View
        style={{
          padding: 22,
          borderRadius: 24,
          backgroundColor: "#17152F",
          gap: 12,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: "#FFFFFF",
            opacity: 0.7,
            fontWeight: "800",
            textTransform: "uppercase",
          }}
        >
          Mot
        </Text>

        <Text
          style={{
            fontSize: 34,
            color: "#FFFFFF",
            fontWeight: "900",
            lineHeight: 42,
          }}
        >
          {currentItem.prompt}
        </Text>

        {showTranslation && (
          <View
            style={{
              marginTop: 10,
              padding: 14,
              borderRadius: 18,
              backgroundColor: "#FFF4EA",
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
              Traduction
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 20,
                fontWeight: "800",
                color: "#17152F",
              }}
            >
              {currentItem.translation ||
                currentItem.answer}
            </Text>
          </View>
        )}
      </View>

      {!showTranslation ? (
        <DarkButton
          label="Voir la traduction"
          onPress={() => setShowTranslation(true)}
        />
      ) : (
        <DarkButton
          label={
            currentIndex >= items.length - 1
              ? "Terminer la série"
              : "Mot suivant"
          }
          onPress={goNext}
        />
      )}
    </View>
  );
}
