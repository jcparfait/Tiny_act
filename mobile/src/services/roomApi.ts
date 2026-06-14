import {
  RoomFurnitureResponse,
  RoomResponse,
} from "../types/tinyAct";

import { getAuthToken } from "./authStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function roomFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL n'est pas configurée."
    );
  }

  const token = await getAuthToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...((options?.headers || {}) as Record<
        string,
        string
      >),
    },
  });

  const text = await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Rails n'a pas renvoyé du JSON. Status ${response.status}.`
      );
    }
  }

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `Erreur API : ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export function loadRoom(): Promise<RoomResponse> {
  return roomFetch<RoomResponse>(
    "/api/v1/room"
  );
}

export function placeFurniture(
  furnitureId: number
): Promise<RoomFurnitureResponse> {
  return roomFetch<RoomFurnitureResponse>(
    "/api/v1/room/furnitures",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        furniture_id: furnitureId,
      }),
    }
  );
}

export function moveRoomFurniture(
  roomFurnitureId: number,
  x: number,
  y: number
): Promise<RoomFurnitureResponse> {
  return roomFetch<RoomFurnitureResponse>(
    `/api/v1/room/furnitures/${roomFurnitureId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_furniture: {
          x,
          y,
        },
      }),
    }
  );
}

export function deleteRoomFurniture(
  roomFurnitureId: number
): Promise<void> {
  return roomFetch<void>(
    `/api/v1/room/furnitures/${roomFurnitureId}`,
    {
      method: "DELETE",
    }
  );
}
