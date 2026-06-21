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
import { ScreenHeader } from "../components/ScreenHeader";

import { loadActivitySessions } from "../services/api";

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
  if (status === "in_progress") return "#FF4B2B";
  if (status === "paused") return "#8B5E00";
  if (status === "preview") return "#5B3FD8";
  if (status === "selecting") return "#5D5A70";

  return "#5D5A70";
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFF4EA",
      }}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          padding: 18,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 560,
            minHeight: "100%",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <ScreenHeader
            title="Historique"
            subtitle="Reprends une activité en cours ou revois les récompenses déjà gagnées."
          />

          {loading && <ActivityIndicator />}

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
                  backgroundColor: "#17152F",
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

          <MobileNav active="history" />
        </View>
      </ScrollView>
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
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#F2D7C8",
        gap: 4,
      }}
    >
      <Text
        style={{
          color: "#5D5A70",
          fontSize: 11,
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: "#17152F",
          fontSize: 22,
          fontWeight: "900",
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
          ? "#FF4B2B"
          : "transparent",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text
        numberOfLines={1}
        style={{
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: "900",
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
        padding: 20,
        borderRadius: 28,
        backgroundColor: pressed
          ? "#FFF9F5"
          : "#FFFFFF",
        borderWidth: 2,
        borderColor: finished
          ? "#CDEEDB"
          : "#F2D7C8",
        gap: 14,
        opacity: pressed ? 0.85 : 1,
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
              : "#FFF4EA",
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
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {formatDate(session.created_at)} · {status}
          </Text>

          <Text
            style={{
              color: "#17152F",
              fontSize: 22,
              lineHeight: 27,
              fontWeight: "900",
            }}
          >
            {session.activity.name}
          </Text>

          <Text
            numberOfLines={2}
            style={{
              color: "#5D5A70",
              fontSize: 14,
              lineHeight: 21,
              fontWeight: "600",
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
          color: "#FF4B2B",
          fontSize: 15,
          fontWeight: "900",
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
        backgroundColor: "#FFF4EA",
      }}
    >
      <Text
        style={{
          color: "#5D5A70",
          fontSize: 12,
          fontWeight: "800",
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
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#F2D7C8",
        gap: 16,
      }}
    >
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: "#17152F",
            fontSize: 24,
            fontWeight: "900",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: "#5D5A70",
            fontSize: 15,
            lineHeight: 22,
            fontWeight: "600",
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
