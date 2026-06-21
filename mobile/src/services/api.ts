import {
  ActivityProgressData,
  ActivityProgressResponse,
  ActivityReward,
  ActivitySessionDetailsResponse,
  ActivitySessionSummary,
  CreateActivitySessionPayload,
  CreateActivitySessionResponse,
  CurrentUserResponse,
  Duration,
  FinishActivitySessionResponse,
  InitialDataResponse,
  Location,
  LoginResponse,
  Mood,
  PauseActivitySessionResponse,
  ResumeActivitySessionResponse,
  SelectActivityResponse,
  StartActivitySessionResponse,
} from "../types/tinyAct";

import { getAuthToken } from "./authStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options?.headers || {}) as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data: unknown = null;

  if (text.length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      const preview = text
        .slice(0, 160)
        .replace(/\s+/g, " ");

      throw new Error(
        `Rails n'a pas renvoyé du JSON. Status ${response.status}. URL appelée : ${url}. Début de réponse : ${preview}`
      );
    }
  }

  if (!response.ok) {
    const errorMessage =
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `Erreur API : ${response.status}`;

    throw new Error(errorMessage);
  }

  return data as T;
}

export async function loginMobile(
  email: string,
  password: string
): Promise<LoginResponse> {
  return fetchJson<LoginResponse>(
    `${API_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );
}

export async function loadCurrentUser(): Promise<
  CurrentUserResponse
> {
  return fetchJson<CurrentUserResponse>(
    `${API_URL}/api/v1/auth/me`
  );
}

export async function logoutMobile(): Promise<void> {
  return fetchJson<void>(
    `${API_URL}/api/v1/auth/logout`,
    {
      method: "DELETE",
    }
  );
}

export async function loadInitialData(): Promise<
  InitialDataResponse
> {
  const [moods, locations, durations] =
    await Promise.all([
      fetchJson<Mood[]>(`${API_URL}/api/v1/moods`),
      fetchJson<Location[]>(
        `${API_URL}/api/v1/locations`
      ),
      fetchJson<Duration[]>(
        `${API_URL}/api/v1/durations`
      ),
    ]);

  return {
    moods,
    locations,
    durations,
  };
}

export async function loadActivitySessions(): Promise<
  ActivitySessionSummary[]
> {
  return fetchJson<ActivitySessionSummary[]>(
    `${API_URL}/api/v1/activity_sessions`
  );
}

export async function loadActivitySession(
  activitySessionId: number
): Promise<ActivitySessionDetailsResponse> {
  return fetchJson<ActivitySessionDetailsResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}`
  );
}

export async function loadActivityProgress(
  activitySessionId: number
): Promise<ActivityProgressResponse> {
  return fetchJson<ActivityProgressResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/progress`
  );
}

export async function saveActivityProgress(
  activitySessionId: number,
  progressData: ActivityProgressData
): Promise<ActivityProgressResponse> {
  return fetchJson<ActivityProgressResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/progress`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        progress_data: progressData,
      }),
    }
  );
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

export async function startActivitySession(
  activitySessionId: number
): Promise<StartActivitySessionResponse> {
  return fetchJson<StartActivitySessionResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/start`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );
}

export async function pauseActivitySession(
  activitySessionId: number,
  elapsedSeconds: number
): Promise<PauseActivitySessionResponse> {
  return fetchJson<PauseActivitySessionResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/pause`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        elapsed_seconds: elapsedSeconds,
      }),
    }
  );
}

export async function resumeActivitySession(
  activitySessionId: number
): Promise<ResumeActivitySessionResponse> {
  return fetchJson<ResumeActivitySessionResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/resume`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );
}

export async function finishActivitySession(
  activitySessionId: number,
  elapsedSeconds: number
): Promise<FinishActivitySessionResponse> {
  return fetchJson<FinishActivitySessionResponse>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/finish`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        elapsed_seconds: elapsedSeconds,
      }),
    }
  );
}

export async function loadActivityReward(
  activitySessionId: number
): Promise<ActivityReward> {
  return fetchJson<ActivityReward>(
    `${API_URL}/api/v1/activity_sessions/${activitySessionId}/reward`
  );
}
