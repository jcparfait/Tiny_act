import { Pressable, Text } from "react-native";

type ChoiceCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoiceCard({ label, selected, onPress }: ChoiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 20,
        borderRadius: 24,
        backgroundColor: selected ? "#17152F" : "#FFFFFF",
        borderWidth: 2,
        borderColor: selected ? "#17152F" : "#F2D7C8",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: selected ? "#FFFFFF" : "#17152F",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
