import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  loadActivityProgress,
  saveActivityProgress,
} from "../../services/api";

import {
  Activity,
  QuizProgress,
  QuizQuestion,
} from "../../types/tinyAct";

import type { ActivityFooterAction } from "../ActiveActivityCard";

import {
  FeedbackBox,
  ScoreCard,
} from "./shared";

import { TA } from "../../theme/tinyActTheme";

function validSavedQuizProgress(
  value: QuizProgress | undefined
): value is QuizProgress {
  return (
    value !== undefined &&
    Array.isArray(value.questions) &&
    typeof value.current_index === "number" &&
    typeof value.score === "number" &&
    typeof value.completed === "boolean"
  );
}

export function QuizActivity({
  activity,
  onActivityReadyToFinishChange,
  onFooterActionChange,
}: {
  activity: Activity;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
  onFooterActionChange?: (action: ActivityFooterAction | null) => void;
}) {
  const activitySessionId =
    activity.payload?.activity_session_id || null;

  const payloadQuestions =
    activity.payload?.quiz_questions || [];

  const [questions, setQuestions] = useState<QuizQuestion[]>(
    payloadQuestions
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] =
    useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [progressLoaded, setProgressLoaded] = useState(false);
  const [progressError, setProgressError] =
    useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isLastQuestion =
    currentIndex === questions.length - 1;

  useEffect(() => {
    let cancelled = false;

    async function hydrateProgress() {
      setProgressLoaded(false);
      setProgressError(null);

      setQuestions(payloadQuestions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setCompleted(false);

      if (!activitySessionId) {
        setProgressLoaded(true);
        return;
      }

      try {
        const response = await loadActivityProgress(
          activitySessionId
        );

        if (cancelled) return;

        const savedQuiz = response.progress_data.quiz;

        if (validSavedQuizProgress(savedQuiz)) {
          const savedQuestions =
            savedQuiz.questions.length > 0
              ? savedQuiz.questions
              : payloadQuestions;

          const maximumIndex = Math.max(
            savedQuestions.length - 1,
            0
          );

          const safeIndex = Math.min(
            Math.max(savedQuiz.current_index, 0),
            maximumIndex
          );

          setQuestions(savedQuestions);
          setCurrentIndex(safeIndex);
          setSelectedAnswer(savedQuiz.selected_answer);
          setScore(savedQuiz.score);
          setCompleted(savedQuiz.completed);
        }
      } catch (error) {
        if (cancelled) return;

        setProgressError(
          error instanceof Error
            ? error.message
            : "Impossible de charger la progression."
        );
      } finally {
        if (!cancelled) {
          setProgressLoaded(true);
        }
      }
    }

    hydrateProgress();

    return () => {
      cancelled = true;
    };
  }, [activity.id, activitySessionId]);

  useEffect(() => {
    onActivityReadyToFinishChange?.(completed);
  }, [completed, onActivityReadyToFinishChange]);

  useEffect(() => {
    if (
      !progressLoaded ||
      !activitySessionId ||
      questions.length === 0
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveActivityProgress(activitySessionId, {
        quiz: {
          questions,
          current_index: currentIndex,
          selected_answer: selectedAnswer,
          score,
          completed,
        },
      }).catch((error) => {
        console.warn(
          "Impossible de sauvegarder la progression du quiz",
          error
        );
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [
    activitySessionId,
    completed,
    currentIndex,
    progressLoaded,
    questions,
    score,
    selectedAnswer,
  ]);

  useEffect(() => {
    if (!progressLoaded || completed || questions.length === 0) {
      onFooterActionChange?.(null);
      return;
    }

    if (!isAnswered) {
      onFooterActionChange?.({
        label: "Question suivante",
        disabled: true,
        onPress: () => {},
      });
      return;
    }

    onFooterActionChange?.({
      label: isLastQuestion ? "Voir le score" : "Question suivante",
      disabled: false,
      onPress: () => {
        if (isLastQuestion) {
          setCompleted(true);
          return;
        }

        setCurrentIndex((previousIndex) => previousIndex + 1);
        setSelectedAnswer(null);
      },
    });

    return () => {
      onFooterActionChange?.(null);
    };
  }, [
    completed,
    currentIndex,
    isAnswered,
    isLastQuestion,
    onFooterActionChange,
    progressLoaded,
    questions.length,
  ]);

  function handleAnswer(answer: string) {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);

    if (answer === currentQuestion.correct_answer) {
      setScore((previousScore) => previousScore + 1);
    }
  }

  if (!progressLoaded) {
    return (
      <View
        style={{
          padding: 18,
          borderRadius: 24,
          backgroundColor: TA.colors.surface,
          borderWidth: 1.5,
          borderColor: TA.colors.borderMedium,
          alignItems: "center",
          gap: 12,
        }}
      >
        <ActivityIndicator />

        <Text
          style={{
            fontSize: 15,
            color: TA.colors.inkMuted,
            fontFamily: TA.fonts.bold,
          }}
        >
          Chargement de ta progression…
        </Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View
        style={{
          padding: 18,
          borderRadius: 24,
          backgroundColor: TA.colors.surface,
          borderWidth: 1.5,
          borderColor: TA.colors.borderMedium,
          gap: 8,
        }}
      >
        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 22,
            fontFamily: TA.fonts.black,
          }}
        >
          Aucune question reçue
        </Text>

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: TA.fonts.bold,
          }}
        >
          Vérifie que l’activité contient des questions de quiz.
        </Text>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={{ gap: 12 }}>
        {progressError && (
          <FeedbackBox
            success={false}
            text={progressError}
          />
        )}

        <ScoreCard
          score={score}
          total={questions.length}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {progressError && (
        <FeedbackBox
          success={false}
          text={progressError}
        />
      )}

      <View
        style={{
          padding: 16,
          borderRadius: 26,
          backgroundColor: TA.colors.surface,
          borderWidth: 2,
          borderColor: isAnswered
            ? selectedAnswer === currentQuestion.correct_answer
              ? "#6AC986"
              : "#FF9B8F"
            : TA.colors.borderMedium,
          gap: 14,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: TA.colors.blue,
              fontSize: 12,
              fontFamily: TA.fonts.black,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Question {currentIndex + 1}/{questions.length}
          </Text>

          <Text
            style={{
              color: TA.colors.inkMuted,
              fontSize: 12,
              fontFamily: TA.fonts.black,
            }}
          >
            {score} pts
          </Text>
        </View>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 24,
            lineHeight: 28,
            fontFamily: TA.fonts.black,
            letterSpacing: -1,
          }}
        >
          {currentQuestion.question}
        </Text>

        <View style={{ gap: 8 }}>
          {currentQuestion.answers.map((answer) => {
            const selected = selectedAnswer === answer;
            const correct =
              answer === currentQuestion.correct_answer;

            return (
              <Pressable
                key={answer}
                onPress={() => handleAnswer(answer)}
                disabled={isAnswered}
                style={{
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  backgroundColor:
                    isAnswered && correct
                      ? "#E8F8EF"
                      : isAnswered && selected && !correct
                        ? "#FFEAE7"
                        : TA.colors.surface,
                  borderWidth: 2,
                  borderColor:
                    isAnswered && correct
                      ? "#5DBB78"
                      : isAnswered && selected && !correct
                        ? "#FF8F82"
                        : TA.colors.borderMedium,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: TA.fonts.black,
                    lineHeight: 20,
                    color:
                      isAnswered && correct
                        ? "#176C3A"
                        : isAnswered && selected && !correct
                          ? "#B42318"
                          : TA.colors.ink,
                  }}
                >
                  {answer}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isAnswered && (
          <Text
            style={{
              color:
                selectedAnswer === currentQuestion.correct_answer
                  ? "#176C3A"
                  : "#B42318",
              fontSize: 14,
              lineHeight: 20,
              fontFamily: TA.fonts.black,
            }}
          >
            {selectedAnswer === currentQuestion.correct_answer
              ? "Bonne réponse."
              : `Mauvaise réponse. La bonne réponse était : ${currentQuestion.correct_answer}`}
          </Text>
        )}
      </View>
    </View>
  );
}
