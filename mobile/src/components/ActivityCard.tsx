import { Pressable, Text, View } from "react-native";

import { Image as ExpoImage } from "expo-image";

import { getActivityInterestVisual } from "../constants/activityAssets";
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

function getInterestIcon(activity: Activity) {
  const name =
    activity.interest?.name ||
    readableActivityType(activity.activity_type);

  if (name === "Sport") return "↗";
  if (name === "Langues") return "A";
  if (name === "Créativité") return "✦";
  if (name === "Bien-être") return "◡";
  if (name === "Photo") return "▣";
  if (name === "Dessin") return "✎";
  if (name === "Écriture") return "✎";
  if (name === "Culture") return "▣";
  if (name === "Productivité") return "✓";
  if (name === "Productivite") return "✓";
  if (name === "Code") return "</>";
  if (name === "Musique") return "♪";
  if (name === "Music") return "♪";

  if (activity.activity_type === "code_quiz") return "</>";
  if (activity.activity_type === "culture_quiz") return "▣";
  if (
    activity.activity_type === "word_learning" ||
    activity.activity_type === "sentence_completion"
  ) {
    return "A";
  }
  if (activity.activity_type === "melody") return "♪";

  return "✦";
}

export function ActivityCard({
  activity,
  selectingActivity,
  onSelect,
}: ActivityCardProps) {
  const visual =
    getActivityInterestVisual(activity);

  return (
    <Pressable
      onPress={() => onSelect(activity)}
      disabled={selectingActivity}
      style={({ pressed }) => ({
        height: 132,
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
          right: -28,
          top: -32,
          width: 112,
          height: 112,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.34)",
        }}
      />

      <View
        style={{
          position: "absolute",
          right: -22,
          bottom: -40,
          width: 138,
          height: 138,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.24)",
        }}
      />

      <View
        style={{
          height: 132,
          padding: 14,
          paddingRight: 46,
          flexDirection: "row",
          alignItems: "center",
          gap: 15,
        }}
      >
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 26,
            backgroundColor: "rgba(255,255,255,0.68)",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.86)",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {visual.image ? (
            <ExpoImage
              source={visual.image}
              contentFit="contain"
              style={{
                width: 86,
                height: 86,
              }}
            />
          ) : (
            <Text
              style={{
                color: visual.color,
                fontSize: 28,
                lineHeight: 32,
                fontFamily: TA.fonts.black,
              }}
            >
              ✦
            </Text>
          )}
        </View>

        <View
          style={{
            flex: 1,
            height: 94,
            justifyContent: "center",
            gap: 8,
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
                numberOfLines={1}
                style={{
                  color: TA.colors.white,
                  fontSize: 8,
                  lineHeight: 10,
                  fontFamily: TA.fonts.black,
                }}
              >
                {getInterestIcon(activity)}
              </Text>
            </View>

            <Text
              numberOfLines={1}
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
              fontSize: 25,
              lineHeight: 26,
              fontFamily: TA.fonts.black,
              letterSpacing: -1,
            }}
          >
            {getCompactTitle(activity)}
          </Text>

          <View
            style={{
              height: 15,
              justifyContent: "center",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: TA.colors.inkMuted,
                fontSize: 12,
                lineHeight: 15,
                fontFamily: TA.fonts.bold,
              }}
            >
              {activity.duration?.label ||
                activity.location?.name ||
                ""}
            </Text>
          </View>
        </View>

        <Text
          style={{
            position: "absolute",
            right: 17,
            top: 43,
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
