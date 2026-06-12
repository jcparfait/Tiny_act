import { useEffect, useState } from "react";
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
import { ScreenHeader } from "../components/ScreenHeader";
import { loadActivitySessions } from "../services/api";
import { ActivitySessionSummary } from "../types/tinyAct";

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

function readableStatus(status: string, finished: boolean) {
  if (finished) return "Terminée";
  if (status === "in_progress") return "En cours";
  if (status === "paused") return "En pause";
  if (status === "preview") return "Prête à démarrer";
  if (status === "selecting") return "Sélection en cours";

  return status;
}

function statusColor(status: string, finished: boolean) {
  if (finished) return "#176C3A";
  if (status === "in_progress") return "#FF4B2B";
  if (status === "paused") return "#8B5E00";

  return "#5D5A70";
}

export default function HistoryScreen() {
  const router = useRouter();

  const [sessions, setSessions] = useState<ActivitySessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchSessions() {
    try {
      setError(null);

      const data = await loadActivitySessions();

      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF4EA" }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
            maxWidth: 520,
            minHeight: "100%",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <ScreenHeader
            title="Historique"
            subtitle="Retrouve, consulte et reprends tes dernières activités."
          />

          {loading && <ActivityIndicator />}

          {error && <ErrorBox message={error} />}

          {!loading && !error && sessions.length === 0 && (
            <View
              style={{
                padding: 22,
                borderRadius: 26,
                backgroundColor: "#FFFFFF",
                borderWidth: 2,
                borderColor: "#F2D7C8",
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: "#17152F",
                }}
              >
                Aucune activité pour l’instant
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  color: "#5D5A70",
                  lineHeight: 22,
                }}
              >
                Lance une première activité, puis reviens ici pour voir ton
                historique.
              </Text>
            </View>
          )}

          {!loading && !error && sessions.length > 0 && (
            <View style={{ gap: 14 }}>
              {sessions.map((session) => (
                <Pressable
                  key={session.id}
                  onPress={() => openSession(session.id)}
                  style={({ pressed }) => ({
                    padding: 20,
                    borderRadius: 26,
                    backgroundColor: pressed ? "#FFF9F5" : "#FFFFFF",
                    borderWidth: 2,
                    borderColor: "#F2D7C8",
                    gap: 10,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View style={{ gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: statusColor(
                          session.status,
                          session.finished
                        ),
                        textTransform: "uppercase",
                      }}
                    >
                      {formatDate(session.created_at)} ·{" "}
                      {readableStatus(session.status, session.finished)}
                    </Text>

                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "900",
                        color: "#17152F",
                      }}
                    >
                      {session.activity.name}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={3}
                    style={{
                      fontSize: 15,
                      color: "#5D5A70",
                      lineHeight: 22,
                    }}
                  >
                    {session.activity.description ||
                      session.activity.content ||
                      "Aucune description."}
                  </Text>

                  <View
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      backgroundColor: "#FFF4EA",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#5D5A70",
                        fontWeight: "700",
                      }}
                    >
                      Type : {session.activity.activity_type}
                    </Text>

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#5D5A70",
                        fontWeight: "700",
                      }}
                    >
                      Temps : {formatElapsedTime(session.elapsed_seconds)}
                    </Text>

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#5D5A70",
                        fontWeight: "700",
                      }}
                    >
                      XP : {session.xp_earned || 0}
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 4,
                      color: "#FF4B2B",
                      fontSize: 15,
                      fontWeight: "900",
                      textAlign: "right",
                    }}
                  >
                    Voir le détail →
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <MobileNav active="history" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
