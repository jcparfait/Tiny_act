import { Pressable, Text, View } from "react-native";
import { Activity } from "../types/tinyAct";

type ActivityCardProps = {
  activity: Activity;
  selectingActivity: boolean;
  onSelect: (activity: Activity) => void;
};

export function ActivityCard({
  activity,
  selectingActivity,
  onSelect,
}: ActivityCardProps) {
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 26,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#F2D7C8",
        gap: 12,
      }}
    >
      <View style={{ gap: 4 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: "#FF4B2B",
            textTransform: "uppercase",
          }}
        >
          {activity.interest?.name || "Activité"} ·{" "}
          {activity.duration?.label || ""}
        </Text>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "900",
            color: "#17152F",
          }}
        >
          {activity.name}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 15,
          color: "#5D5A70",
          lineHeight: 22,
        }}
      >
        {activity.description || activity.content}
      </Text>

      <Pressable
        onPress={() => onSelect(activity)}
        disabled={selectingActivity}
        style={{
          marginTop: 8,
          padding: 15,
          borderRadius: 999,
          backgroundColor: selectingActivity ? "#C8C4BE" : "#17152F",
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
          {selectingActivity ? "Sélection..." : "Choisir cette activité"}
        </Text>
      </Pressable>
    </View>
  );
}
