import {
  Pressable,
  Text,
  View,
} from "react-native";

import { Image as ExpoImage } from "expo-image";

import {
  AVATAR_IMAGES,
  AVATAR_NAMES,
  AvatarName,
  getAvatarSource,
} from "../constants/avatarAssets";

import { TA } from "../theme/tinyActTheme";

type AvatarPickerProps = {
  selectedAvatar: AvatarName | null;
  onSelect: (avatar: AvatarName) => void;
};

export function AvatarPicker({
  selectedAvatar,
  onSelect,
}: AvatarPickerProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {AVATAR_NAMES.map((avatarName) => {
        const selected =
          selectedAvatar === avatarName;

        return (
          <Pressable
            key={avatarName}
            onPress={() => onSelect(avatarName)}
            accessibilityRole="button"
            accessibilityLabel={`Choisir ${avatarName}`}
            accessibilityState={{
              selected,
            }}
            style={({ pressed }) => ({
              width: 96,
              height: 96,
              padding: 5,
              borderRadius: 34,
              borderWidth: selected ? 4 : 2,
              borderColor: selected
                ? TA.colors.purple
                : TA.colors.borderMedium,
              backgroundColor: TA.colors.surface,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.75 : 1,
              ...TA.shadow.soft,
            })}
          >
            <ExpoImage
              source={AVATAR_IMAGES[avatarName]}
              contentFit="cover"
              style={{
                width: 82,
                height: 82,
                borderRadius: 28,
                backgroundColor: TA.colors.surface,
              }}
            />

            {selected && (
              <View
                style={{
                  position: "absolute",
                  right: -3,
                  bottom: -3,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: TA.colors.purple,
                  borderWidth: 2,
                  borderColor: TA.colors.white,
                }}
              >
                <Text
                  style={{
                    color: TA.colors.white,
                    fontSize: 14,
                    fontFamily: TA.fonts.black,
                  }}
                >
                  ✓
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function AvatarImage({
  avatar,
  size = 48,
}: {
  avatar?: string | null;
  size?: number;
}) {
  return (
    <ExpoImage
      source={getAvatarSource(avatar)}
      contentFit="cover"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: TA.colors.surface,
      }}
    />
  );
}
