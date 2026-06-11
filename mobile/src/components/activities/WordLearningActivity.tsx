import { useState } from "react";
import { Text, View } from "react-native";
import { Activity } from "../../types/tinyAct";
import {
  activityMainText,
  DarkButton,
  DarkInfoBox,
  IntroCard,
  ScoreCard,
} from "./shared";

export function WordLearningActivity({ activity }: { activity: Activity }) {
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
