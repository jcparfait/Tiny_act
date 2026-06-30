import type { ImageSourcePropType } from "react-native";

export type RoomBackgroundKey =
  | "cozy"
  | "sport"
  | "musique"
  | "atelier"
  | "premium";

export type RoomBackgroundOption = {
  key: RoomBackgroundKey;
  name: string;
  required_xp: number;
  image_key: string;
};

export const DEFAULT_ROOM_BACKGROUND_KEY: RoomBackgroundKey =
  "cozy";

export const ROOM_BACKGROUNDS: RoomBackgroundOption[] = [
  {
    key: "cozy",
    name: "Cozy",
    required_xp: 0,
    image_key: "rooms/Room_cozy.png",
  },
  {
    key: "sport",
    name: "Sport",
    required_xp: 500,
    image_key: "rooms/Room_sport.png",
  },
  {
    key: "musique",
    name: "Musique",
    required_xp: 1000,
    image_key: "rooms/Room_musique.png",
  },
  {
    key: "atelier",
    name: "Atelier",
    required_xp: 2000,
    image_key: "rooms/Room_atelier.png",
  },
  {
    key: "premium",
    name: "Premium",
    required_xp: 3500,
    image_key: "rooms/Room_premium.png",
  },
];

const ROOM_BACKGROUND_IMAGES: Record<
  string,
  ImageSourcePropType
> = {
  cozy: require("../../assets/images/rooms/Room_cozy.png"),
  sport: require("../../assets/images/rooms/Room_sport.png"),
  musique: require("../../assets/images/rooms/Room_musique.png"),
  atelier: require("../../assets/images/rooms/Room_atelier.png"),
  premium: require("../../assets/images/rooms/Room_premium.png"),

  "rooms/Room_cozy.png": require("../../assets/images/rooms/Room_cozy.png"),
  "rooms/Room_sport.png": require("../../assets/images/rooms/Room_sport.png"),
  "rooms/Room_musique.png": require("../../assets/images/rooms/Room_musique.png"),
  "rooms/Room_atelier.png": require("../../assets/images/rooms/Room_atelier.png"),
  "rooms/Room_premium.png": require("../../assets/images/rooms/Room_premium.png"),
};

export const ROOM_BACKGROUND =
  ROOM_BACKGROUND_IMAGES[DEFAULT_ROOM_BACKGROUND_KEY];

export function getRoomBackgroundSource(
  backgroundKey?: string | null
): ImageSourcePropType {
  return (
    ROOM_BACKGROUND_IMAGES[
      backgroundKey || DEFAULT_ROOM_BACKGROUND_KEY
    ] || ROOM_BACKGROUND
  );
}

const BOOKS =
  require("../../assets/images/furnitures/books.png");

const VINYL =
  require("../../assets/images/furnitures/Meublvynil.png");

const FURNITURE_IMAGES: Record<
  string,
  ImageSourcePropType
> = {
  "furnitures/books.png": BOOKS,
  "furnitures/Biblio.png":
    require("../../assets/images/furnitures/Biblio.png"),
  "furnitures/Dino.png":
    require("../../assets/images/furnitures/Dino.png"),

  "furnitures/sport_mat.png":
    require("../../assets/images/furnitures/sport_mat.png"),
  "furnitures/punching_ball.png":
    require("../../assets/images/furnitures/punching_ball.png"),
  "furnitures/Escalade.png":
    require("../../assets/images/furnitures/Escalade.png"),

  "furnitures/chair.png":
    require("../../assets/images/furnitures/chair.png"),
  "furnitures/Canap.png":
    require("../../assets/images/furnitures/Canap.png"),
  "furnitures/Bed.png":
    require("../../assets/images/furnitures/Bed.png"),

  "furnitures/Coussin.png":
    require("../../assets/images/furnitures/Coussin.png"),
  "furnitures/pool.png":
    require("../../assets/images/furnitures/pool.png"),
  "furnitures/jasky.gif":
    require("../../assets/images/furnitures/jasky.gif"),

  "furnitures/Sacados.png":
    require("../../assets/images/furnitures/Sacados.png"),
  "furnitures/Travelshelf.png":
    require("../../assets/images/furnitures/Travelshelf.png"),
  "furnitures/Camping van.png":
    require("../../assets/images/furnitures/Camping van.png"),

  "furnitures/Chaisebureau.png":
    require("../../assets/images/furnitures/Chaisebureau.png"),
  "furnitures/Bureau.png":
    require("../../assets/images/furnitures/Bureau.png"),
  "furnitures/Wagonrails.gif":
    require("../../assets/images/furnitures/Wagonrails.gif"),

  "furnitures/Pots.png":
    require("../../assets/images/furnitures/Pots.png"),
  "furnitures/Tablo.png":
    require("../../assets/images/furnitures/Tablo.png"),
  "furnitures/Joconde.png":
    require("../../assets/images/furnitures/Joconde.png"),

  "furnitures/Polaroids.png":
    require("../../assets/images/furnitures/Polaroids.png"),
  "furnitures/Photo.png":
    require("../../assets/images/furnitures/Photo.png"),
  "furnitures/Fondphoto.png":
    require("../../assets/images/furnitures/Fondphoto.png"),

  "furnitures/Guitare.png":
    require("../../assets/images/furnitures/Guitare.png"),

  "furnitures/Meublvynil.png": VINYL,

  // Compatibilité avec la valeur actuellement
  // enregistrée par l’ancien seed.
  "furnitures/Meuble vanille.png": VINYL,

  "furnitures/Piano.png":
    require("../../assets/images/furnitures/Piano.png"),
};

export function getFurnitureSource(
  imageKey: string
): ImageSourcePropType {
  return FURNITURE_IMAGES[imageKey] || BOOKS;
}
