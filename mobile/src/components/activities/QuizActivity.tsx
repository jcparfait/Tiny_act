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

import {
  activityMainText,
  DarkButton,
  DarkInfoBox,
  FeedbackBox,
  IntroCard,
  QuestionCard,
  ScoreCard,
} from "./shared";

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

export function QuizActivity({ activity }: { activity: Activity }) {
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

  const quizLabel =
    activity.activity_type === "code_quiz"
      ? "Quiz code"
      : "Quiz culture";

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

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isLastQuestion =
    currentIndex === questions.length - 1;

  function handleAnswer(answer: string) {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);

    if (answer === currentQuestion.correct_answer) {
      setScore((previousScore) => previousScore + 1);
    }
  }

  function handleNextQuestion() {
    if (!isAnswered) return;

    if (isLastQuestion) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer(null);
  }

  if (!progressLoaded) {
    return (
      <View
        style={{
          padding: 22,
          borderRadius: 22,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#F2D7C8",
          alignItems: "center",
          gap: 12,
        }}
      >
        <ActivityIndicator />

        <Text
          style={{
            fontSize: 15,
            color: "#5D5A70",
            fontWeight: "700",
          }}
        >
          Chargement de ta progression…
        </Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={{ gap: 14 }}>
        <IntroCard
          label={quizLabel}
          text={activityMainText(activity)}
        />

        <DarkInfoBox
          title="Aucune question reçue"
          text="Vérifie que l’activité contient des questions de quiz."
        />
      </View>
    );
  }

  if (completed) {
    return (
      <View style={{ gap: 14 }}>
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
    <View style={{ gap: 14 }}>
      {progressError && (
        <FeedbackBox
          success={false}
          text={progressError}
        />
      )}

      <IntroCard
        label={`${quizLabel} · Question ${
          currentIndex + 1
        }/${questions.length}`}
        text={activityMainText(activity)}
      />

      <QuestionCard question={currentQuestion} />

      <View style={{ gap: 10 }}>
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
                padding: 15,
                borderRadius: 18,
                backgroundColor:
                  isAnswered && correct
                    ? "#D9F8E5"
                    : isAnswered && selected && !correct
                      ? "#FFE1DD"
                      : selected
                        ? "#17152F"
                        : "#FFFFFF",
                borderWidth: 2,
                borderColor:
                  isAnswered && correct
                    ? "#2EAD63"
                    : isAnswered && selected && !correct
                      ? "#FF4B2B"
                      : selected
                        ? "#17152F"
                        : "#F2D7C8",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  lineHeight: 21,
                  color:
                    isAnswered && correct
                      ? "#176C3A"
                      : isAnswered && selected && !correct
                        ? "#B42318"
                        : selected
                          ? "#FFFFFF"
                          : "#17152F",
                }}
              >
                {answer}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isAnswered && (
        <FeedbackBox
          success={
            selectedAnswer ===
            currentQuestion.correct_answer
          }
          text={
            selectedAnswer ===
            currentQuestion.correct_answer
              ? "Bonne réponse."
              : `Mauvaise réponse. La bonne réponse était : ${currentQuestion.correct_answer}`
          }
        />
      )}

      {isAnswered && (
        <DarkButton
          label={
            isLastQuestion
              ? "Voir le score"
              : "Question suivante"
          }
          onPress={handleNextQuestion}
        />
      )}
    </View>
  );
}
