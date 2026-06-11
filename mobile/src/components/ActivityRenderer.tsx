import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Activity, LanguageItem, QuizQuestion } from "../types/tinyAct";

type ActivityRendererProps = {
  activity: Activity;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
};

function activityMainText(activity: Activity) {
  return activity.content || activity.description || "Aucune consigne renseignée.";
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ActivityRenderer({
  activity,
  onActivityReadyToFinishChange,
}: ActivityRendererProps) {
  useEffect(() => {
    if (activity.activity_type !== "melody") {
      onActivityReadyToFinishChange?.(true);
    }
  }, [activity.id, activity.activity_type, onActivityReadyToFinishChange]);

  if (activity.activity_type === "standard") {
    return <StandardActivity activity={activity} />;
  }

  if (
    activity.activity_type === "culture_quiz" ||
    activity.activity_type === "code_quiz"
  ) {
    return <QuizActivity activity={activity} />;
  }

  if (activity.activity_type === "word_learning") {
    return <WordLearningActivity activity={activity} />;
  }

  if (activity.activity_type === "sentence_completion") {
    return <SentenceCompletionActivity activity={activity} />;
  }

  if (activity.activity_type === "melody") {
    return (
      <MelodyActivity
        activity={activity}
        onActivityReadyToFinishChange={onActivityReadyToFinishChange}
      />
    );
  }

  return <FallbackActivity activity={activity} />;
}

function StandardActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
      <IntroCard label="À faire" text={activityMainText(activity)} />

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

function WordLearningActivity({ activity }: { activity: Activity }) {
  const items = activity.payload?.language_items || [];
  const languageLabel = activity.payload?.language_label || "langue cible";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentItem = items[currentIndex];

  function goNext() {
    if (currentIndex >= items.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex + 1);
    setShowTranslation(false);
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
        <ScoreCard score={items.length} total={items.length} label="Mots vus" />
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <IntroCard
        label={`Mot en ${languageLabel} · ${currentIndex + 1}/${items.length}`}
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
              {currentItem.translation || currentItem.answer}
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
        <DarkButton label="Mot suivant" onPress={goNext} />
      )}
    </View>
  );
}

function SentenceCompletionActivity({ activity }: { activity: Activity }) {
  const items = activity.payload?.language_items || [];
  const languageLabel = activity.payload?.language_label || "langue cible";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "revealed" | null>(
    null
  );
  const [completed, setCompleted] = useState(false);

  const currentItem = items[currentIndex];

  const sentenceParts = useMemo(() => {
    if (!currentItem) {
      return { before: "", after: "" };
    }

    return splitSentenceAroundAnswer(currentItem);
  }, [currentItem]);

  const answerIsVisible = feedback === "correct" || feedback === "revealed";
  const canGoNext = feedback === "correct" || feedback === "revealed";

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
        label={`Phrase en ${languageLabel} · ${currentIndex + 1}/${items.length}`}
        text="Complète le mot manquant. Après 3 erreurs, la réponse est affichée."
      />

      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: "#FFF4EA",
          borderWidth: 1,
          borderColor: "#F2D7C8",
          gap: 8,
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
          Phrase en français
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#17152F",
            lineHeight: 24,
            fontWeight: "700",
          }}
        >
          {currentItem.translation || "Traduction non renseignée"}
        </Text>
      </View>

      <View
        style={{
          padding: 18,
          borderRadius: 22,
          backgroundColor: "#17152F",
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
                  feedback === "correct" ? "#D9F8E5" : "#FFE1DD",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: feedback === "correct" ? "#176C3A" : "#B42318",
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
                color: "#17152F",
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
          text={`Mauvaise réponse. Il te reste ${3 - attempts} tentative(s).`}
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
          label={currentIndex >= items.length - 1 ? "Voir le score" : "Phrase suivante"}
          onPress={goNext}
        />
      )}
    </View>
  );
}

