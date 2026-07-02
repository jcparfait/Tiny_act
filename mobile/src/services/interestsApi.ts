import {
  InterestsResponse,
  UpdateInterestsResponse,
} from "../types/tinyAct";

import { getAuthToken } from "./authStorage";
import { fetchWithTimeout } from "./request";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function fetchInterestsJson<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL n'est pas configurée."
    );
  }

  const token = await getAuthToken();

  const response = await fetchWithTimeout(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        Accept: "application/json",
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...((options?.headers || {}) as Record<
          string,
          string
        >),
      },
    }
  );

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

export function loadMobileInterests() {
  return fetchInterestsJson<InterestsResponse>(
    "/api/v1/interests"
  );
}

export function updateMobileInterests(
  interestIds: number[]
) {
  return fetchInterestsJson<UpdateInterestsResponse>(
    "/api/v1/interests",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interest_ids: interestIds,
      }),
    }
  );
}
