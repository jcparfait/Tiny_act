import { Text, View } from "react-native";
import { Activity, ActivitySession } from "../types/tinyAct";

type ActiveActivityCardProps = {
  activity: Activity;
  activitySession: ActivitySession;
  elapsedSeconds: number;
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

export function ActiveActivityCard({
  activity,
  activitySession,
  elapsedSeconds,
}: ActiveActivityCardProps) {
  return (
    <View
      style={{
        padding: 22,
        borderRadius: 28,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#F2D7C8",
        gap: 18,
      }}
    >
      <View style={{ gap: 6 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: "#FF4B2B",
            textTransform: "uppercase",
          }}
        >
          {activitySession.finished ? "Activité terminée" : "Activité en cours"}
        </Text>

        <Text
          style={{
            fontSize: 30,
            fontWeight: "900",
            color: "#17152F",
          }}
        >
          {activity.name}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 16,
          color: "#5D5A70",
          lineHeight: 24,
        }}
      >
        {activity.content || activity.description}
      </Text>

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
          Temps écoulé
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontSize: 42,
            color: "#FFFFFF",
            fontWeight: "900",
          }}
        >
          {formatElapsedTime(elapsedSeconds)}
        </Text>
      </View>

      <View
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: "#FFF4EA",
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 15, color: "#17152F", fontWeight: "800" }}>
          Session
        </Text>

        <Text style={{ fontSize: 15, color: "#5D5A70" }}>
          Statut : {readableStatus(activitySession.status)}
        </Text>

        <Text style={{ fontSize: 15, color: "#5D5A70" }}>
          Durée prévue : {activity.duration?.label || "Non renseignée"}
        </Text>

        <Text style={{ fontSize: 15, color: "#5D5A70" }}>
          Type : {activity.activity_type}
        </Text>
      </View>
    </View>
  );
}
