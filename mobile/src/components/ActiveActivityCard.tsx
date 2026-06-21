import { Text, View } from "react-native";

import { ActivityRenderer } from "./ActivityRenderer";

import {
  Activity,
  ActivitySession,
} from "../types/tinyAct";

import { TA } from "../theme/tinyActTheme";

type ActiveActivityCardProps = {
  activity: Activity;
  activitySession: ActivitySession;
  elapsedSeconds: number;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
};

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function readableStatus(status: string) {
  if (status === "in_progress") return "En cours";
  if (status === "paused") return "En pause";
  if (status === "finished") return "Terminée";
  if (status === "preview") return "Prévisualisation";

  return status;
}

function readableActivityType(type: string) {
  const labels: Record<string, string> = {
    standard: "Action simple",
    culture_quiz: "Quiz culture",
    code_quiz: "Quiz code",
    word_learning: "Langues · mots",
    sentence_completion: "Langues · phrases",
    melody: "Musique",
  };

  return labels[type] || "Activité";
}

export function ActiveActivityCard({
  activity,
  activitySession,
  elapsedSeconds,
  onActivityReadyToFinishChange,
}: ActiveActivityCardProps) {
  return (
    <View
      style={{
        padding: 24,
        borderRadius: TA.radius.large,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: TA.colors.borderMedium,
        gap: 18,
        ...TA.shadow.card,
      }}
    >
      <View style={{ gap: 7 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "900",
            color: activitySession.finished
              ? TA.colors.green
              : TA.colors.purple,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {activitySession.finished
            ? "Activité terminée"
            : "Activité en cours"}
        </Text>

        <Text
          style={{
            fontSize: 31,
            lineHeight: 35,
            fontWeight: "900",
            color: TA.colors.ink,
            letterSpacing: -0.9,
          }}
        >
          {activity.name}
        </Text>
      </View>

      <ActivityRenderer
        activity={activity}
        onActivityReadyToFinishChange={
          onActivityReadyToFinishChange
        }
      />

      <View
        style={{
          padding: 20,
          borderRadius: TA.radius.card,
          backgroundColor: TA.colors.ink,
          alignItems: "center",
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: TA.colors.white,
            opacity: 0.64,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Temps actif
        </Text>

        <Text
          style={{
            fontSize: 44,
            lineHeight: 49,
            color: TA.colors.white,
            fontWeight: "900",
            letterSpacing: -1,
          }}
        >
          {formatElapsedTime(elapsedSeconds)}
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          borderRadius: TA.radius.medium,
          backgroundColor: TA.colors.surfaceSoft,
          borderWidth: 1,
          borderColor: TA.colors.borderSoft,
          gap: 10,
        }}
      >
        <SessionLine
          label="Statut"
          value={readableStatus(
            activitySession.status
          )}
        />

        <SessionLine
          label="Durée prévue"
          value={
            activity.duration?.label ||
            "Non renseignée"
          }
        />

        <SessionLine
          label="Format"
          value={readableActivityType(
            activity.activity_type
          )}
        />
      </View>
    </View>
  );
}

function SessionLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text
        style={{
          color: TA.colors.inkMuted,
          fontSize: 14,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 14,
          fontWeight: "900",
          textAlign: "right",
          flex: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
