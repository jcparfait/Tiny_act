import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Activity } from "../../types/tinyAct";
import { DarkInfoBox, FeedbackBox, IntroCard } from "./shared";

type MelodyActivityProps = {
  activity: Activity;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
};

export function MelodyActivity({
  activity,
  onActivityReadyToFinishChange,
}: MelodyActivityProps) {
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
        text={`Joue les notes dans l’ordre. Difficulté : ${
          melody.difficulty || "non renseignée"
        }.`}
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
