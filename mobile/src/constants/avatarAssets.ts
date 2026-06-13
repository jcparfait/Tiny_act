import { ImageSourcePropType } from "react-native";

export const AVATAR_NAMES = [
  "avatar_01",
  "avatar_02",
  "avatar_03",
  "avatar_04",
  "avatar_05",
  "avatar_06",
  "avatar_07",
  "avatar_08",
  "avatar_09",
  "avatar_10",
  "avatar_11",
  "avatar_12",
  "avatar_13",
  "avatar_14",
  "avatar_15",
  "avatar_16",
  "avatar_17",
  "avatar_18",
  "avatar_19",
  "avatar_20",
  "avatar_21",
  "avatar_22",
  "avatar_23",
  "avatar_24",
] as const;

export type AvatarName =
  (typeof AVATAR_NAMES)[number];

export const AVATAR_IMAGES: Record<
  AvatarName,
  ImageSourcePropType
> = {
  avatar_01: require("../../assets/images/avatars/avatar_01.png"),
  avatar_02: require("../../assets/images/avatars/avatar_02.png"),
  avatar_03: require("../../assets/images/avatars/avatar_03.png"),
  avatar_04: require("../../assets/images/avatars/avatar_04.png"),
  avatar_05: require("../../assets/images/avatars/avatar_05.png"),
  avatar_06: require("../../assets/images/avatars/avatar_06.png"),
  avatar_07: require("../../assets/images/avatars/avatar_07.png"),
  avatar_08: require("../../assets/images/avatars/avatar_08.png"),
  avatar_09: require("../../assets/images/avatars/avatar_09.png"),
  avatar_10: require("../../assets/images/avatars/avatar_10.png"),
  avatar_11: require("../../assets/images/avatars/avatar_11.png"),
  avatar_12: require("../../assets/images/avatars/avatar_12.png"),
  avatar_13: require("../../assets/images/avatars/avatar_13.png"),
  avatar_14: require("../../assets/images/avatars/avatar_14.png"),
  avatar_15: require("../../assets/images/avatars/avatar_15.png"),
  avatar_16: require("../../assets/images/avatars/avatar_16.png"),
  avatar_17: require("../../assets/images/avatars/avatar_17.png"),
  avatar_18: require("../../assets/images/avatars/avatar_18.png"),
  avatar_19: require("../../assets/images/avatars/avatar_19.png"),
  avatar_20: require("../../assets/images/avatars/avatar_20.png"),
  avatar_21: require("../../assets/images/avatars/avatar_21.png"),
  avatar_22: require("../../assets/images/avatars/avatar_22.png"),
  avatar_23: require("../../assets/images/avatars/avatar_23.png"),
  avatar_24: require("../../assets/images/avatars/avatar_24.png"),
};

export function isAvatarName(
  value: string | null | undefined
): value is AvatarName {
  return (
    typeof value === "string" &&
    AVATAR_NAMES.includes(value as AvatarName)
  );
}

export function getAvatarSource(
  value: string | null | undefined
): ImageSourcePropType {
  const avatarName = isAvatarName(value)
    ? value
    : "avatar_01";

  return AVATAR_IMAGES[avatarName];
}
