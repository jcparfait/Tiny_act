import { useEffect, useState } from "react";

import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import { Image as ExpoImage } from "expo-image";
import { Link } from "expo-router";

import { BRAND_LOGO } from "../constants/brandAssets";
import { getAvatarSource } from "../constants/avatarAssets";
import { useAuth } from "../context/AuthContext";
import { loadRoom } from "../services/roomApi";
import { TA } from "../theme/tinyActTheme";

type MobileNavProps = {
  active:
    | "new"
    | "history"
    | "room"
    | "profile";
  onLogoPress?: () => void;
  hideXp?: boolean;
};

export function MobileNav({
  active: _active,
  onLogoPress,
  hideXp = false,
}: MobileNavProps) {
  const { user } = useAuth();

  const [totalXp, setTotalXp] =
    useState<number | null>(null);

  useEffect(() => {
    if (hideXp) return;

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
  }, [hideXp]);

  const logoButton = (
    <Pressable
      hitSlop={12}
      onPress={onLogoPress}
      style={({ pressed }) => ({
        width: 148,
        height: 82,
        alignItems: "flex-start",
        justifyContent: "center",
        opacity: pressed ? 0.74 : 1,
      })}
    >
      <Image
        source={BRAND_LOGO}
        resizeMode="contain"
        style={{
          width: 148,
          height: 82,
        }}
      />
    </Pressable>
  );

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 36,
        left: 18,
        right: 18,
        zIndex: 100,
        alignItems: "center",
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
        {onLogoPress ? (
          logoButton
        ) : (
          <Link href="/" asChild>
            {logoButton}
          </Link>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingTop: 6,
          }}
        >
          {!hideXp && (
            <Link href="/history" asChild>
              <Pressable
                style={({ pressed }) => ({
                  height: 50,
                  minWidth: 104,
                  paddingHorizontal: 17,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: TA.colors.borderDark,
                  backgroundColor: TA.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.76 : 1,
                  ...TA.shadow.webCard,
                })}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: 7,
                  }}
                >
                  <Text
                    style={{
                      color: TA.colors.ink,
                      fontSize: 19,
                      lineHeight: 22,
                      fontFamily: TA.fonts.black,
                      letterSpacing: -0.6,
                    }}
                  >
                    {totalXp ?? 0}
                  </Text>

                  <Text
                    style={{
                      color: TA.colors.inkLight,
                      fontSize: 13,
                      lineHeight: 16,
                      fontFamily: TA.fonts.black,
                      letterSpacing: 1,
                    }}
                  >
                    XP
                  </Text>
                </View>
              </Pressable>
            </Link>
          )}

          <Link href="/profile" asChild>
            <Pressable
              style={({ pressed }) => ({
                width: 68,
                height: 68,
                borderRadius: 999,
                backgroundColor: "#25272E",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.76 : 1,
                ...TA.shadow.webCard,
              })}
            >
              <View
                style={{
                  width: 63,
                  height: 63,
                  borderRadius: 999,
                  overflow: "hidden",
                  backgroundColor: "#25272E",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExpoImage
                  source={getAvatarSource(user?.avatar)}
                  contentFit="cover"
                  style={{
                    width: 87,
                    height: 87,
                  }}
                />
              </View>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
