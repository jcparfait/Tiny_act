import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

import { loadActivitySessions } from "../services/api";

import { TA } from "../theme/tinyActTheme";
import { ActivitySessionSummary } from "../types/tinyAct";

type HistoryFilter =
  | "all"
  | "active"
  | "finished";

function formatDate(value?: string) {
  if (!value) return "Date inconnue";

  const date = new Date(value);

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function readableStatus(
  status: string,
  finished: boolean
) {
  if (finished) return "Terminée";
  if (status === "in_progress") return "En cours";
  if (status === "paused") return "En pause";
  if (status === "preview") return "À démarrer";
  if (status === "selecting") return "À choisir";

  return status;
}

function statusColor(
  status: string,
  finished: boolean
) {
  if (finished) return "#176C3A";
  if (status === "in_progress") return TA.colors.purple;
  if (status === "paused") return "#8B5E00";
  if (status === "preview") return "#5B3FD8";
  if (status === "selecting") return TA.colors.inkMuted;

  return TA.colors.inkMuted;
}

function readableActivityType(type: string) {
  const labels: Record<string, string> = {
    standard: "Action simple",
    culture_quiz: "Quiz culture",
    code_quiz: "Quiz code",
    word_learning: "Langues · mots",
    sentence_completion: "Langues · phrases",
    melody: "Musique",
  };

  return labels[type] || "Activité";
}

function isActiveSession(
  session: ActivitySessionSummary
) {
  return (
    !session.finished &&
    session.status !== "finished"
  );
}

function isFinishedSession(
  session: ActivitySessionSummary
) {
  return (
    session.finished ||
    session.status === "finished"
  );
}

export default function HistoryScreen() {
  const router = useRouter();

  const [sessions, setSessions] = useState<
    ActivitySessionSummary[]
  >([]);

  const [filter, setFilter] =
    useState<HistoryFilter>("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const finishedSessions = useMemo(
    () => sessions.filter(isFinishedSession),
    [sessions]
  );

  const activeSessions = useMemo(
    () => sessions.filter(isActiveSession),
    [sessions]
  );

  const totalXp = useMemo(
    () =>
      finishedSessions.reduce(
        (sum, session) =>
          sum + (session.xp_earned || 0),
        0
      ),
    [finishedSessions]
  );

  const totalSeconds = useMemo(
    () =>
      finishedSessions.reduce(
        (sum, session) =>
          sum + session.elapsed_seconds,
        0
      ),
    [finishedSessions]
  );

  const filteredSessions = useMemo(() => {
    if (filter === "active") {
      return activeSessions;
    }

    if (filter === "finished") {
      return finishedSessions;
    }

    return sessions;
  }, [
    activeSessions,
    filter,
    finishedSessions,
    sessions,
  ]);

  async function fetchSessions() {
    try {
      setError(null);

      const data = await loadActivitySessions();

      setSessions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    }
  }

  useEffect(() => {
    async function load() {
      await fetchSessions();
      setLoading(false);
    }

    load();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  }

  function openSession(sessionId: number) {
    router.push({
      pathname: "/session/[id]",
      params: {
        id: String(sessionId),
      },
    });
  }

  function handleBack() {
    router.replace("/profile");
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 131,
          zIndex: 80,
          backgroundColor: TA.colors.bgStart,
        }}
      />

      <MobileNav active="history" />

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: TA.colors.bgStart,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{
          paddingTop: 125,
          paddingHorizontal: 18,
          paddingBottom: 124,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            padding: 16,
            borderRadius: 34,
            backgroundColor: TA.colors.surface,
            borderWidth: 1.5,
            borderColor: "rgba(21, 27, 47, 0.10)",
            gap: 20,
            ...TA.shadow.soft,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: TA.colors.inkLight,
                fontSize: 13,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Ton activité
            </Text>

            <Text
              style={{
                color: TA.colors.ink,
                fontSize: 44,
                lineHeight: 45,
                fontFamily: TA.fonts.black,
                letterSpacing: -2,
              }}
            >
              Historique
            </Text>

            <Text
              style={{
                color: TA.colors.inkMuted,
                fontSize: 14,
                lineHeight: 20,
                fontFamily: TA.fonts.bold,
              }}
            >
              Reprends une activité en cours ou revois les
              récompenses déjà gagnées.
            </Text>
          </View>

          {loading && (
            <View
              style={{
                padding: 28,
                borderRadius: 28,
                backgroundColor: TA.colors.surface,
                borderWidth: 2,
                borderColor: TA.colors.borderMedium,
                alignItems: "center",
                ...TA.shadow.card,
              }}
            >
              <ActivityIndicator />
            </View>
          )}

          {error && (
            <ErrorBox message={error} />
          )}

          {!loading && !error && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <SummaryStat
                  label="Sessions"
                  value={`${sessions.length}`}
                />

                <SummaryStat
                  label="Terminées"
                  value={`${finishedSessions.length}`}
                />

                <SummaryStat
                  label="XP gagnée"
                  value={`${totalXp}`}
                />

                <SummaryStat
                  label="Temps actif"
                  value={formatElapsedTime(
                    totalSeconds
                  )}
                />
              </View>

              <View
                style={{
                  padding: 6,
                  borderRadius: 22,
                  backgroundColor: TA.colors.ink,
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <FilterButton
                  label="Tout"
                  selected={filter === "all"}
                  onPress={() => setFilter("all")}
                />

                <FilterButton
                  label={`À reprendre (${activeSessions.length})`}
                  selected={filter === "active"}
                  onPress={() => setFilter("active")}
                />

                <FilterButton
                  label={`Terminées (${finishedSessions.length})`}
                  selected={filter === "finished"}
                  onPress={() =>
                    setFilter("finished")
                  }
                />
              </View>

              {sessions.length === 0 && (
                <EmptyState
                  title="Aucune activité pour l’instant"
                  text="Lance une première activité, puis reviens ici pour voir ton historique et tes récompenses."
                  buttonLabel="Lancer une activité"
                  onPress={() => router.push("/")}
                />
              )}

              {sessions.length > 0 &&
                filteredSessions.length === 0 && (
                  <EmptyState
                    title="Rien dans cette catégorie"
                    text="Change de filtre ou lance une nouvelle activité."
                    buttonLabel="Voir tout l’historique"
                    onPress={() => setFilter("all")}
                  />
                )}

              {filteredSessions.length > 0 && (
                <View style={{ gap: 14 }}>
                  {filteredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onPress={() =>
                        openSession(session.id)
                      }
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 24,
          backgroundColor: TA.colors.bgStart,
          borderTopWidth: 1,
          borderTopColor: "rgba(21, 27, 47, 0.08)",
          zIndex: 120,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            alignSelf: "center",
          }}
        >
          <SecondaryButton
            label="← Retour au profil"
            onPress={handleBack}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: 125,
        padding: 15,
        borderRadius: 20,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: TA.colors.borderMedium,
        gap: 4,
        ...TA.shadow.soft,
      }}
    >
      <Text
        style={{
          color: TA.colors.inkMuted,
          fontSize: 11,
          fontFamily: TA.fonts.black,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 22,
          fontFamily: TA.fonts.black,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function FilterButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 42,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected
          ? TA.colors.purple
          : "transparent",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: TA.colors.white,
          fontSize: 12,
          fontFamily: TA.fonts.black,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SessionCard({
  session,
  onPress,
}: {
  session: ActivitySessionSummary;
  onPress: () => void;
}) {
  const finished =
    isFinishedSession(session);

  const status = readableStatus(
    session.status,
    session.finished
  );

  const actionLabel = finished
    ? "Voir la récompense →"
    : session.status === "selecting"
      ? "Choisir une activité →"
      : session.status === "preview"
        ? "Commencer →"
        : "Reprendre →";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 18,
        borderRadius: 28,
        backgroundColor: pressed
          ? TA.colors.bgMiddle
          : TA.colors.surface,
        borderWidth: 2,
        borderColor: finished
          ? "#CDEEDB"
          : TA.colors.borderMedium,
        gap: 14,
        opacity: pressed ? 0.85 : 1,
        ...TA.shadow.soft,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: finished
              ? "#E6F6EC"
              : TA.colors.bgMiddle,
          }}
        >
          <Text
            style={{
              fontSize: 22,
            }}
          >
            {finished ? "✓" : "↻"}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 5 }}>
          <Text
            style={{
              color: statusColor(
                session.status,
                session.finished
              ),
              fontSize: 12,
              fontFamily: TA.fonts.black,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {formatDate(session.created_at)} · {status}
          </Text>

          <Text
            style={{
              color: TA.colors.ink,
              fontSize: 22,
              lineHeight: 27,
              fontFamily: TA.fonts.black,
            }}
          >
            {session.activity.name}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: TA.colors.inkMuted,
              fontSize: 14,
              lineHeight: 21,
              fontFamily: TA.fonts.semiBold,
            }}
          >
            {session.activity.description ||
              session.activity.content ||
              "Aucune description."}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <DetailPill
          label={readableActivityType(
            session.activity.activity_type
          )}
        />

        <DetailPill
          label={`Temps ${formatElapsedTime(
            session.elapsed_seconds
          )}`}
        />

        <DetailPill
          label={`XP ${session.xp_earned || 0}`}
        />

        {session.activity.interest?.name && (
          <DetailPill
            label={session.activity.interest.name}
          />
        )}
      </View>

      <Text
        style={{
          color: TA.colors.purple,
          fontSize: 15,
          fontFamily: TA.fonts.black,
          textAlign: "right",
        }}
      >
        {actionLabel}
      </Text>
    </Pressable>
  );
}

function DetailPill({
  label,
}: {
  label: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: TA.colors.bgMiddle,
      }}
    >
      <Text
        style={{
          color: TA.colors.inkMuted,
          fontSize: 12,
          fontFamily: TA.fonts.extraBold,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function EmptyState({
  title,
  text,
  buttonLabel,
  onPress,
}: {
  title: string;
  text: string;
  buttonLabel: string;
  onPress: () => void;
}) {
  return (
    <View
      style={{
        padding: 22,
        borderRadius: 28,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: TA.colors.borderMedium,
        gap: 16,
        ...TA.shadow.soft,
      }}
    >
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 24,
            fontFamily: TA.fonts.black,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 15,
            lineHeight: 22,
            fontFamily: TA.fonts.semiBold,
          }}
        >
          {text}
        </Text>
      </View>

      <PrimaryButton
        label={buttonLabel}
        onPress={onPress}
      />
    </View>
  );
}
