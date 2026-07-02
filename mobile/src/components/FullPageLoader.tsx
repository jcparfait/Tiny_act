import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

import { TA } from "../theme/tinyActTheme";

type FullPageLoaderProps = {
  title?: string;
  message?: string;
};

export function FullPageLoader({
  title = "Tiny Act",
  message = "Chargement...",
}: FullPageLoaderProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <View
        style={{
          alignItems: "center",
          gap: 14,
        }}
      >
        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 34,
            lineHeight: 38,
            fontFamily: TA.fonts.black,
            letterSpacing: -1,
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        <ActivityIndicator
          color={TA.colors.purple}
          size="large"
        />

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: TA.fonts.bold,
            textAlign: "center",
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
