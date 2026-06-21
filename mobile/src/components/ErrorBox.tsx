import { Text, View } from "react-native";

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
        borderRadius: 20,
        backgroundColor: "#FFE1DD",
        borderWidth: 2,
        borderColor: "#FF9B8F",
        gap: 6,
      }}
    >
      <Text
        style={{
          color: "#B42318",
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
          color: "#7A1B13",
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
