import { Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        marginTop: 12,
        padding: 18,
        borderRadius: 999,
        backgroundColor: disabled ? "#C8C4BE" : "#FF4B2B",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
}
