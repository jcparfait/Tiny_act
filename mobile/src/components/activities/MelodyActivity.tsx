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
  MelodyProgress,
} from "../../types/tinyAct";

import { TA } from "../../theme/tinyActTheme";

type MelodyActivityProps = {
  activity: Activity;
  onActivityReadyToFinishChange?: (
    ready: boolean
  ) => void;
};

function validProgress(
  value: MelodyProgress | undefined
): value is MelodyProgress {
  return (
    value !== undefined &&
    Array.isArray(value.notes) &&
    typeof value.current_index === "number" &&
    Array.isArray(value.played_notes) &&
    typeof value.completed === "boolean"
  );
}

export function MelodyActivity({
  activity,
  onActivityReadyToFinishChange,
}: MelodyActivityProps) {
  const melody = activity.payload?.melody;

  const sessionId =
    activity.payload?.activity_session_id || null;

  const payloadNotes = melody?.notes || [];

  const [notes, setNotes] =
    useState<string[]>(payloadNotes);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [playedNotes, setPlayedNotes] =
    useState<string[]>([]);

  const [wrongNote, setWrongNote] =
    useState<string | null>(null);

  const [completed, setCompleted] = useState(false);

  const [progressLoaded, setProgressLoaded] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setProgressLoaded(false);
      setNotes(payloadNotes);
      setCurrentIndex(0);
      setPlayedNotes([]);
      setWrongNote(null);
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
          response.progress_data.melody;

        if (validProgress(saved)) {
          const savedNotes =
            saved.notes.length > 0
              ? saved.notes
              : payloadNotes;

          const maximumIndex = Math.max(
            savedNotes.length - 1,
            0
          );

          const safePlayedNotes =
            saved.played_notes.slice(
              0,
              savedNotes.length
            );

          setNotes(savedNotes);

          setCurrentIndex(
            Math.min(
              Math.max(saved.current_index, 0),
              maximumIndex
            )
          );

          setPlayedNotes(safePlayedNotes);

          setWrongNote(saved.wrong_note || null);

          setCompleted(
            saved.completed ||
              safePlayedNotes.length >= savedNotes.length
          );
        }
      } catch (error) {
        console.warn(
          "Impossible de charger la mélodie",
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
    if (!progressLoaded) return;

    if (notes.length === 0) {
      onActivityReadyToFinishChange?.(true);
      return;
    }

    onActivityReadyToFinishChange?.(completed);
  }, [
    completed,
    notes.length,
    onActivityReadyToFinishChange,
    progressLoaded,
  ]);

  useEffect(() => {
    if (
      !progressLoaded ||
      !sessionId ||
      notes.length === 0
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveActivityProgress(sessionId, {
        melody: {
          notes,
          current_index: currentIndex,
          played_notes: playedNotes,
          wrong_note: wrongNote,
          completed,
        },
      }).catch((error) => {
        console.warn(
          "Impossible de sauvegarder la mélodie",
          error
        );
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [
    completed,
    currentIndex,
    notes,
    playedNotes,
    progressLoaded,
    sessionId,
    wrongNote,
  ]);

  const currentNote = notes[currentIndex];

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

    setCurrentIndex(
      (previousIndex) => previousIndex + 1
    );
  }

  if (!progressLoaded) {
    return (
      <View
        style={{
          padding: 18,
          alignItems: "center",
          gap: 10,
        }}
      >
        <ActivityIndicator />

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontFamily: TA.fonts.bold,
            fontSize: 13,
          }}
        >
          Chargement de la progression…
        </Text>
      </View>
    );
  }

  if (!melody || notes.length === 0) {
    return (
      <View
        style={{
          padding: 16,
          borderRadius: 22,
          backgroundColor: TA.colors.surface,
          borderWidth: 1.5,
          borderColor: TA.colors.borderMedium,
          gap: 8,
        }}
      >
        <Text
          style={{
            color: TA.colors.purple,
            fontSize: 12,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Mélodie indisponible
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 16,
            lineHeight: 22,
            fontFamily: TA.fonts.bold,
          }}
        >
          Aucune note n’a été reçue pour cette activité.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          padding: 14,
          borderRadius: 22,
          backgroundColor: "#FFF4E4",
          borderWidth: 1.5,
          borderColor: "#F39A20",
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#F39A20",
                fontSize: 12,
                lineHeight: 15,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Mélodie · {playedNotes.length}/{notes.length}
            </Text>

            <Text
              style={{
                marginTop: 4,
                color: TA.colors.ink,
                fontSize: 17,
                lineHeight: 23,
                fontFamily: TA.fonts.black,
              }}
            >
              Joue les notes dans l’ordre.
            </Text>
          </View>

          <View
            style={{
              minWidth: 92,
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 18,
              backgroundColor: TA.colors.surface,
              borderWidth: 1.5,
              borderColor: TA.colors.borderMedium,
              alignItems: "center",
              ...TA.shadow.soft,
            }}
          >
            <Text
              style={{
                color: TA.colors.inkLight,
                fontSize: 10,
                lineHeight: 12,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              À jouer
            </Text>

            <Text
              style={{
                marginTop: 1,
                color: completed
                  ? TA.colors.green
                  : TA.colors.ink,
                fontSize: 31,
                lineHeight: 35,
                fontFamily: TA.fonts.black,
                letterSpacing: -1,
              }}
            >
              {completed ? "✓" : currentNote}
            </Text>
          </View>
        </View>

        <MelodyProgressPills
          notes={notes}
          playedCount={playedNotes.length}
          currentIndex={currentIndex}
          completed={completed}
        />
      </View>

      {wrongNote && !completed && (
        <CompactFeedback
          success={false}
          text={`Tu as joué ${wrongNote}. Note attendue : ${currentNote}.`}
        />
      )}

      {completed && (
        <CompactFeedback
          success
          text="Mélodie terminée. Tu peux valider l’activité."
        />
      )}

      <PianoKeyboard
        onPressNote={playNote}
        disabled={completed}
      />
    </View>
  );
}

function MelodyProgressPills({
  notes,
  playedCount,
  currentIndex,
  completed,
}: {
  notes: string[];
  playedCount: number;
  currentIndex: number;
  completed: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
      }}
    >
      {notes.map((note, index) => {
        const isPlayed = index < playedCount;
        const isCurrent =
          index === currentIndex && !completed;

        return (
          <View
            key={`${note}-${index}`}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 9,
              borderRadius: 999,
              backgroundColor: isPlayed
                ? "#EAF8EF"
                : isCurrent
                  ? "#FFFDF9"
                  : "rgba(255, 253, 249, 0.58)",
              borderWidth: 1.5,
              borderColor: isPlayed
                ? "#2EAD63"
                : isCurrent
                  ? "#F39A20"
                  : TA.colors.borderMedium,
            }}
          >
            <Text
              style={{
                color: isPlayed
                  ? "#176C3A"
                  : isCurrent
                    ? "#F39A20"
                    : TA.colors.inkMuted,
                fontSize: 12,
                lineHeight: 14,
                fontFamily: TA.fonts.black,
              }}
            >
              {note}
            </Text>
          </View>
        );
      })}
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
  const naturalNotes = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
  ];

  const sharpNotes = [
    "C#4",
    "D#4",
    "F#4",
    "G#4",
    "A#4",
  ];

  return (
    <View style={{ gap: 9 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 5,
        }}
      >
        {naturalNotes.map((note) => (
          <PianoKey
            key={note}
            note={note}
            disabled={disabled}
            variant="light"
            onPress={() => onPressNote(note)}
          />
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 6,
          justifyContent: "center",
        }}
      >
        {sharpNotes.map((note) => (
          <PianoKey
            key={note}
            note={note}
            disabled={disabled}
            variant="accent"
            onPress={() => onPressNote(note)}
          />
        ))}
      </View>
    </View>
  );
}

