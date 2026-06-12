import { Link } from "expo-router";
import { Text, View } from "react-native";

type MobileNavProps = {
  active: "new" | "history";
};

export function MobileNav({ active }: MobileNavProps) {
  return (
    <View
      style={{
        marginTop: 8,
        padding: 8,
        borderRadius: 999,
        backgroundColor: "#17152F",
        flexDirection: "row",
        gap: 8,
      }}
    >
      <Link
        href="/"
        style={{
          flex: 1,
          textAlign: "center",
          paddingVertical: 12,
          borderRadius: 999,
          backgroundColor: active === "new" ? "#FF4B2B" : "transparent",
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: "900",
          overflow: "hidden",
        }}
      >
        Nouvelle
      </Link>

      <Link
        href="/history"
        style={{
          flex: 1,
          textAlign: "center",
          paddingVertical: 12,
          borderRadius: 999,
          backgroundColor: active === "history" ? "#FF4B2B" : "transparent",
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: "900",
          overflow: "hidden",
        }}
      >
        Historique
      </Link>
    </View>
  );
}
