import { Pressable, Text, View } from "react-native";

import { Activity } from "../types/tinyAct";
import { TA } from "../theme/tinyActTheme";

type ActivityCardProps = {
  activity: Activity;
  selectingActivity: boolean;
  onSelect: (activity: Activity) => void;
};

type InterestVisual = {
  color: string;
  softColor: string;
  icon: string;
  label: string;
};

const INTEREST_VISUALS: Record<string, InterestVisual> = {
  Code: {
    color: "#7FA8F8",
    softColor: "#EEF5FF",
    icon: "</>",
    label: "Code",
  },
  Culture: {
    color: "#F19B8D",
    softColor: "#FFF0EC",
    icon: "▣",
    label: "Culture",
  },
  Langues: {
    color: "#8B6CF6",
    softColor: "#F2EDFF",
    icon: "A",
    label: "Langues",
  },
  Sport: {
    color: "#89BE69",
    softColor: "#F0FAEA",
    icon: "↗",
    label: "Sport",
  },
  "Bien-être": {
    color: "#7FCFBF",
    softColor: "#EEFBF8",
    icon: "◡",
    label: "Bien-être",
  },
  Photo: {
    color: "#F58AB7",
    softColor: "#FFF0F7",
    icon: "▣",
    label: "Photo",
  },
  Dessin: {
    color: "#8AD6C9",
    softColor: "#EFFBF9",
    icon: "✎",
    label: "Dessin",
  },
  Productivité: {
    color: "#E5B84D",
    softColor: "#FFF7DC",
    icon: "✓",
    label: "Productivité",
  },
  Musique: {
    color: "#F39A20",
    softColor: "#FFF4E4",
    icon: "♪",
    label: "Musique",
  },
};

function getInterestVisual(activity: Activity): InterestVisual {
  const interestName =
    activity.interest?.name || readableActivityType(activity.activity_type);

  if (INTEREST_VISUALS[interestName]) {
    return INTEREST_VISUALS[interestName];
  }

  if (activity.activity_type === "code_quiz") {
    return INTEREST_VISUALS.Code;
  }

  if (activity.activity_type === "culture_quiz") {
    return INTEREST_VISUALS.Culture;
  }

  if (
    activity.activity_type === "word_learning" ||
    activity.activity_type === "sentence_completion"
  ) {
    return INTEREST_VISUALS.Langues;
  }

  if (activity.activity_type === "melody") {
    return INTEREST_VISUALS.Musique;
  }

  return {
    color: TA.colors.purple,
    softColor: "#F2EDFF",
    icon: "✦",
    label: interestName || "Activité",
  };
}

function readableActivityType(type: string) {
  const labels: Record<string, string> = {
    standard: "Action simple",
    culture_quiz: "Culture",
    code_quiz: "Code",
    word_learning: "Langues",
    sentence_completion: "Langues",
    melody: "Musique",
  };

  return labels[type] || "Activité";
}

function getCompactTitle(activity: Activity) {
  if (activity.activity_type === "code_quiz") {
    return "Quiz code";
  }

  if (activity.activity_type === "culture_quiz") {
    return "Quiz culture générale";
  }

  return activity.name;
}

function getIllustrationSymbol(activity: Activity) {
  if (activity.activity_type === "code_quiz") {
    return "{ }";
  }

  if (activity.activity_type === "culture_quiz") {
    return "📖";
  }

  if (
    activity.activity_type === "word_learning" ||
    activity.activity_type === "sentence_completion"
  ) {
    return "A";
  }

  if (activity.activity_type === "melody") {
    return "♪";
  }

  return "✦";
}

export function ActivityCard({
  activity,
  selectingActivity,
  onSelect,
}: ActivityCardProps) {
  const visual = getInterestVisual(activity);

  return (
    <Pressable
      onPress={() => onSelect(activity)}
      disabled={selectingActivity}
      style={({ pressed }) => ({
        minHeight: 122,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: visual.color,
        backgroundColor: visual.softColor,
        opacity: pressed || selectingActivity ? 0.82 : 1,
        overflow: "hidden",
        transform: [
          {
            translateY: pressed ? 1 : 0,
          },
        ],
        ...TA.shadow.card,
      })}
    >
      <View
        style={{
          position: "absolute",
          right: -26,
          top: -28,
          width: 108,
          height: 108,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.34)",
        }}
      />

      <View
        style={{
          position: "absolute",
          right: -18,
          bottom: -36,
          width: 132,
          height: 132,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.26)",
        }}
      />

      <View
        style={{
          minHeight: 122,
          padding: 14,
          paddingRight: 44,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            width: 86,
            height: 86,
            borderRadius: 26,
            backgroundColor: "rgba(255,255,255,0.72)",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.88)",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 76,
              height: 76,
              borderRadius: 24,
              backgroundColor: visual.color,
              opacity: 0.16,
            }}
          />

          <Text
            style={{
              color: visual.color,
              fontSize: activity.activity_type === "culture_quiz" ? 34 : 24,
              lineHeight: 38,
              fontFamily: TA.fonts.black,
              letterSpacing: -1,
            }}
          >
            {getIllustrationSymbol(activity)}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            gap: 9,
          }}
        >
          <View
            style={{
              alignSelf: "flex-start",
              paddingVertical: 5,
              paddingHorizontal: 11,
              borderRadius: 999,
              backgroundColor: TA.colors.surface,
              borderWidth: 1.5,
              borderColor: visual.color,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
            }}
          >
            <View
              style={{
                width: 21,
                height: 21,
                borderRadius: 999,
                backgroundColor: visual.color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: TA.colors.white,
                  fontSize: 9,
                  fontFamily: TA.fonts.black,
                }}
              >
                {visual.icon}
              </Text>
            </View>

            <Text
              style={{
                color: visual.color,
                fontSize: 12,
                lineHeight: 14,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {visual.label}
            </Text>
          </View>

          <Text
            numberOfLines={2}
            style={{
              color: TA.colors.ink,
              fontSize: 26,
              lineHeight: 27,
              fontFamily: TA.fonts.black,
              letterSpacing: -1,
            }}
          >
            {getCompactTitle(activity)}
          </Text>

          {activity.duration?.label && (
            <Text
              numberOfLines={1}
              style={{
                color: TA.colors.inkMuted,
                fontSize: 12,
                lineHeight: 15,
                fontFamily: TA.fonts.bold,
              }}
            >
              {activity.duration.label}
            </Text>
          )}
        </View>

        <Text
          style={{
            position: "absolute",
            right: 17,
            top: 42,
            color: TA.colors.purple,
            fontSize: 40,
            lineHeight: 42,
            fontFamily: TA.fonts.black,
          }}
        >
          ›
        </Text>
      </View>
    </Pressable>
  );
}
