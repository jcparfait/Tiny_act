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

import type {
  ActivityFooterAction,
  ActivityHeaderMeta,
} from "../ActiveActivityCard";

import { TA } from "../../theme/tinyActTheme";

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

function languageLabelUpper(languageLabel: string) {
  return languageLabel.toLocaleUpperCase("fr-FR");
}

export function WordLearningActivity({
  activity,
  onActivityReadyToFinishChange,
  onFooterActionChange,
  onHeaderMetaChange,
}: {
  activity: Activity;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
  onFooterActionChange?: (action: ActivityFooterAction | null) => void;
  onHeaderMetaChange?: (meta: ActivityHeaderMeta | null) => void;
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

  function revealTranslation() {
    setShowTranslation(true);
  }

  function goNext() {
    if (currentIndex >= items.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex + 1);
    setShowTranslation(false);
  }

  useEffect(() => {
    if (!progressLoaded || items.length === 0) {
      onActivityReadyToFinishChange?.(false);
      onFooterActionChange?.(null);
      onHeaderMetaChange?.(null);
      return;
    }

    const progressLabel = `MOT EN ${languageLabelUpper(languageLabel)} • ${
      completed ? items.length : currentIndex + 1
    }/${items.length}`;

    onHeaderMetaChange?.({
      progressLabel,
      subtitle: "Mémorise le mot, puis révèle sa traduction.",
    });

    if (completed) {
      onActivityReadyToFinishChange?.(true);
      onFooterActionChange?.(null);
      return;
    }

    onActivityReadyToFinishChange?.(false);
    onFooterActionChange?.({
      label: showTranslation
        ? currentIndex >= items.length - 1
          ? "Terminer la série"
          : "Mot suivant"
        : "Voir la traduction",
      onPress: showTranslation ? goNext : revealTranslation,
    });
  }, [
    completed,
    currentIndex,
    items.length,
    languageLabel,
    progressLoaded,
    showTranslation,
    onActivityReadyToFinishChange,
    onFooterActionChange,
    onHeaderMetaChange,
  ]);

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
            color: TA.colors.inkMuted,
            fontFamily: TA.fonts.bold,
          }}
        >
          Chargement de la progression…
        </Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <LightInfoCard
        title="Aucun mot reçu"
        text="Vérifie que Rails renvoie bien language_items dans le payload."
      />
    );
  }

  if (completed) {
    return (
      <CompletionCard
        label="Mots vus"
        value={`${items.length}/${items.length}`}
      />
    );
  }

  const currentItem = items[currentIndex];

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          padding: 18,
          borderRadius: 24,
          backgroundColor: TA.colors.bgMiddle,
          borderWidth: 1.5,
          borderColor: TA.colors.borderMedium,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: TA.colors.purple,
            fontSize: 12,
            lineHeight: 15,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Mot
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 40,
            lineHeight: 45,
            fontFamily: TA.fonts.black,
            letterSpacing: -1.4,
          }}
        >
          {currentItem.prompt}
        </Text>

        {showTranslation && (
          <View
            style={{
              padding: 14,
              borderRadius: 18,
              backgroundColor: TA.colors.surface,
              borderWidth: 1.5,
              borderColor: TA.colors.purpleSoft,
              gap: 5,
            }}
          >
            <Text
              style={{
                color: TA.colors.purple,
                fontSize: 11,
                lineHeight: 14,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Traduction
            </Text>

            <Text
              style={{
                color: TA.colors.ink,
                fontSize: 24,
                lineHeight: 29,
                fontFamily: TA.fonts.black,
                letterSpacing: -0.8,
              }}
            >
              {currentItem.translation || currentItem.answer}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function LightInfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 22,
        backgroundColor: TA.colors.bgMiddle,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        gap: 6,
      }}
    >
      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 18,
          fontFamily: TA.fonts.black,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: TA.colors.inkMuted,
          fontSize: 14,
          lineHeight: 20,
          fontFamily: TA.fonts.bold,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function CompletionCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 22,
        backgroundColor: "#EAF8EF",
        borderWidth: 1.5,
        borderColor: "#176C3A",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Text
        style={{
          color: "#176C3A",
          fontSize: 12,
          fontFamily: TA.fonts.black,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 32,
          lineHeight: 37,
          fontFamily: TA.fonts.black,
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: TA.colors.inkMuted,
          fontSize: 14,
          lineHeight: 19,
          fontFamily: TA.fonts.bold,
          textAlign: "center",
        }}
      >
        Tu peux maintenant terminer l’activité avec le bouton en bas.
      </Text>
    </View>
  );
}
