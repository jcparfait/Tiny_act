import { Text, View } from "react-native";

import { TA } from "../theme/tinyActTheme";

type ScreenHeaderProps = {
  title: string;
  subtitle: string;
  kicker?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  kicker = "Tiny Act",
}: ScreenHeaderProps) {
  return (
    <View style={{ gap: 11 }}>
      <View
        style={{
          alignSelf: "flex-start",
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: TA.radius.pill,
          backgroundColor: TA.colors.purpleSoft,
          borderWidth: 1,
          borderColor: "rgba(124, 99, 242, 0.22)",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            lineHeight: 14,
            fontWeight: "900",
            color: TA.colors.purple,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {kicker}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 40,
          lineHeight: 43,
          fontWeight: "900",
          color: TA.colors.ink,
          letterSpacing: -1.4,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: TA.colors.inkMuted,
          lineHeight: 23,
          fontWeight: "700",
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
