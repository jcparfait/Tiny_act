import { Pressable, Text, View } from "react-native";

import { TA } from "../theme/tinyActTheme";

type ChoiceCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function iconForLabel(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("forme")) return "✦";
  if (normalized.includes("bof")) return "≈";
  if (normalized.includes("plat")) return "↓";

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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 18,
        borderRadius: TA.radius.card,
        backgroundColor: selected
          ? TA.colors.ink
          : TA.colors.surface,
        borderWidth: 2,
        borderColor: selected
          ? TA.colors.ink
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
        ...TA.shadow.card,
      })}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: selected
            ? TA.colors.purple
            : TA.colors.goldSoft,
        }}
      >
        <Text
          style={{
            color: selected
              ? TA.colors.white
              : TA.colors.gold,
            fontSize: 22,
            fontWeight: "900",
          }}
        >
          {iconForLabel(label)}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={{
            fontSize: 23,
            lineHeight: 27,
            fontWeight: "900",
            color: selected
              ? TA.colors.white
              : TA.colors.ink,
            letterSpacing: -0.4,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            color: selected
              ? "rgba(255,255,255,0.68)"
              : TA.colors.inkMuted,
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          {selected ? "Sélectionné" : "Toucher pour choisir"}
        </Text>
      </View>

      <Text
        style={{
          color: selected
            ? TA.colors.white
            : TA.colors.inkLight,
          fontSize: 30,
          fontWeight: "900",
        }}
      >
        ›
      </Text>
    </Pressable>
  );
}
