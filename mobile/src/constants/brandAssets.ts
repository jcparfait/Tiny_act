import type { ImageSourcePropType } from "react-native";

export const BRAND_LOGO: ImageSourcePropType =
  require("../../assets/images/brand/tiny-act-logo.png");

export const CHOICE_IMAGES: Record<
  string,
  ImageSourcePropType
> = {
  mood_energy:
    require("../../assets/images/mascot/mood-energy.png"),
  mood_bof:
    require("../../assets/images/mascot/mood-bof.png"),
  mood_flat:
    require("../../assets/images/mascot/mood-flat.png"),

  location_home:
    require("../../assets/images/mascot/location-home.png"),
  location_outdoor:
    require("../../assets/images/mascot/location-outdoor.png"),
  location_transport:
    require("../../assets/images/mascot/location-transport.png"),

  duration_short:
    require("../../assets/images/mascot/duration-short.png"),
  duration_medium:
    require("../../assets/images/mascot/duration-medium.png"),
  duration_long:
    require("../../assets/images/mascot/duration-long.png"),
};

export function getChoiceImageSource(
  label: string
): ImageSourcePropType | null {
  const normalized = label.toLowerCase();

  if (normalized.includes("forme")) {
    return CHOICE_IMAGES.mood_energy;
  }

  if (
    normalized.includes("bof") ||
    normalized.includes("mitigé")
  ) {
    return CHOICE_IMAGES.mood_bof;
  }

  if (
    normalized.includes("plat") ||
    normalized.includes("à plat")
  ) {
    return CHOICE_IMAGES.mood_flat;
  }

  if (
    normalized.includes("maison") ||
    normalized.includes("chez")
  ) {
    return CHOICE_IMAGES.location_home;
  }

  if (
    normalized.includes("extérieur") ||
    normalized.includes("dehors")
  ) {
    return CHOICE_IMAGES.location_outdoor;
  }

  if (
    normalized.includes("transport") ||
    normalized.includes("bureau")
  ) {
    return CHOICE_IMAGES.location_transport;
  }

  if (normalized.includes("5")) {
    return CHOICE_IMAGES.duration_short;
  }

  if (normalized.includes("15")) {
    return CHOICE_IMAGES.duration_medium;
  }

  if (normalized.includes("30")) {
    return CHOICE_IMAGES.duration_long;
  }

  return null;
}

export function getChoiceColor(label: string) {
  const normalized = label.toLowerCase();

  if (
    normalized.includes("forme") ||
    normalized.includes("maison") ||
    normalized.includes("5")
  ) {
    return {
      border: "#92BD73",
      bg: "#F3FAEE",
    };
  }

  if (
    normalized.includes("bof") ||
    normalized.includes("extérieur") ||
    normalized.includes("15")
  ) {
    return {
      border: "#E7C74F",
      bg: "#FFF9E8",
    };
  }

  if (
    normalized.includes("plat") ||
    normalized.includes("transport") ||
    normalized.includes("30")
  ) {
    return {
      border: "#8FC7F2",
      bg: "#F1F9FF",
    };
  }

  return {
    border: "rgba(90, 74, 54, 0.16)",
    bg: "#FFFDF9",
  };
}
