import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Activity, QuizQuestion } from "../types/tinyAct";

type ActivityRendererProps = {
  activity: Activity;
};

function activityMainText(activity: Activity) {
  return activity.content || activity.description || "Aucune consigne renseignée.";
}

export function ActivityRenderer({ activity }: ActivityRendererProps) {
  if (activity.activity_type === "standard") {
    return <StandardActivity activity={activity} />;
  }

  if (
    activity.activity_type === "culture_quiz" ||
    activity.activity_type === "code_quiz"
  ) {
    return <QuizActivity activity={activity} />;
  }

  if (activity.activity_type === "sentence_completion") {
    return <SentenceCompletionActivity activity={activity} />;
  }

  return <FallbackActivity activity={activity} />;
}

function StandardActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: "#FFF4EA",
          borderWidth: 1,
          borderColor: "#F2D7C8",
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
          À faire
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 17,
            color: "#17152F",
            lineHeight: 25,
            fontWeight: "700",
          }}
        >
          {activityMainText(activity)}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          color: "#5D5A70",
          lineHeight: 21,
        }}
      >
        Fais simplement cette action. Pas besoin de performance : le but est de
        commencer, pas de réussir parfaitement.
      </Text>
    </View>
  );
}

function QuizActivity({ activity }: { activity: Activity }) {
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
        <QuizIntroCard
          label={quizLabel}
          text={activityMainText(activity)}
        />

        <View
          style={{
            padding: 14,
            borderRadius: 18,
            backgroundColor: "#17152F",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              color: "#FFFFFF",
              lineHeight: 22,
              fontWeight: "700",
            }}
          >
            Aucune question n’a été reçue depuis Rails.
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: 14,
              color: "#FFFFFF",
              opacity: 0.75,
              lineHeight: 20,
            }}
          >
            Vérifie que l’activité a bien un payload avec quiz_questions.
          </Text>
        </View>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={{ gap: 14 }}>
        <View
          style={{
            padding: 18,
            borderRadius: 22,
            backgroundColor: "#17152F",
            alignItems: "center",
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
            Score
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: 42,
              color: "#FFFFFF",
              fontWeight: "900",
            }}
          >
            {score}/{questions.length}
          </Text>

          <Text
            style={{
              marginTop: 8,
              fontSize: 15,
              color: "#FFFFFF",
              opacity: 0.8,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Tu peux maintenant terminer l’activité avec le bouton en bas.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <QuizIntroCard
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
        <View
          style={{
            padding: 14,
            borderRadius: 18,
            backgroundColor:
              selectedAnswer === currentQuestion.correct_answer
                ? "#D9F8E5"
                : "#FFE1DD",
            borderWidth: 1,
            borderColor:
              selectedAnswer === currentQuestion.correct_answer
                ? "#2EAD63"
                : "#FF4B2B",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color:
                selectedAnswer === currentQuestion.correct_answer
                  ? "#176C3A"
                  : "#B42318",
            }}
          >
            {selectedAnswer === currentQuestion.correct_answer
              ? "Bonne réponse."
              : `Mauvaise réponse. La bonne réponse était : ${currentQuestion.correct_answer}`}
          </Text>
        </View>
      )}

      {isAnswered && (
        <Pressable
          onPress={handleNextQuestion}
          style={{
            padding: 15,
            borderRadius: 999,
            backgroundColor: "#17152F",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            {isLastQuestion ? "Voir le score" : "Question suivante"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function QuizIntroCard({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 20,
        backgroundColor: "#FFF4EA",
        borderWidth: 1,
        borderColor: "#F2D7C8",
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
        {label}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 16,
          color: "#17152F",
          lineHeight: 24,
          fontWeight: "700",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function QuestionCard({ question }: { question: QuizQuestion }) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 22,
        backgroundColor: "#17152F",
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
        {question.family || question.category || question.difficulty || "Question"}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 19,
          color: "#FFFFFF",
          lineHeight: 27,
          fontWeight: "900",
        }}
      >
        {question.question}
      </Text>
    </View>
  );
}

function SentenceCompletionActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: "#FFF4EA",
          borderWidth: 1,
          borderColor: "#F2D7C8",
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
          Phrase à compléter
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 17,
            color: "#17152F",
            lineHeight: 25,
            fontWeight: "700",
          }}
        >
          {activityMainText(activity)}
        </Text>
      </View>

      <View
        style={{
          padding: 14,
          borderRadius: 18,
          backgroundColor: "#17152F",
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: "#FFFFFF",
            lineHeight: 22,
            fontWeight: "700",
          }}
        >
          Le champ de réponse mobile sera ajouté ensuite.
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontSize: 14,
            color: "#FFFFFF",
            opacity: 0.75,
            lineHeight: 20,
          }}
        >
          On pourra ensuite afficher une phrase avec un trou, saisir la réponse,
          valider, puis gérer les bonnes et mauvaises réponses.
        </Text>
      </View>
    </View>
  );
}

function FallbackActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: "#FFF4EA",
          borderWidth: 1,
          borderColor: "#F2D7C8",
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
          Type : {activity.activity_type}
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 17,
            color: "#17152F",
            lineHeight: 25,
            fontWeight: "700",
          }}
        >
          {activityMainText(activity)}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          color: "#5D5A70",
          lineHeight: 21,
        }}
      >
        Ce type d’activité n’a pas encore d’interface mobile dédiée.
      </Text>
    </View>
  );
}
