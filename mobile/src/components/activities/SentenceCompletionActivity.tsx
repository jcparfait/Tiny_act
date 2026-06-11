import { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Activity, LanguageItem } from "../../types/tinyAct";
import {
  activityMainText,
  DarkButton,
  DarkInfoBox,
  FeedbackBox,
  IntroCard,
  normalizeAnswer,
  ScoreCard,
} from "./shared";

export function SentenceCompletionActivity({ activity }: { activity: Activity }) {
  const items = activity.payload?.language_items || [];
  const languageLabel = activity.payload?.language_label || "langue cible";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | "revealed" | null
  >(null);
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

      {feedback === "correct" && <FeedbackBox success text="Bonne réponse." />}

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
