import {
  CreateActivitySessionPayload,
  CreateActivitySessionResponse,
  Duration,
  InitialDataResponse,
  Location,
  Mood,
  SelectActivityResponse,
} from "../types/tinyAct";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data && typeof data.error === "string"
        ? data.error
        : `Erreur API : ${response.status}`;

    throw new Error(errorMessage);
  }

  return data as T;
}

export async function loadInitialData(): Promise<InitialDataResponse> {
  const [moods, locations, durations] = await Promise.all([
    fetchJson<Mood[]>(`${API_URL}/api/v1/moods`),
    fetchJson<Location[]>(`${API_URL}/api/v1/locations`),
    fetchJson<Duration[]>(`${API_URL}/api/v1/durations`),
  ]);

  return {
    moods,
    locations,
    durations,
  };
}

export async function createActivitySession(
  payload: CreateActivitySessionPayload
): Promise<CreateActivitySessionResponse> {
  return fetchJson<CreateActivitySessionResponse>(
    `${API_URL}/api/v1/activity_sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activity_session: payload,
      }),
    }
  );
}

export async function selectActivity(
  activitySessionId: number,
  activityId: number
): Promise<SelectActivityResponse> {
  return fetchJson<SelectActivityResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/select_activity`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activity_id: activityId,
      }),
    }
  );
}
