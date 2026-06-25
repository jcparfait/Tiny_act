import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  loadActivityProgress,
  saveActivityProgress,
} from "../../services/api";

import {
  Activity,
  LanguageItem,
  SentenceCompletionProgress,
  SentenceFeedback,
} from "../../types/tinyAct";

import type {
  ActivityFooterAction,
  ActivityHeaderMeta,
} from "../ActiveActivityCard";

import {
  FeedbackBox,
  normalizeAnswer,
} from "./shared";

import { TA } from "../../theme/tinyActTheme";

function validProgress(
  value: SentenceCompletionProgress | undefined
): value is SentenceCompletionProgress {
  return (
    value !== undefined &&
    Array.isArray(value.items) &&
    typeof value.current_index === "number" &&
    typeof value.input_value === "string" &&
    typeof value.attempts === "number" &&
    typeof value.score === "number" &&
    typeof value.completed === "boolean"
  );
}

function languageLabelUpper(languageLabel: string) {
  return languageLabel.toLocaleUpperCase("fr-FR");
}

export function SentenceCompletionActivity({
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
  const [inputValue, setInputValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);

  const [feedback, setFeedback] =
    useState<SentenceFeedback>(null);

  const [completed, setCompleted] = useState(false);
  const [progressLoaded, setProgressLoaded] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setProgressLoaded(false);
      setItems(payloadItems);
      setCurrentIndex(0);
      setInputValue("");
      setAttempts(0);
      setScore(0);
      setFeedback(null);
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
          response.progress_data.sentence_completion;

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
          setInputValue(saved.input_value);
          setAttempts(saved.attempts);
          setScore(saved.score);
          setFeedback(saved.feedback);
          setCompleted(saved.completed);
        }
      } catch (error) {
        console.warn(
          "Impossible de charger les phrases",
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
        sentence_completion: {
          items,
          current_index: currentIndex,
          input_value: inputValue,
          attempts,
          score,
          feedback,
          completed,
        },
      }).catch((error) => {
        console.warn(
          "Impossible de sauvegarder les phrases",
          error
        );
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    attempts,
    completed,
    currentIndex,
    feedback,
    inputValue,
    items,
    progressLoaded,
    score,
    sessionId,
  ]);

  const currentItem = items[currentIndex];

  const sentenceParts = useMemo(() => {
    if (!currentItem) {
      return { before: "", after: "" };
    }

    return splitSentenceAroundAnswer(currentItem);
  }, [currentItem]);

  const answerIsVisible =
    feedback === "correct" || feedback === "revealed";

  const canGoNext =
    feedback === "correct" || feedback === "revealed";

  function checkAnswer() {
    if (!currentItem || canGoNext) return;

    const expected = normalizeAnswer(currentItem.answer);
    const given = normalizeAnswer(inputValue);

    if (given.length === 0) return;

    if (given === expected) {
      setScore((previousScore) => previousScore + 1);
      setFeedback("correct");
      return;
    }

    const nextAttempts = attempts + 1;

    setAttempts(nextAttempts);
    setInputValue("");

    if (nextAttempts >= 3) {
      setFeedback("revealed");
    } else {
      setFeedback("wrong");
    }
  }

  function goNext() {
    if (!canGoNext) return;

    if (currentIndex >= items.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex + 1);
    setInputValue("");
    setAttempts(0);
    setFeedback(null);
  }

  useEffect(() => {
    if (!progressLoaded || items.length === 0) {
      onActivityReadyToFinishChange?.(false);
      onFooterActionChange?.(null);
      onHeaderMetaChange?.(null);
      return;
    }

    const progressLabel = `PHRASE EN ${languageLabelUpper(languageLabel)} • ${
      completed ? items.length : currentIndex + 1
    }/${items.length}`;

    onHeaderMetaChange?.({
      progressLabel,
      subtitle: "Complète le mot manquant. Après 3 erreurs, la réponse s’affiche.",
    });

    if (completed) {
      onActivityReadyToFinishChange?.(true);
      onFooterActionChange?.(null);
      return;
    }

    onActivityReadyToFinishChange?.(false);
    onFooterActionChange?.({
      label: canGoNext
        ? currentIndex >= items.length - 1
          ? "Voir le score"
          : "Phrase suivante"
        : "Valider",
      disabled: !canGoNext && normalizeAnswer(inputValue).length === 0,
      onPress: canGoNext ? goNext : checkAnswer,
    });
  }, [
    canGoNext,
    completed,
    currentIndex,
    inputValue,
    items.length,
    languageLabel,
    progressLoaded,
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
        title="Aucune phrase reçue"
        text="Vérifie que Rails renvoie bien language_items dans le payload."
      />
    );
  }

  if (completed) {
    return (
      <CompletionCard
        label="Score"
        value={`${score}/${items.length}`}
      />
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          padding: 14,
          borderRadius: 20,
          backgroundColor: TA.colors.bgMiddle,
          borderWidth: 1.5,
          borderColor: TA.colors.borderMedium,
          gap: 6,
        }}
      >
        <Text
          style={{
            color: TA.colors.purple,
            fontSize: 12,
            lineHeight: 15,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Phrase en français
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 17,
            lineHeight: 24,
            fontFamily: TA.fonts.bold,
          }}
        >
          {currentItem.translation ||
            "Traduction non renseignée"}
        </Text>
      </View>

      <View
        style={{
          padding: 17,
          borderRadius: 22,
          backgroundColor: TA.colors.bgMiddle,
          borderWidth: 1.5,
          borderColor: TA.colors.purpleSoft,
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
            letterSpacing: 0.8,
          }}
        >
          Complète la phrase
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 20,
            lineHeight: 29,
            fontFamily: TA.fonts.black,
            letterSpacing: -0.5,
          }}
        >
          {sentenceParts.before}{" "}
          <Text
            style={{
              color: answerIsVisible
                ? feedback === "correct"
                  ? "#176C3A"
                  : TA.colors.dangerText
                : TA.colors.inkMuted,
            }}
          >
            {answerIsVisible ? currentItem.answer : "___"}
          </Text>{" "}
          {sentenceParts.after}
        </Text>

        {!answerIsVisible && (
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Écris le mot manquant"
            placeholderTextColor="rgba(21, 27, 47, 0.34)"
            returnKeyType="done"
            onSubmitEditing={checkAnswer}
            style={{
              paddingVertical: 13,
              paddingHorizontal: 15,
              borderRadius: 18,
              backgroundColor: TA.colors.surface,
              borderWidth: 1.5,
              borderColor: TA.colors.borderMedium,
              color: TA.colors.ink,
              fontSize: 17,
              fontFamily: TA.fonts.bold,
              outlineStyle: "none" as never,
            }}
          />
        )}
      </View>

      {feedback === "wrong" && (
        <FeedbackBox
          success={false}
          text={`Mauvaise réponse. Il te reste ${
            3 - attempts
          } tentative(s).`}
        />
      )}

      {feedback === "correct" && (
        <FeedbackBox success text="Bonne réponse." />
      )}

      {feedback === "revealed" && (
        <FeedbackBox
          success={false}
          text={`Réponse affichée : ${currentItem.answer}`}
        />
      )}
    </View>
  );
}

function splitSentenceAroundAnswer(item: LanguageItem) {
  const prompt = item.prompt || "";
  const answer = item.answer || "";

  if (!prompt || !answer) {
    return { before: prompt, after: "" };
  }

  const index = prompt
    .toLowerCase()
    .indexOf(answer.toLowerCase());

  if (index === -1) {
    return {
      before: prompt,
      after: "",
    };
  }

  return {
    before: prompt.slice(0, index).trimEnd(),
    after: prompt
      .slice(index + answer.length)
      .trimStart(),
  };
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
