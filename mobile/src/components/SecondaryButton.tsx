import { Pressable, Text } from "react-native";

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 50,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#F2D7C8",
        opacity:
          disabled || pressed ? 0.62 : 1,
        transform: [
          {
            translateY:
              pressed && !disabled ? 1 : 0,
          },
        ],
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: disabled
            ? "#8E8A9D"
            : "#17152F",
          fontSize: 15,
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
