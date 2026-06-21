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

import {
  activityMainText,
  DarkButton,
  DarkInfoBox,
  FeedbackBox,
  IntroCard,
  normalizeAnswer,
  ScoreCard,
} from "./shared";

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

export function SentenceCompletionActivity({
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
            color: "rgba(21, 27, 47, 0.58)",
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
          label={`Phrases en ${languageLabel}`}
          text={activityMainText(activity)}
        />

        <DarkInfoBox
          title="Aucune phrase reçue"
          text="Vérifie que Rails renvoie bien language_items dans le payload."
        />
      </View>
    );
  }

  if (completed) {
    return (
      <View style={{ gap: 14 }}>
        <ScoreCard score={score} total={items.length} />
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <IntroCard
        label={`Phrase en ${languageLabel} · ${
          currentIndex + 1
        }/${items.length}`}
        text="Complète le mot manquant. Après 3 erreurs, la réponse est affichée."
      />

      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: "#F4EFE8",
          borderWidth: 1,
          borderColor: "rgba(90, 74, 54, 0.16)",
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: "#7C63F2",
            textTransform: "uppercase",
          }}
        >
          Phrase en français
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#151B2F",
            lineHeight: 24,
            fontWeight: "700",
          }}
        >
          {currentItem.translation ||
            "Traduction non renseignée"}
        </Text>
      </View>

      <View
        style={{
          padding: 18,
          borderRadius: 22,
          backgroundColor: "#151B2F",
          gap: 14,
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
          Complète la phrase
        </Text>

        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontSize: 18,
              color: "#FFFFFF",
              lineHeight: 28,
              fontWeight: "800",
            }}
          >
            {sentenceParts.before}
          </Text>

          {answerIsVisible ? (
            <View
              style={{
                padding: 14,
                borderRadius: 16,
                backgroundColor:
                  feedback === "correct"
                    ? "#D9F8E5"
                    : "#FFE1DD",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color:
                    feedback === "correct"
                      ? "#176C3A"
                      : "#B42318",
                }}
              >
                {currentItem.answer}
              </Text>
            </View>
          ) : (
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Écris le mot manquant"
              placeholderTextColor="#8E8A9D"
              returnKeyType="done"
              onSubmitEditing={checkAnswer}
              style={{
                padding: 14,
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                color: "#151B2F",
                fontSize: 18,
                fontWeight: "800",
                outlineStyle: "none" as never,
              }}
            />
          )}

          <Text
            style={{
              fontSize: 18,
              color: "#FFFFFF",
              lineHeight: 28,
              fontWeight: "800",
            }}
          >
            {sentenceParts.after}
          </Text>
        </View>
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

      {!canGoNext ? (
        <DarkButton label="Valider" onPress={checkAnswer} />
      ) : (
        <DarkButton
          label={
            currentIndex >= items.length - 1
              ? "Voir le score"
              : "Phrase suivante"
          }
          onPress={goNext}
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