function MelodyActivity({
  activity,
  onActivityReadyToFinishChange,
}: {
  activity: Activity;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
}) {
  const melody = activity.payload?.melody;
  const notes = melody?.notes || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const [wrongNote, setWrongNote] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const currentNote = notes[currentIndex];

  useEffect(() => {
    if (notes.length === 0) {
      onActivityReadyToFinishChange?.(true);
      return;
    }

    onActivityReadyToFinishChange?.(completed);
  }, [completed, notes.length, onActivityReadyToFinishChange]);

  function playNote(note: string) {
    if (completed || notes.length === 0) return;

    if (note !== currentNote) {
      setWrongNote(note);
      return;
    }

    const nextPlayedNotes = [...playedNotes, note];

    setPlayedNotes(nextPlayedNotes);
    setWrongNote(null);

    if (currentIndex >= notes.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrentIndex((previousIndex) => previousIndex + 1);
  }

  if (!melody || notes.length === 0) {
    return (
      <View style={{ gap: 14 }}>
        <IntroCard
          label="Mélodie"
          text="Aucune mélodie disponible pour cette activité."
        />

        <DarkInfoBox
          title="Aucune note reçue"
          text="Vérifie que Rails renvoie bien payload.melody.notes."
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      <IntroCard
        label={`Mélodie · ${melody.category || "clavier"}`}
        text={`Joue les notes dans l’ordre. Difficulté : ${melody.difficulty || "non renseignée"}.`}
      />

      <View
        style={{
          padding: 22,
          borderRadius: 24,
          backgroundColor: "#17152F",
          alignItems: "center",
          gap: 8,
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
          Note à jouer
        </Text>

        <Text
          style={{
            fontSize: 54,
            color: "#FFFFFF",
            fontWeight: "900",
            lineHeight: 62,
          }}
        >
          {completed ? "✓" : currentNote}
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#FFFFFF",
            opacity: 0.8,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          {completed
            ? "Mélodie terminée. Tu peux maintenant finir l’activité."
            : `Progression : ${playedNotes.length}/${notes.length}`}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {notes.map((note, index) => {
          const isPlayed = index < playedNotes.length;
          const isCurrent = index === currentIndex && !completed;

          return (
            <View
              key={`${note}-${index}`}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: isPlayed
                  ? "#D9F8E5"
                  : isCurrent
                    ? "#17152F"
                    : "#FFFFFF",
                borderWidth: 1,
                borderColor: isPlayed
                  ? "#2EAD63"
                  : isCurrent
                    ? "#17152F"
                    : "#F2D7C8",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "900",
                  color: isPlayed
                    ? "#176C3A"
                    : isCurrent
                      ? "#FFFFFF"
                      : "#17152F",
                }}
              >
                {note}
              </Text>
            </View>
          );
        })}
      </View>

      {wrongNote && (
        <FeedbackBox
          success={false}
          text={`Tu as joué ${wrongNote}. La note attendue est ${currentNote}.`}
        />
      )}

      {completed && (
        <FeedbackBox
          success
          text="Bravo. Toutes les notes ont été jouées dans l’ordre."
        />
      )}

      <PianoKeyboard onPressNote={playNote} disabled={completed} />
    </View>
  );
}

function PianoKeyboard({
  onPressNote,
  disabled,
}: {
  onPressNote: (note: string) => void;
  disabled: boolean;
}) {
  const whiteNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
  const blackNotes = ["C#4", "D#4", "F#4", "G#4", "A#4"];

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          justifyContent: "center",
        }}
      >
        {whiteNotes.map((note) => (
          <Pressable
            key={note}
            disabled={disabled}
            onPress={() => onPressNote(note)}
            style={{
              flex: 1,
              minHeight: 86,
              borderRadius: 14,
              backgroundColor: disabled ? "#E7E0D8" : "#FFFFFF",
              borderWidth: 2,
              borderColor: "#F2D7C8",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#17152F",
                fontWeight: "900",
              }}
            >
              {note}
            </Text>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
        }}
      >
        {blackNotes.map((note) => (
          <Pressable
            key={note}
            disabled={disabled}
            onPress={() => onPressNote(note)}
            style={{
              minWidth: 54,
              minHeight: 52,
              borderRadius: 12,
              backgroundColor: disabled ? "#5D5A70" : "#17152F",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#FFFFFF",
                fontWeight: "900",
              }}
            >
              {note}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function splitSentenceAroundAnswer(item: LanguageItem) {
  const prompt = item.prompt || "";
  const answer = item.answer || "";

  if (!prompt || !answer) {
    return { before: prompt, after: "" };
  }

  const promptLower = prompt.toLowerCase();
  const answerLower = answer.toLowerCase();
  const index = promptLower.indexOf(answerLower);

  if (index === -1) {
    return {
      before: prompt,
      after: "",
    };
  }

  return {
    before: prompt.slice(0, index).trimEnd(),
    after: prompt.slice(index + answer.length).trimStart(),
  };
}

function IntroCard({ label, text }: { label: string; text: string }) {
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

function DarkInfoBox({ title, text }: { title: string; text: string }) {
  return (
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
        {title}
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
        {text}
      </Text>
    </View>
  );
}

function DarkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
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
        {label}
      </Text>
    </Pressable>
  );
}

function FeedbackBox({ success, text }: { success: boolean; text: string }) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 18,
        backgroundColor: success ? "#D9F8E5" : "#FFE1DD",
        borderWidth: 1,
        borderColor: success ? "#2EAD63" : "#FF4B2B",
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: success ? "#176C3A" : "#B42318",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function ScoreCard({
  score,
  total,
  label = "Score",
}: {
  score: number;
  total: number;
  label?: string;
}) {
  return (
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
        {label}
      </Text>

      <Text
        style={{
          marginTop: 6,
          fontSize: 42,
          color: "#FFFFFF",
          fontWeight: "900",
        }}
      >
        {score}/{total}
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
  );
}

function FallbackActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
      <IntroCard
        label={`Type : ${activity.activity_type}`}
        text={activityMainText(activity)}
      />

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
