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
    <View
      style={{
        marginTop: 112,
        gap: 11,
      }}
    >
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
            fontFamily: TA.fonts.black,
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
          fontSize: 42,
          lineHeight: 43,
          fontFamily: TA.fonts.black,
          color: TA.colors.ink,
          letterSpacing: -2.1,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: TA.colors.inkMuted,
          lineHeight: 23,
          fontFamily: TA.fonts.bold,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
