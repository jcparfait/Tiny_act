import type { ImageSourcePropType } from "react-native";

export const BRAND_LOGO: ImageSourcePropType =
  require("../../assets/images/brand/tiny-act-logo.png");

export const MOOD_MASCOTS: Record<
  string,
  ImageSourcePropType
> = {
  energy:
    require("../../assets/images/mascot/mood-energy.png"),
  bof:
    require("../../assets/images/mascot/mood-bof.png"),
  flat:
    require("../../assets/images/mascot/mood-flat.png"),
};

export function getMoodMascotSource(
  label: string
): ImageSourcePropType | null {
  const normalized = label.toLowerCase();

  if (normalized.includes("forme")) {
    return MOOD_MASCOTS.energy;
  }

  if (
    normalized.includes("bof") ||
    normalized.includes("mitigé")
  ) {
    return MOOD_MASCOTS.bof;
  }

  if (normalized.includes("plat")) {
    return MOOD_MASCOTS.flat;
  }

  return null;
}
