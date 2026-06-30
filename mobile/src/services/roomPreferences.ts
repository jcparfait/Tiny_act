import { Platform } from "react-native";

import * as SecureStore from "expo-secure-store";

import {
  DEFAULT_ROOM_BACKGROUND_KEY,
  ROOM_BACKGROUNDS,
  type RoomBackgroundKey,
} from "../constants/furnitureAssets";

const SELECTED_ROOM_BACKGROUND_KEY =
  "tiny_act_selected_room_background";

function isRoomBackgroundKey(
  value: string | null
): value is RoomBackgroundKey {
  return ROOM_BACKGROUNDS.some(
    (background) => background.key === value
  );
}

export async function loadSelectedRoomBackgroundKey(): Promise<RoomBackgroundKey | null> {
  let storedValue: string | null = null;

  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") {
        return null;
      }

      storedValue = localStorage.getItem(
        SELECTED_ROOM_BACKGROUND_KEY
      );
    } catch {
      return null;
    }
  } else {
    storedValue = await SecureStore.getItemAsync(
      SELECTED_ROOM_BACKGROUND_KEY
    );
  }

  return isRoomBackgroundKey(storedValue)
    ? storedValue
    : null;
}

export async function saveSelectedRoomBackgroundKey(
  backgroundKey: RoomBackgroundKey
): Promise<void> {
  const safeBackgroundKey = isRoomBackgroundKey(
    backgroundKey
  )
    ? backgroundKey
    : DEFAULT_ROOM_BACKGROUND_KEY;

  if (Platform.OS === "web") {
    localStorage.setItem(
      SELECTED_ROOM_BACKGROUND_KEY,
      safeBackgroundKey
    );

    return;
  }

  await SecureStore.setItemAsync(
    SELECTED_ROOM_BACKGROUND_KEY,
    safeBackgroundKey
  );
}
