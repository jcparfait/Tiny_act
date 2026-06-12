import { useState } from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";

import { useAuth } from "../context/AuthContext";

type MobileNavProps = {
  active: "new" | "history";
};

export function MobileNav({
  active,
}: MobileNavProps) {
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await signOut();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <View
      style={{
        marginTop: 10,
        padding: 10,
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#F2D7C8",
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 8,
        }}
      >
        <Link href="/" asChild>
          <Pressable
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              borderRadius: 16,
              backgroundColor:
                active === "new"
                  ? "#17152F"
                  : "#FFF4EA",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "900",
                color:
                  active === "new"
                    ? "#FFFFFF"
                    : "#17152F",
              }}
            >
              Nouvelle activité
            </Text>
          </Pressable>
        </Link>

        <Link href="/history" asChild>
          <Pressable
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              borderRadius: 16,
              backgroundColor:
                active === "history"
                  ? "#17152F"
                  : "#FFF4EA",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "900",
                color:
                  active === "history"
                    ? "#FFFFFF"
                    : "#17152F",
              }}
            >
              Historique
            </Text>
          </Pressable>
        </Link>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          paddingHorizontal: 6,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            color: "#5D5A70",
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          {user?.email}
        </Text>

        <Pressable
          disabled={loggingOut}
          onPress={handleLogout}
        >
          <Text
            style={{
              color: "#FF4B2B",
              fontWeight: "900",
              opacity: loggingOut ? 0.5 : 1,
            }}
          >
            {loggingOut
              ? "Déconnexion..."
              : "Se déconnecter"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
