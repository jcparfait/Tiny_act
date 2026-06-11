import { Text, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#FF4B2B" }}>
        Tiny Act
      </Text>

      <Text style={{ fontSize: 36, fontWeight: "900", color: "#17152F" }}>
        {title}
      </Text>

      <Text style={{ fontSize: 16, color: "#5D5A70", lineHeight: 24 }}>
        {subtitle}
      </Text>
    </View>
  );
}
