import { Text, View } from "react-native";

import { TA } from "../theme/tinyActTheme";

type ErrorBoxProps = {
  message: string;
};

function readableError(message: string) {
  if (
    message.includes("Failed to fetch") ||
    message.includes("Network request failed")
  ) {
    return "Impossible de joindre le serveur. Vérifie que Rails est bien lancé.";
  }

  if (
    message.includes("401") ||
    message.toLowerCase().includes("unauthorized")
  ) {
    return "Ta session a expiré. Reconnecte-toi pour continuer.";
  }

  if (
    message.includes("500") ||
    message.toLowerCase().includes("internal server error")
  ) {
    return "Le serveur a rencontré une erreur. Regarde les logs Rails.";
  }

  return message;
}

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
