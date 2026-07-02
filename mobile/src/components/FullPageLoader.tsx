import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

import { TA } from "../theme/tinyActTheme";

type FullPageLoaderProps = {
  message?: string;
};

export function FullPageLoader({
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
        <ActivityIndicator
          color={TA.colors.purple}
          size="large"
        />

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 14,
            lineHeight: 20,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
