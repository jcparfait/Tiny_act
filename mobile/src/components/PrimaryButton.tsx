import { Pressable, Text } from "react-native";

import { TA } from "../theme/tinyActTheme";

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
        borderRadius: TA.radius.pill,
        backgroundColor: disabled
          ? "rgba(21, 27, 47, 0.24)"
          : TA.colors.purple,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: disabled
          ? "rgba(21, 27, 47, 0.12)"
          : "rgba(21, 27, 47, 0.18)",
        shadowColor: TA.colors.ink,
        shadowOffset: {
          width: 0,
          height: disabled ? 0 : 7,
        },
        shadowOpacity: disabled ? 0 : 0.14,
        shadowRadius: disabled ? 0 : 12,
        transform: [
          {
            translateY:
              pressed && !disabled ? 2 : 0,
          },
        ],
        opacity:
          pressed && !disabled ? 0.92 : 1,
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: TA.colors.white,
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
