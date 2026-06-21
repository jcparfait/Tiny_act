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
  active:
    | "new"
    | "history"
    | "room"
    | "profile";
};

type NavItemProps = {
  href:
    | "/"
    | "/history"
    | "/explore"
    | "/profile";

  label: string;
  icon: string;
  isActive: boolean;
};

function NavItem({
  href,
  label,
  icon,
  isActive,
}: NavItemProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={({ pressed }) => ({
          flex: 1,
          minHeight: 58,
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          backgroundColor: isActive
            ? "#FF4B2B"
            : "transparent",
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 19,
            lineHeight: 20,
            fontWeight: "900",
          }}
        >
          {icon}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: "#FFFFFF",
            fontSize: 11,
            lineHeight: 13,
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
  const { user, signOut } = useAuth();

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
          padding: 8,
          borderRadius: 30,
          backgroundColor: "#17152F",
          borderWidth: 2,
          borderColor: "#242043",
          gap: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <NavItem
            href="/"
            icon="+"
            label="Action"
            isActive={active === "new"}
          />

          <NavItem
            href="/history"
            icon="↺"
            label="Historique"
            isActive={active === "history"}
          />

          <NavItem
            href="/explore"
            icon="⌂"
            label="Salle"
            isActive={active === "room"}
          />

          <NavItem
            href="/profile"
            icon="●"
            label="Profil"
            isActive={active === "profile"}
          />
        </View>
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
              size={38}
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
                {user?.first_name ||
                  "Mon profil"}
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
            minHeight: 38,
            paddingHorizontal: 12,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: "#F2D7C8",
            opacity:
              loggingOut || pressed ? 0.55 : 1,
          })}
        >
          <Text
            style={{
              color: "#FF4B2B",
              fontSize: 12,
              fontWeight: "900",
            }}
          >
            {loggingOut
              ? "..."
              : "Sortir"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
