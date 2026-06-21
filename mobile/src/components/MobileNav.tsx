import { useEffect, useState } from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import { Image as ExpoImage } from "expo-image";
import { Link } from "expo-router";

import { BRAND_LOGO } from "../constants/brandAssets";
import { useAuth } from "../context/AuthContext";
import { loadRoom } from "../services/roomApi";
import { TA } from "../theme/tinyActTheme";

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
          minHeight: 56,
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          backgroundColor: isActive
            ? TA.colors.purple
            : "transparent",
          opacity: pressed ? 0.76 : 1,
        })}
      >
        <Text
          style={{
            color: TA.colors.white,
            fontSize: 18,
            lineHeight: 20,
            fontFamily: TA.fonts.black,
          }}
        >
          {icon}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: TA.colors.white,
            fontSize: 10,
            lineHeight: 12,
            fontFamily: TA.fonts.black,
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

  const [totalXp, setTotalXp] =
    useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadRoom()
      .then((roomData) => {
        if (!cancelled) {
          setTotalXp(roomData.total_xp);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTotalXp(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
    <>
      <View
        style={{
          position: "fixed" as never,
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          alignItems: "center",
          paddingTop: 18,
          paddingHorizontal: 18,
          pointerEvents: "box-none" as never,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 430,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Link href="/" asChild>
            <Pressable
              style={({ pressed }) => ({
                width: 118,
                height: 61,
                opacity: pressed ? 0.74 : 1,
              })}
            >
              <ExpoImage
                source={BRAND_LOGO}
                contentFit="contain"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Pressable>
          </Link>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Link href="/history" asChild>
              <Pressable
                style={({ pressed }) => ({
                  height: 48,
                  minWidth: 94,
                  paddingHorizontal: 17,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: TA.colors.borderDark,
                  backgroundColor: TA.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.76 : 1,
                  shadowColor: "#071027",
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.16,
                  shadowRadius: 8,
                })}
              >
                <Text
                  style={{
                    color: TA.colors.ink,
                    fontSize: 18,
                    lineHeight: 19,
                    fontFamily: TA.fonts.black,
                    letterSpacing: -0.6,
                  }}
                >
                  {totalXp ?? 0}
                </Text>

                <Text
                  style={{
                    color: TA.colors.inkLight,
                    fontSize: 11,
                    lineHeight: 12,
                    fontFamily: TA.fonts.black,
                    letterSpacing: 1,
                  }}
                >
                  XP
                </Text>
              </Pressable>
            </Link>

            <Link href="/profile" asChild>
              <Pressable
                style={({ pressed }) => ({
                  width: 68,
                  height: 68,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: TA.colors.borderDark,
                  backgroundColor: TA.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.76 : 1,
                  shadowColor: "#071027",
                  shadowOffset: {
                    width: 0,
                    height: 5,
                  },
                  shadowOpacity: 0.16,
                  shadowRadius: 8,
                })}
              >
                <AvatarImage
                  avatar={user?.avatar}
                  size={58}
                />
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

      <View
        style={{
          position: "fixed" as never,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 16,
          pointerEvents: "box-none" as never,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 430,
            padding: 8,
            borderRadius: 30,
            backgroundColor: TA.colors.ink,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.12)",
            shadowColor: "#071027",
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.18,
            shadowRadius: 18,
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

        <Pressable
          onPress={handleLogout}
          disabled={loggingOut}
          style={({ pressed }) => ({
            marginTop: 8,
            paddingVertical: 7,
            paddingHorizontal: 12,
            borderRadius: TA.radius.pill,
            backgroundColor: TA.colors.surface,
            borderWidth: 1,
            borderColor: TA.colors.borderMedium,
            opacity:
              loggingOut || pressed ? 0.54 : 1,
          })}
        >
          <Text
            style={{
              color: TA.colors.inkMuted,
              fontSize: 11,
              fontFamily: TA.fonts.black,
            }}
          >
            {loggingOut
              ? "Déconnexion..."
              : "Se déconnecter"}
          </Text>
        </Pressable>
      </View>

      <View
        pointerEvents="none"
        style={{
          height: 128,
        }}
      />
    </>
  );
}
