import { Pressable, Text } from "react-native";

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 16,
        borderRadius: 999,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#17152F", fontSize: 16, fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
