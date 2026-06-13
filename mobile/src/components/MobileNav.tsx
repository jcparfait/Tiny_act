import { useState } from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import { Link } from "expo-router";

import { useAuth } from "../context/AuthContext";
import { AvatarImage } from "./AvatarPicker";

type MobileNavProps = {
  active: "new" | "history" | "profile";
};

type NavItemProps = {
  href: "/" | "/history" | "/profile";
  label: string;
  isActive: boolean;
};

function NavItem({
  href,
  label,
  isActive,
}: NavItemProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => ({
          flex: 1,
          minHeight: 48,
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isActive
            ? "#FF4B2B"
            : "transparent",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text
          numberOfLines={1}
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

export function MobileNav({
  active,
}: MobileNavProps) {
  const {
    user,
    signOut,
  } = useAuth();

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    if (loggingOut) return;

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
        width: "100%",
        marginTop: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          borderRadius: 28,
          backgroundColor: "#17152F",
          gap: 4,
        }}
      >
        <NavItem
          href="/"
          label="Nouvelle"
          isActive={active === "new"}
        />

        <NavItem
          href="/history"
          label="Historique"
          isActive={active === "history"}
        />

        <NavItem
          href="/profile"
          label="Profil"
          isActive={active === "profile"}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 8,
          gap: 12,
        }}
      >
        <Link href="/profile" asChild>
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <AvatarImage
              avatar={user?.avatar}
              size={42}
            />

            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: "#17152F",
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                {user?.first_name || "Mon profil"}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: "#5D5A70",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {user?.email}
              </Text>
            </View>
          </Pressable>
        </Link>

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => ({
            opacity:
              loggingOut || pressed ? 0.55 : 1,
          })}
        >
          <Text
            style={{
              color: "#FF4B2B",
              fontSize: 13,
              fontWeight: "900",
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
