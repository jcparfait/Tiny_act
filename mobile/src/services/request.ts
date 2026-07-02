const DEFAULT_TIMEOUT_MS = 10000;

export function readableError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    message.includes("Failed to fetch") ||
    message.includes("Network request failed") ||
    normalizedMessage.includes("aborted") ||
    normalizedMessage.includes("timeout")
  ) {
    return "Impossible de joindre le serveur. Vérifie que Rails est lancé et que le téléphone utilise la bonne adresse IP.";
  }

  if (
    message.includes("401") ||
    normalizedMessage.includes("unauthorized")
  ) {
    return "Ta session a expiré. Reconnecte-toi pour continuer.";
  }

  if (
    message.includes("404") ||
    normalizedMessage.includes("not found")
  ) {
    return "Cette page ou cette activité n’existe plus.";
  }

  if (
    message.includes("500") ||
    normalizedMessage.includes("internal server error")
  ) {
    return "Le serveur a rencontré une erreur. Regarde les logs Rails.";
  }

  return message;
}

export async function fetchWithTimeout(
  input: Parameters<typeof fetch>[0],
  options?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "La connexion au serveur a pris trop de temps."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
