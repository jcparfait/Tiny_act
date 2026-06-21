import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  AVATAR_IMAGES,
  AVATAR_NAMES,
  AvatarName,
  getAvatarSource,
} from "../constants/avatarAssets";

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
              width: 82,
              height: 82,
              padding: 4,
              borderRadius: 41,
              borderWidth: selected ? 4 : 2,
              borderColor: selected
                ? "#7C63F2"
                : "rgba(90, 74, 54, 0.16)",
              backgroundColor: selected
                ? "#FFF0EB"
                : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Image
              source={AVATAR_IMAGES[avatarName]}
              resizeMode="cover"
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
              }}
            />

            {selected && (
              <View
                style={{
                  position: "absolute",
                  right: -2,
                  bottom: -2,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#7C63F2",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "900",
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
    <Image
      source={getAvatarSource(avatar)}
      resizeMode="cover"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#FFF0EB",
      }}
    />
  );
}
