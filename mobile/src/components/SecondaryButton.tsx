import { Pressable, Text } from "react-native";

import { TA } from "../theme/tinyActTheme";

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
        borderRadius: TA.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: TA.colors.borderMedium,
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
            ? TA.colors.inkLight
            : TA.colors.ink,
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