function PianoKey({
  note,
  variant,
  disabled,
  onPress,
}: {
  note: string;
  variant: "light" | "accent";
  disabled: boolean;
  onPress: () => void;
}) {
  const isAccent = variant === "accent";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: isAccent ? undefined : 1,
        minWidth: isAccent ? 54 : undefined,
        minHeight: isAccent ? 43 : 66,
        borderRadius: isAccent ? 15 : 17,
        backgroundColor: disabled
          ? "#E7E0D8"
          : isAccent
            ? "#FFF4E4"
            : TA.colors.surface,
        borderWidth: 2,
        borderColor: disabled
          ? "rgba(90, 74, 54, 0.10)"
          : isAccent
            ? "#F39A20"
            : TA.colors.borderMedium,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.72 : 1,
        transform: [
          {
            translateY: pressed ? 1 : 0,
          },
        ],
      })}
    >
      <Text
        style={{
          color: disabled
            ? TA.colors.inkLight
            : isAccent
              ? "#F39A20"
              : TA.colors.ink,
          fontSize: isAccent ? 12 : 13,
          lineHeight: isAccent ? 15 : 16,
          fontFamily: TA.fonts.black,
        }}
      >
        {note}
      </Text>
    </Pressable>
  );
}

function CompactFeedback({
  success,
  text,
}: {
  success: boolean;
  text: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: success
          ? "#EAF8EF"
          : "#FFE1DD",
        borderWidth: 1.5,
        borderColor: success
          ? "#2EAD63"
          : "#FF9B8F",
      }}
    >
      <Text
        style={{
          color: success
            ? "#176C3A"
            : TA.colors.dangerText,
          fontSize: 13,
          lineHeight: 18,
          fontFamily: TA.fonts.black,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
