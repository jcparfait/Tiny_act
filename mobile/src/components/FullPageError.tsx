import {
  Pressable,
  Text,
  View,
} from "react-native";

import { readableError } from "../services/request";
import { TA } from "../theme/tinyActTheme";

type FullPageErrorProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
};

export function FullPageError({
  title = "Connexion impossible",
  message,
  actionLabel = "Réessayer",
  onRetry,
}: FullPageErrorProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 22,
          borderRadius: TA.radius.card,
          backgroundColor: TA.colors.surface,
          borderWidth: 1.5,
          borderColor: TA.colors.borderMedium,
          gap: 14,
          ...TA.shadow.soft,
        }}
      >
        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 26,
            lineHeight: 30,
            fontFamily: TA.fonts.black,
            letterSpacing: -0.7,
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
          {readableError(message)}
        </Text>

        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => ({
              minHeight: 52,
              borderRadius: TA.radius.pill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: TA.colors.purple,
              opacity: pressed ? 0.78 : 1,
              ...TA.shadow.soft,
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
    </View>
  );
}
