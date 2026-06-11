import { Text, View } from "react-native";
import { Activity, ActivitySession } from "../types/tinyAct";

type ActiveActivityCardProps = {
  activity: Activity;
  activitySession: ActivitySession;
};

export function ActiveActivityCard({
  activity,
  activitySession,
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
          Activité en cours
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
          Statut : {activitySession.status}
        </Text>

        <Text style={{ fontSize: 15, color: "#5D5A70" }}>
          Durée : {activity.duration?.label || "Non renseignée"}
        </Text>

        <Text style={{ fontSize: 15, color: "#5D5A70" }}>
          Type : {activity.activity_type}
        </Text>
      </View>
    </View>
  );
}
