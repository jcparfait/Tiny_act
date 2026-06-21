import { Pressable, Text, View } from "react-native";

import { Activity } from "../types/tinyAct";
import { TA } from "../theme/tinyActTheme";

type ActivityCardProps = {
  activity: Activity;
  selectingActivity: boolean;
  onSelect: (activity: Activity) => void;
};

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

export function ActivityCard({
  activity,
  selectingActivity,
  onSelect,
}: ActivityCardProps) {
  return (
    <View
      style={{
        padding: 22,
        borderRadius: TA.radius.large,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: TA.colors.borderMedium,
        gap: 14,
        ...TA.shadow.card,
      }}
    >
      <View style={{ gap: 6 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "900",
            color: TA.colors.purple,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {activity.interest?.name || "Activité"} ·{" "}
          {activity.duration?.label || ""}
        </Text>

        <Text
          style={{
            fontSize: 27,
            lineHeight: 31,
            fontWeight: "900",
            color: TA.colors.ink,
            letterSpacing: -0.7,
          }}
        >
          {activity.name}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 15,
          color: TA.colors.inkMuted,
          lineHeight: 22,
          fontWeight: "700",
        }}
      >
        {activity.description ||
          activity.content ||
          "Aucune description."}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <InfoPill
          label={readableActivityType(
            activity.activity_type
          )}
        />

        <InfoPill
          label={activity.location?.name || "Lieu libre"}
        />
      </View>

      <Pressable
        onPress={() => onSelect(activity)}
        disabled={selectingActivity}
        style={({ pressed }) => ({
          marginTop: 4,
          padding: 16,
          borderRadius: TA.radius.pill,
          backgroundColor: selectingActivity
            ? "rgba(21, 27, 47, 0.24)"
            : TA.colors.ink,
          alignItems: "center",
          opacity: pressed ? 0.82 : 1,
        })}
      >
        <Text
          style={{
            color: TA.colors.white,
            fontSize: 16,
            fontWeight: "900",
          }}
        >
          {selectingActivity
            ? "Sélection..."
            : "Choisir cette activité"}
        </Text>
      </Pressable>
    </View>
  );
}

function InfoPill({
  label,
}: {
  label: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 11,
        borderRadius: TA.radius.pill,
        backgroundColor: TA.colors.goldSoft,
      }}
    >
      <Text
        style={{
          color: TA.colors.inkSoft,
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
