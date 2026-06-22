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

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { AuthField } from "../components/AuthScreen";
import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";

import { useAuth } from "../context/AuthContext";

import { loadActivitySessions } from "../services/api";
import { loadRoom } from "../services/roomApi";

import {
  ActivitySessionSummary,
  RoomResponse,
} from "../types/tinyAct";

import { TA } from "../theme/tinyActTheme";

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

function isToday(dateString?: string) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function missingXpForNextFurniture(
  nextRequiredXp: number | null | undefined,
  currentXp: number
) {
  if (!nextRequiredXp) return null;

  return Math.max(nextRequiredXp - currentXp, 0);
}

export default function ProfileScreen() {
  const router = useRouter();

  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] =
    useState(user?.first_name || "");

  const [lastName, setLastName] =
    useState(user?.last_name || "");

  const [password, setPassword] =
    useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

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

  const todayFinishedSessions = useMemo(
    () =>
      finishedSessions.filter((session) =>
        isToday(session.created_at)
      ),
    [finishedSessions]
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

  const todayElapsedSeconds = useMemo(
    () =>
      todayFinishedSessions.reduce(
        (sum, session) =>
          sum + session.elapsed_seconds,
        0
      ),
    [todayFinishedSessions]
  );

  const unlockedFurnitureCount =
    roomData?.inventory.filter(
      (item) => item.unlocked
    ).length || 0;

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
      const trimmedPassword = password.trim();
      const trimmedConfirmation =
        passwordConfirmation.trim();

      if (
        trimmedPassword.length > 0 ||
        trimmedConfirmation.length > 0
      ) {
        if (trimmedPassword.length < 6) {
          throw new Error(
            "Le mot de passe doit contenir au moins 6 caractères."
          );
        }

        if (
          trimmedPassword !== trimmedConfirmation
        ) {
          throw new Error(
            "La confirmation du mot de passe ne correspond pas."
          );
        }
      }

      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ...(trimmedPassword.length > 0
          ? {
              password: trimmedPassword,
              password_confirmation:
                trimmedConfirmation,
            }
          : {}),
      });

      setPassword("");
      setPasswordConfirmation("");
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
    <LinearGradient
      colors={[
        TA.colors.bgStart,
        TA.colors.bgMiddle,
        TA.colors.bgEnd,
      ]}
      locations={[0, 0.46, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "transparent",
        }}
      >
        <MobileNav
          active="profile"
          hideXp
        />

        <ScrollView
          style={{
            flex: 1,
            marginTop: 130,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 34,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 16,
              borderRadius: 36,
              backgroundColor:
                "rgba(255, 253, 249, 0.78)",
              borderWidth: 1.5,
              borderColor:
                "rgba(21, 27, 47, 0.10)",
              gap: 22,
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
                Ton espace personnel
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
                Profil
              </Text>
            </View>

            {error && (
              <ErrorBox message={error} />
            )}

            <View style={{ gap: 12 }}>
              <Text
                style={{
                  color: TA.colors.inkLight,
                  fontSize: 13,
                  fontFamily: TA.fonts.black,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                Raccourcis
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <ProfileShortcutCard
                  title="Avatar"
                  subtitle="Changer ton style"
                  icon="🎨"
                  color="#7C63F2"
                  onPress={() =>
                    router.push("/avatar")
                  }
                />

                <ProfileShortcutCard
                  title="Intérêts"
                  subtitle={`${interestsCount} sélectionné(s)`}
                  icon="✦"
                  color="#92BD73"
                  onPress={() =>
                    router.push("/interests")
                  }
                />

                <ProfileShortcutCard
                  title="Ma room"
                  subtitle="Décorer ton espace"
                  icon="⌂"
                  color="#13A8C7"
                  onPress={() =>
                    router.push("/explore")
                  }
                />

                <ProfileShortcutCard
                  title="Historique"
                  subtitle="Voir tes sessions"
                  icon="↺"
                  color="#F39A20"
                  onPress={() =>
                    router.push("/history")
                  }
                />
              </View>
            </View>

            {loadingStats ? (
              <View
                style={{
                  padding: 22,
                  borderRadius: 28,
                  backgroundColor:
                    TA.colors.surface,
                  borderWidth: 2,
                  borderColor:
                    TA.colors.borderMedium,
                  alignItems: "center",
                  ...TA.shadow.card,
                }}
              >
                <ActivityIndicator />
              </View>
            ) : (
              <ProfileStatsBlock
                totalXp={totalXp}
                todayElapsedSeconds={
                  todayElapsedSeconds
                }
                totalElapsedSeconds={
                  totalElapsedSeconds
                }
                unlockedFurnitureCount={
                  unlockedFurnitureCount
                }
                roomData={roomData}
              />
            )}

            <ProfileAccountCard
              firstName={firstName}
              lastName={lastName}
              email={user?.email || ""}
              password={password}
              passwordConfirmation={
                passwordConfirmation
              }
              saving={saving}
              saved={saved}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onPasswordChange={setPassword}
              onPasswordConfirmationChange={
                setPasswordConfirmation
              }
              onSave={handleSave}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ProfileStatsBlock({
  totalXp,
  todayElapsedSeconds,
  totalElapsedSeconds,
  unlockedFurnitureCount,
  roomData,
}: {
  totalXp: number;
  todayElapsedSeconds: number;
  totalElapsedSeconds: number;
  unlockedFurnitureCount: number;
  roomData: RoomResponse | null;
}) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 32,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: TA.colors.borderMedium,
        gap: 16,
        ...TA.shadow.card,
      }}
    >
      <View style={{ gap: 5 }}>
        <Text
          style={{
            color: TA.colors.purple,
            fontSize: 12,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          Bilan actif
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 25,
            lineHeight: 29,
            fontFamily: TA.fonts.black,
            letterSpacing: -1,
          }}
        >
          Du temps passif transformé en action
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <ProfileStat
          label="XP total"
          value={`${totalXp}`}
          color="#7C63F2"
        />

        <ProfileStat
          label="Aujourd’hui"
          value={formatElapsedTime(
            todayElapsedSeconds
          )}
          color="#92BD73"
        />

        <ProfileStat
          label="Depuis le début"
          value={formatElapsedTime(
            totalElapsedSeconds
          )}
          color="#13A8C7"
        />

        <ProfileStat
          label="Objets débloqués"
          value={`${unlockedFurnitureCount}`}
          color="#F39A20"
        />
      </View>

      {roomData &&
        roomData.progress.length > 0 && (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                color: TA.colors.inkLight,
                fontSize: 12,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              XP manquant par catégorie
            </Text>

            <View style={{ gap: 8 }}>
              {roomData.progress.map((progress) => {
                const missingXp =
                  missingXpForNextFurniture(
                    progress.next_required_xp,
                    progress.xp
                  );

                return (
                  <View
                    key={progress.interest.id}
                    style={{
                      padding: 12,
                      borderRadius: 18,
                      backgroundColor:
                        TA.colors.bgMiddle,
                      borderWidth: 1,
                      borderColor:
                        TA.colors.borderMedium,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        color: TA.colors.ink,
                        fontSize: 14,
                        fontFamily: TA.fonts.black,
                      }}
                    >
                      {progress.interest.name}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{
                        color: TA.colors.purple,
                        fontSize: 13,
                        fontFamily: TA.fonts.black,
                      }}
                    >
                      {missingXp === null
                        ? "Tout débloqué"
                        : `${missingXp} XP`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
    </View>
  );
}

function ProfileAccountCard({
  firstName,
  lastName,
  email,
  password,
  passwordConfirmation,
  saving,
  saved,
  onFirstNameChange,
  onLastNameChange,
  onPasswordChange,
  onPasswordConfirmationChange,
  onSave,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  saving: boolean;
  saved: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onSave: () => void;
}) {
  const displayedName =
    [firstName, lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Tiny Act";

  return (
    <View
      style={{
        padding: 18,
        borderRadius: 32,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: TA.colors.purpleSoft,
        gap: 16,
        ...TA.shadow.card,
      }}
    >
      <View style={{ gap: 5 }}>
        <Text
          style={{
            color: TA.colors.purple,
            fontSize: 12,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          Informations
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: TA.colors.ink,
            fontSize: 27,
            lineHeight: 31,
            fontFamily: TA.fonts.black,
            letterSpacing: -1.2,
          }}
        >
          {displayedName}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: TA.colors.inkMuted,
            fontSize: 14,
            lineHeight: 18,
            fontFamily: TA.fonts.bold,
          }}
        >
          {email}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <AuthField
          label="Prénom"
          value={firstName}
          onChangeText={onFirstNameChange}
        />

        <AuthField
          label="Nom"
          value={lastName}
          onChangeText={onLastNameChange}
        />

        <AuthField
          label="Nouveau mot de passe"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
          placeholder="Laisser vide pour ne pas changer"
        />

        <AuthField
          label="Confirmer le mot de passe"
          value={passwordConfirmation}
          onChangeText={
            onPasswordConfirmationChange
          }
          secureTextEntry
          placeholder="Confirmation"
        />
      </View>

      {saved && (
        <Text
          style={{
            color: "#176C3A",
            fontSize: 13,
            fontFamily: TA.fonts.black,
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
        onPress={onSave}
        disabled={saving}
      />
    </View>
  );
}

function ProfileStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flexGrow: 1,
        width: "47%",
        minHeight: 86,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 22,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: color,
        gap: 4,
        ...TA.shadow.soft,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color,
          fontSize: 10,
          lineHeight: 12,
          fontFamily: TA.fonts.black,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        style={{
          color: TA.colors.ink,
          fontSize: 22,
          lineHeight: 26,
          fontFamily: TA.fonts.black,
          letterSpacing: -0.8,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ProfileShortcutCard({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        width: "47%",
        minHeight: 124,
        padding: 16,
        borderRadius: 28,
        backgroundColor: TA.colors.surface,
        borderWidth: 2,
        borderColor: color,
        opacity: pressed ? 0.82 : 1,
        transform: [
          {
            translateY: pressed ? 1 : 0,
          },
        ],
        ...TA.shadow.card,
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: TA.colors.white,
            fontSize: 20,
            lineHeight: 24,
            fontFamily: TA.fonts.black,
          }}
        >
          {icon}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        style={{
          color: TA.colors.ink,
          fontSize: 22,
          lineHeight: 25,
          fontFamily: TA.fonts.black,
          letterSpacing: -0.8,
        }}
      >
        {title}
      </Text>

      <Text
        numberOfLines={2}
        style={{
          marginTop: 4,
          color: TA.colors.inkMuted,
          fontSize: 12,
          lineHeight: 16,
          fontFamily: TA.fonts.bold,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}
