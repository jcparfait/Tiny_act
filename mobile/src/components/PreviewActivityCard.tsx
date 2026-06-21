import { Text, View } from "react-native";

import { Activity } from "../types/tinyAct";
import { TA } from "../theme/tinyActTheme";

type PreviewActivityCardProps = {
  activity: Activity;
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

export function PreviewActivityCard({
  activity,
}: PreviewActivityCardProps) {
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
            color: TA.colors.purple,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Résumé avant de commencer
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

      <Text
        style={{
          fontSize: 16,
          color: TA.colors.inkMuted,
          lineHeight: 24,
          fontWeight: "700",
        }}
      >
        {activity.description ||
          activity.content ||
          "Aucune description."}
      </Text>

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
        <SummaryLine
          label="Thème"
          value={activity.interest?.name || "Activité"}
        />

        <SummaryLine
          label="Lieu"
          value={activity.location?.name || "Non renseigné"}
        />

        <SummaryLine
          label="Durée"
          value={activity.duration?.label || "Non renseignée"}
        />

        <SummaryLine
          label="Format"
          value={readableActivityType(
            activity.activity_type
          )}
        />
      </View>
    </View>
  );
}

function SummaryLine({
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
