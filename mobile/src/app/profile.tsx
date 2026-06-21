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

import {
  AuthField,
  AuthLink,
} from "../components/AuthScreen";

import { AvatarImage } from "../components/AvatarPicker";
import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

import { useAuth } from "../context/AuthContext";

import { loadActivitySessions } from "../services/api";
import { loadRoom } from "../services/roomApi";

import {
  ActivitySessionSummary,
  RoomResponse,
} from "../types/tinyAct";

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  if (hours > 0) {
    return `${hours}h ${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes} min`;
}

function isFinishedSession(
  session: ActivitySessionSummary
) {
  return (
    session.finished ||
    session.status === "finished"
  );
}

function isActiveSession(
  session: ActivitySessionSummary
) {
  return !isFinishedSession(session);
}

export default function ProfileScreen() {
  const router = useRouter();

  const {
    user,
    updateProfile,
  } = useAuth();

  const [firstName, setFirstName] =
    useState(user?.first_name || "");

  const [lastName, setLastName] =
    useState(user?.last_name || "");

  const [sessions, setSessions] = useState<
    ActivitySessionSummary[]
  >([]);

  const [roomData, setRoomData] =
    useState<RoomResponse | null>(null);

  const [loadingStats, setLoadingStats] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setFirstName(user?.first_name || "");
    setLastName(user?.last_name || "");
  }, [user]);

  useEffect(() => {
    async function loadDashboard() {
      await fetchDashboardData();
      setLoadingStats(false);
    }

    loadDashboard();
  }, []);

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

  const totalElapsedSeconds = useMemo(
    () =>
      finishedSessions.reduce(
        (sum, session) =>
          sum + session.elapsed_seconds,
        0
      ),
    [finishedSessions]
  );

  const unlockedFurnitureCount =
    roomData?.inventory.filter(
      (item) => item.unlocked
    ).length || 0;

  const placedFurnitureCount =
    roomData?.room.furnitures.length || 0;

  const interestsCount =
    user?.interest_ids.length || 0;

  async function fetchDashboardData() {
    try {
      setError(null);

      const [
        sessionsData,
        roomResponse,
      ] = await Promise.all([
        loadActivitySessions(),
        loadRoom(),
      ]);

      setSessions(sessionsData);
      setRoomData(roomResponse);
    } catch (dashboardError) {
      setError(
        dashboardError instanceof Error
          ? dashboardError.message
          : "Impossible de charger le profil."
      );
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      setSaved(true);
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Impossible de modifier le profil."
      );
    } finally {
      setSaving(false);
    }
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
          <View
            style={{
              padding: 24,
              borderRadius: 32,
              backgroundColor: "#17152F",
              gap: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <View
                style={{
                  padding: 4,
                  borderRadius: 999,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <AvatarImage
                  avatar={user?.avatar}
                  size={92}
                />
              </View>

              <View style={{ flex: 1, gap: 5 }}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    opacity: 0.65,
                    fontSize: 12,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Mon profil
                </Text>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 29,
                    lineHeight: 34,
                    fontWeight: "900",
                  }}
                >
                  {user?.first_name ||
                    "Tiny Act"}
                </Text>

                <Text
                  numberOfLines={1}
                  style={{
                    color: "#FFFFFF",
                    opacity: 0.75,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {user?.email}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              <MiniAction
                label="Avatar"
                onPress={() =>
                  router.push("/avatar")
                }
              />

              <MiniAction
                label="Intérêts"
                onPress={() =>
                  router.push("/interests")
                }
              />
            </View>
          </View>

          {loadingStats && (
            <ActivityIndicator />
          )}

          {error && (
            <ErrorBox message={error} />
          )}

          {!loadingStats && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <DashboardStat
                  label="XP total"
                  value={`${totalXp}`}
                />

                <DashboardStat
                  label="Terminées"
                  value={`${finishedSessions.length}`}
                />

                <DashboardStat
                  label="À reprendre"
                  value={`${activeSessions.length}`}
                />

                <DashboardStat
                  label="Temps actif"
                  value={formatElapsedTime(
                    totalElapsedSeconds
                  )}
                />
              </View>

              <View
                style={{
                  padding: 22,
                  borderRadius: 28,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 2,
                  borderColor: "#F2D7C8",
                  gap: 18,
                }}
              >
                <View style={{ gap: 5 }}>
                  <Text
                    style={{
                      color: "#FF4B2B",
                      fontSize: 12,
                      fontWeight: "900",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Progression
                  </Text>

                  <Text
                    style={{
                      color: "#17152F",
                      fontSize: 25,
                      fontWeight: "900",
                    }}
                  >
                    Ta salle progresse
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <RoomStat
                    label="Meubles débloqués"
                    value={`${unlockedFurnitureCount}`}
                  />

                  <RoomStat
                    label="Meubles placés"
                    value={`${placedFurnitureCount}`}
                  />

                  <RoomStat
                    label="Centres d’intérêt"
                    value={`${interestsCount}`}
                  />
                </View>

                <PrimaryButton
                  label="Voir ma salle"
                  onPress={() =>
                    router.push("/explore")
                  }
                />
              </View>

              {roomData &&
                roomData.progress.length > 0 && (
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
                    <Text
                      style={{
                        color: "#17152F",
                        fontSize: 24,
                        fontWeight: "900",
                      }}
                    >
                      XP par catégorie
                    </Text>

                    {roomData.progress.map(
                      (progress) => (
                        <View
                          key={progress.interest.id}
                          style={{
                            gap: 7,
                          }}
                        >
                          <View
                            style={{
                              flexDirection:
                                "row",
                              justifyContent:
                                "space-between",
                              gap: 10,
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  "#17152F",
                                fontWeight:
                                  "900",
                              }}
                            >
                              {
                                progress
                                  .interest
                                  .name
                              }
                            </Text>

                            <Text
                              style={{
                                color:
                                  "#FF4B2B",
                                fontWeight:
                                  "900",
                              }}
                            >
                              {progress.xp} XP
                            </Text>
                          </View>

                          <Text
                            style={{
                              color: "#5D5A70",
                              fontSize: 12,
                              fontWeight: "700",
                            }}
                          >
                            {progress.next_required_xp
                              ? `Prochain meuble à ${progress.next_required_xp} XP`
                              : "Tous les meubles de cette catégorie sont débloqués"}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}
            </>
          )}

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
            <View style={{ gap: 5 }}>
              <Text
                style={{
                  color: "#FF4B2B",
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Compte
              </Text>

              <Text
                style={{
                  color: "#17152F",
                  fontSize: 25,
                  fontWeight: "900",
                }}
              >
                Informations personnelles
              </Text>
            </View>

            <AuthField
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
            />

            <AuthField
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text
              style={{
                color: "#5D5A70",
                fontWeight: "700",
              }}
            >
              {interestsCount} centre(s)
              d’intérêt sélectionné(s)
            </Text>

            <AuthLink
              label="Modifier mes centres d’intérêt"
              onPress={() =>
                router.push("/interests")
              }
            />

            {saved && (
              <Text
                style={{
                  color: "#176C3A",
                  fontWeight: "900",
                }}
              >
                Profil enregistré.
              </Text>
            )}

            <PrimaryButton
              label={
                saving
                  ? "Enregistrement..."
                  : "Enregistrer"
              }
              onPress={handleSave}
              disabled={saving}
            />
          </View>

          <SecondaryButton
            label="Voir l’historique"
            onPress={() =>
              router.push("/history")
            }
          />

          <MobileNav active="profile" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardStat({
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

function RoomStat({
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
        minWidth: 130,
        padding: 14,
        borderRadius: 18,
        backgroundColor: "#FFF4EA",
        gap: 4,
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

      <Text
        style={{
          color: "#17152F",
          fontSize: 24,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function MiniAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        padding: 13,
        borderRadius: 17,
        backgroundColor: "#FFFFFF",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          color: "#17152F",
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
