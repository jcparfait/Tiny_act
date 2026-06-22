import {
  AuthMessageResponse,
  AuthProvidersResponse,
  CurrentUserResponse,
  LoginResponse,
  ProfileResponse,
} from "../types/tinyAct";

import { getAuthToken } from "./authStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function getApiBaseUrl() {
  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL n'est pas configurée."
    );
  }

  return API_URL;
}

async function authFetch<T>(
  path: string,
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

  const response = await fetch(
    `${getApiBaseUrl()}${path}`,
    {
      ...options,
      headers,
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

export function loginMobile(
  email: string,
  password: string
) {
  return authFetch<LoginResponse>(
    "/api/v1/auth/login",
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

export function registerMobile(values: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return authFetch<LoginResponse>(
    "/api/v1/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: values,
      }),
    }
  );
}

export function loadCurrentUser() {
  return authFetch<CurrentUserResponse>(
    "/api/v1/auth/me"
  );
}

export function logoutMobile() {
  return authFetch<void>(
    "/api/v1/auth/logout",
    {
      method: "DELETE",
    }
  );
}

export function deleteMobileProfile() {
  return authFetch<void>(
    "/api/v1/auth/profile",
    {
      method: "DELETE",
    }
  );
}

export function requestPasswordReset(email: string) {
  return authFetch<AuthMessageResponse>(
    "/api/v1/auth/password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );
}

export function resetMobilePassword(values: {
  reset_password_token: string;
  password: string;
  password_confirmation: string;
}) {
  return authFetch<LoginResponse>(
    "/api/v1/auth/password",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }
  );
}

export function updateMobileProfile(values: {
  first_name: string;
  last_name: string;
  avatar?: string;
  password?: string;
  password_confirmation?: string;
}) {
  return authFetch<ProfileResponse>(
    "/api/v1/auth/profile",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: values,
      }),
    }
  );
}

export function loadAuthProviders() {
  return authFetch<AuthProvidersResponse>(
    "/api/v1/auth/providers"
  );
}

export function exchangeOauthCode(code: string) {
  return authFetch<LoginResponse>(
    "/api/v1/auth/oauth/exchange",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    }
  );
}
