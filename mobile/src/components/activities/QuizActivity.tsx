import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Activity } from "../../types/tinyAct";
import {
  activityMainText,
  DarkButton,
  DarkInfoBox,
  FeedbackBox,
  IntroCard,
  QuestionCard,
  ScoreCard,
} from "./shared";

export function QuizActivity({ activity }: { activity: Activity }) {
  const questions = useMemo(() => {
    return activity.payload?.quiz_questions || [];
  }, [activity.payload?.quiz_questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isLastQuestion = currentIndex === questions.length - 1;

  const quizLabel =
    activity.activity_type === "code_quiz" ? "Quiz code" : "Quiz culture";

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

  if (questions.length === 0) {
    return (
      <View style={{ gap: 14 }}>
        <IntroCard label={quizLabel} text={activityMainText(activity)} />

        <DarkInfoBox
          title="Aucune question reçue"
          text="Vérifie que l’activité a bien un payload avec quiz_questions."
        />
      </View>
    );
  }

  if (completed) {
    return (
      <View style={{ gap: 14 }}>
        <ScoreCard score={score} total={questions.length} />
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <IntroCard
        label={`${quizLabel} · Question ${currentIndex + 1}/${questions.length}`}
        text={activityMainText(activity)}
      />

      <QuestionCard question={currentQuestion} />

      <View style={{ gap: 10 }}>
        {currentQuestion.answers.map((answer) => {
          const selected = selectedAnswer === answer;
          const correct = answer === currentQuestion.correct_answer;
          const showCorrection = isAnswered;

          return (
            <Pressable
              key={answer}
              onPress={() => handleAnswer(answer)}
              disabled={isAnswered}
              style={{
                padding: 15,
                borderRadius: 18,
                backgroundColor:
                  showCorrection && correct
                    ? "#D9F8E5"
                    : showCorrection && selected && !correct
                      ? "#FFE1DD"
                      : selected
                        ? "#17152F"
                        : "#FFFFFF",
                borderWidth: 2,
                borderColor:
                  showCorrection && correct
                    ? "#2EAD63"
                    : showCorrection && selected && !correct
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
                  color:
                    showCorrection && correct
                      ? "#176C3A"
                      : showCorrection && selected && !correct
                        ? "#B42318"
                        : selected
                          ? "#FFFFFF"
                          : "#17152F",
                  lineHeight: 21,
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
          success={selectedAnswer === currentQuestion.correct_answer}
          text={
            selectedAnswer === currentQuestion.correct_answer
              ? "Bonne réponse."
              : `Mauvaise réponse. La bonne réponse était : ${currentQuestion.correct_answer}`
          }
        />
      )}

      {isAnswered && (
        <DarkButton
          label={isLastQuestion ? "Voir le score" : "Question suivante"}
          onPress={handleNextQuestion}
        />
      )}
    </View>
  );
}
