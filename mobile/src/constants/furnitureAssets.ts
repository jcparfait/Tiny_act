import type { ImageSourcePropType } from "react-native";

export const ROOM_BACKGROUND =
  require("../../assets/images/rooms/empty_room.png");

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
