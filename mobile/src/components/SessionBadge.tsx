import { Text, View } from "react-native";
import { ActivitySession } from "../types/tinyAct";

type SessionBadgeProps = {
  activitySession: ActivitySession;
  activitiesCount: number;
};

export function SessionBadge({
  activitySession,
  activitiesCount,
}: SessionBadgeProps) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
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
        Session créée
      </Text>

      <Text style={{ marginTop: 4, color: "#5D5A70" }}>
        Session #{activitySession.id} · {activitySession.status}
      </Text>

      <Text style={{ marginTop: 4, color: "#5D5A70" }}>
        {activitiesCount} activité(s) proposée(s)
      </Text>
    </View>
  );
}
