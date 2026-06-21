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
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        marginTop: 12,
        minHeight: 58,
        paddingVertical: 17,
        paddingHorizontal: 22,
        borderRadius: 999,
        backgroundColor: disabled
          ? "#C8C4BE"
          : "#FF4B2B",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: disabled
          ? "#B8B2AA"
          : "#17152F",
        shadowColor: "#17152F",
        shadowOffset: {
          width: 0,
          height: disabled ? 0 : 5,
        },
        shadowOpacity: disabled ? 0 : 0.16,
        shadowRadius: disabled ? 0 : 10,
        transform: [
          {
            translateY:
              pressed && !disabled ? 2 : 0,
          },
        ],
        opacity: pressed && !disabled ? 0.92 : 1,
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: "#FFFFFF",
          fontSize: 17,
          fontWeight: "900",
          textAlign: "center",
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
