import { Text, View } from "react-native";

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
        gap: 10,
      }}
    >
      <View
        style={{
          alignSelf: "flex-start",
          paddingVertical: 7,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: "#FFE5DD",
          borderWidth: 1,
          borderColor: "#FFC2B3",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            lineHeight: 14,
            fontWeight: "900",
            color: "#FF4B2B",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {kicker}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 38,
          lineHeight: 43,
          fontWeight: "900",
          color: "#17152F",
          letterSpacing: -0.8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#5D5A70",
          lineHeight: 24,
          fontWeight: "600",
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
