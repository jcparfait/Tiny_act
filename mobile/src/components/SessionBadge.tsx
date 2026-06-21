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
        borderColor: "rgba(90, 74, 54, 0.16)",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "800",
          color: "#7C63F2",
          textTransform: "uppercase",
        }}
      >
        Session créée
      </Text>

      <Text style={{ marginTop: 4, color: "rgba(21, 27, 47, 0.58)" }}>
        Session #{activitySession.id} · {activitySession.status}
      </Text>

      <Text style={{ marginTop: 4, color: "rgba(21, 27, 47, 0.58)" }}>
        {activitiesCount} activité(s) proposée(s)
      </Text>
    </View>
  );
}
