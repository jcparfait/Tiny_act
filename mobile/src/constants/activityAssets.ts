import type { ImageSourcePropType } from "react-native";

import { Activity } from "../types/tinyAct";

export type ActivityInterestVisual = {
  label: string;
  color: string;
  softColor: string;
  image: ImageSourcePropType | null;
};

const ACTIVITY_IMAGES: Record<string, ImageSourcePropType> = {
  Sport:
    require("../../assets/images/mascot/activities/sport.png"),

  Langues:
    require("../../assets/images/mascot/activities/langues.png"),

  Créativité:
    require("../../assets/images/mascot/activities/creativite.png"),

  "Bien-être":
    require("../../assets/images/mascot/activities/bien_etre.png"),

  Photo:
    require("../../assets/images/mascot/activities/photo.png"),

  Dessin:
    require("../../assets/images/mascot/activities/dessin.png"),

  Écriture:
    require("../../assets/images/mascot/activities/ecriture.png"),

  Culture:
    require("../../assets/images/mascot/activities/culture.png"),

  Productivité:
    require("../../assets/images/mascot/activities/productivite.png"),

  Productivite:
    require("../../assets/images/mascot/activities/productivite.png"),

  Code:
    require("../../assets/images/mascot/activities/code.png"),

  Musique:
    require("../../assets/images/mascot/activities/musique.png"),

  Music:
    require("../../assets/images/mascot/activities/musique.png"),
};

const INTEREST_VISUALS: Record<
  string,
  ActivityInterestVisual
> = {
  Sport: {
    label: "Sport",
    color: "#92BD73",
    softColor: "#F0FAEA",
    image: ACTIVITY_IMAGES.Sport,
  },

  Langues: {
    label: "Langues",
    color: "#7C63F2",
    softColor: "#F2EDFF",
    image: ACTIVITY_IMAGES.Langues,
  },

  Créativité: {
    label: "Créativité",
    color: "#F58AB7",
    softColor: "#FFF0F7",
    image: ACTIVITY_IMAGES.Créativité,
  },

  "Bien-être": {
    label: "Bien-être",
    color: "#8FC7F2",
    softColor: "#F1F9FF",
    image: ACTIVITY_IMAGES["Bien-être"],
  },

  Photo: {
    label: "Photo",
    color: "#F58AB7",
    softColor: "#FFF0F7",
    image: ACTIVITY_IMAGES.Photo,
  },

  Dessin: {
    label: "Dessin",
    color: "#8AD6C9",
    softColor: "#EFFBF9",
    image: ACTIVITY_IMAGES.Dessin,
  },

  Écriture: {
    label: "Écriture",
    color: "#E5B84D",
    softColor: "#FFF7DC",
    image: ACTIVITY_IMAGES.Écriture,
  },

  Culture: {
    label: "Culture",
    color: "#F19B8D",
    softColor: "#FFF0EC",
    image: ACTIVITY_IMAGES.Culture,
  },

  Productivité: {
    label: "Productivité",
    color: "#E5B84D",
    softColor: "#FFF7DC",
    image: ACTIVITY_IMAGES.Productivité,
  },

  Productivite: {
    label: "Productivité",
    color: "#E5B84D",
    softColor: "#FFF7DC",
    image: ACTIVITY_IMAGES.Productivite,
  },

  Code: {
    label: "Code",
    color: "#8DB5FF",
    softColor: "#EEF5FF",
    image: ACTIVITY_IMAGES.Code,
  },

  Musique: {
    label: "Musique",
    color: "#F39A20",
    softColor: "#FFF4E4",
    image: ACTIVITY_IMAGES.Musique,
  },

  Music: {
    label: "Musique",
    color: "#F39A20",
    softColor: "#FFF4E4",
    image: ACTIVITY_IMAGES.Music,
  },
};

function fallbackInterestName(activity: Activity) {
  if (activity.activity_type === "code_quiz") {
    return "Code";
  }

  if (activity.activity_type === "culture_quiz") {
    return "Culture";
  }

  if (
    activity.activity_type === "word_learning" ||
    activity.activity_type === "sentence_completion"
  ) {
    return "Langues";
  }

  if (activity.activity_type === "melody") {
    return "Musique";
  }

  return "Activité";
}

export function getActivityInterestVisual(
  activity: Activity
): ActivityInterestVisual {
  const interestName =
    activity.interest?.name ||
    fallbackInterestName(activity);

  const knownVisual =
    INTEREST_VISUALS[interestName];

  if (knownVisual) {
    return knownVisual;
  }

  return {
    label: interestName,
    color: "#7C63F2",
    softColor: "#F2EDFF",
    image: null,
  };
}
