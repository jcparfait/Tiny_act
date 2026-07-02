import { Text, View } from "react-native";

import { readableError } from "../services/request";
import { TA } from "../theme/tinyActTheme";

type ErrorBoxProps = {
  message: string;
};

export function ErrorBox({
  message,
}: ErrorBoxProps) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: TA.radius.medium,
        backgroundColor: TA.colors.dangerBg,
        borderWidth: 2,
        borderColor: TA.colors.dangerBorder,
        gap: 6,
      }}
    >
      <Text
        style={{
          color: TA.colors.dangerText,
          fontSize: 12,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        Erreur
      </Text>

      <Text
        style={{
          color: TA.colors.dangerText,
          fontSize: 15,
          lineHeight: 22,
          fontWeight: "800",
        }}
      >
        {readableError(message)}
      </Text>
    </View>
  );
}
