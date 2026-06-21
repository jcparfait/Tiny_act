import { Pressable, Text, View } from "react-native";

import { Image as ExpoImage } from "expo-image";

import { getMoodMascotSource } from "../constants/brandAssets";
import { TA } from "../theme/tinyActTheme";

type ChoiceCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function fallbackIconForLabel(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("maison")) return "⌂";
  if (normalized.includes("extérieur")) return "↗";
  if (normalized.includes("transport")) return "→";
  if (normalized.includes("n'importe")) return "◎";

  if (normalized.includes("5")) return "5";
  if (normalized.includes("15")) return "15";
  if (normalized.includes("30")) return "30";

  return "•";
}

export function ChoiceCard({
  label,
  selected,
  onPress,
}: ChoiceCardProps) {
  const mascotSource =
    getMoodMascotSource(label);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: mascotSource ? 116 : 92,
        padding: mascotSource ? 14 : 18,
        borderRadius: 30,
        backgroundColor: selected
          ? TA.colors.surface
          : TA.colors.surface,
        borderWidth: 1,
        borderColor: selected
          ? TA.colors.borderDark
          : TA.colors.borderMedium,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        opacity: pressed ? 0.86 : 1,
        transform: [
          {
            translateY: pressed ? 1 : 0,
          },
        ],
        shadowColor: "#071027",
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      })}
    >
      <View
        style={{
          width: mascotSource ? 88 : 58,
          height: mascotSource ? 88 : 58,
          borderRadius: mascotSource ? 26 : 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: selected
            ? TA.colors.purpleSoft
            : TA.colors.goldSoft,
          overflow: "hidden",
        }}
      >
        {mascotSource ? (
          <ExpoImage
            source={mascotSource}
            contentFit="contain"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <Text
            style={{
              color: selected
                ? TA.colors.purple
                : TA.colors.gold,
              fontSize: 23,
              fontFamily: TA.fonts.black,
            }}
          >
            {fallbackIconForLabel(label)}
          </Text>
        )}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            fontSize: 24,
            lineHeight: 27,
            fontFamily: TA.fonts.black,
            color: TA.colors.ink,
            letterSpacing: -0.8,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            color: selected
              ? TA.colors.purple
              : TA.colors.inkMuted,
            fontSize: 13,
            fontFamily: TA.fonts.bold,
          }}
        >
          {selected ? "Sélectionné" : "Toucher pour choisir"}
        </Text>
      </View>

      <Text
        style={{
          color: selected
            ? TA.colors.purple
            : TA.colors.inkLight,
          fontSize: 34,
          fontFamily: TA.fonts.black,
        }}
      >
        ›
      </Text>
    </Pressable>
  );
}
