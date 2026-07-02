import {
  Pressable,
  Text,
  View,
} from "react-native";

import { TA } from "../theme/tinyActTheme";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      style={{
        padding: 20,
        borderRadius: TA.radius.card,
        backgroundColor: TA.colors.surface,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        gap: 12,
        ...TA.shadow.soft,
      }}
    >
      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 22,
          lineHeight: 26,
          fontFamily: TA.fonts.black,
          letterSpacing: -0.5,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: TA.colors.inkMuted,
          fontSize: 14,
          lineHeight: 21,
          fontFamily: TA.fonts.bold,
          textAlign: "center",
        }}
      >
        {message}
      </Text>

      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            minHeight: 48,
            borderRadius: TA.radius.pill,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: TA.colors.purple,
            opacity: pressed ? 0.78 : 1,
          })}
        >
          <Text
            style={{
              color: TA.colors.white,
              fontSize: 14,
              lineHeight: 18,
              fontFamily: TA.fonts.black,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
