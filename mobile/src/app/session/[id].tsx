import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { ActiveActivityCard } from "../../components/ActiveActivityCard";
import { ActivityRewardCard } from "../../components/ActivityRewardCard";
import { ErrorBox } from "../../components/ErrorBox";
import { MobileNav } from "../../components/MobileNav";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SecondaryButton } from "../../components/SecondaryButton";

import {
  finishActivitySession,
  loadActivityReward,
  loadActivitySession,
  pauseActivitySession,
  resumeActivitySession,
  startActivitySession,
} from "../../services/api";

import {
  Activity,
  ActivityReward,
  ActivitySession,
} from "../../types/tinyAct";

function computeElapsedSeconds(
  activitySession: ActivitySession | null
) {
  if (!activitySession) return 0;

  const baseElapsedSeconds =
    activitySession.elapsed_seconds || 0;

  if (
    activitySession.status !== "in_progress" ||
    !activitySession.timer_started_at
  ) {
    return baseElapsedSeconds;
  }

  const startedAt = new Date(
    activitySession.timer_started_at
  ).getTime();

  const now = Date.now();

  const secondsSinceStart = Math.max(
    0,
    Math.floor((now - startedAt) / 1000)
  );

  return baseElapsedSeconds + secondsSinceStart;
}

export default function SessionDetailScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{ id: string | string[] }>();

  const rawId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const activitySessionId = Number(rawId);

  const [activitySession, setActivitySession] =
    useState<ActivitySession | null>(null);

  const [activity, setActivity] =
    useState<Activity | null>(null);

  const [reward, setReward] =
    useState<ActivityReward | null>(null);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [
    activityReadyToFinish,
    setActivityReadyToFinish,
  ] = useState(true);

  const [loading, setLoading] =
    useState(true);

  const [autoStarting, setAutoStarting] =
    useState(false);

  const [pausing, setPausing] =
    useState(false);

  const [resuming, setResuming] =
    useState(false);

  const [finishing, setFinishing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      if (!Number.isFinite(activitySessionId)) {
        setError(
          "Identifiant de session invalide."
        );
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const data =
          await loadActivitySession(
            activitySessionId
          );

        const selectedActivity =
          data.activities.find(
            (item) =>
              item.id ===
              data.activity_session.activity_id
          ) || data.activities[0];

        const sessionIsAlreadyFinished =
          data.activity_session.finished ===
            true ||
          data.activity_session.status ===
            "finished";

        if (sessionIsAlreadyFinished) {
          setActivitySession(
            data.activity_session
          );

          setActivity(
            selectedActivity || null
          );

          setElapsedSeconds(
            computeElapsedSeconds(
              data.activity_session
            )
          );

          setActivityReadyToFinish(true);

          await loadRewardForSession(
            data.activity_session.id
          );

          return;
        }

        if (
          data.activity_session.status === "preview"
        ) {
          setAutoStarting(true);

          const startedData =
            await startActivitySession(
              data.activity_session.id
            );

          setActivitySession(
            startedData.activity_session
          );

          setActivity(startedData.activity);

          setElapsedSeconds(
            computeElapsedSeconds(
              startedData.activity_session
            )
          );

          setActivityReadyToFinish(
            startedData.activity.activity_type !==
              "melody"
          );

          setReward(null);

          return;
        }

        setActivitySession(
          data.activity_session
        );

        setActivity(
          selectedActivity || null
        );

        setElapsedSeconds(
          computeElapsedSeconds(
            data.activity_session
          )
        );

        setActivityReadyToFinish(
          selectedActivity?.activity_type !==
            "melody"
        );

        setReward(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue"
        );
      } finally {
        setAutoStarting(false);
        setLoading(false);
      }
    }

    fetchSession();
  }, [activitySessionId]);

  useEffect(() => {
    if (
      activitySession?.status !==
      "in_progress"
    ) {
      return;
    }

    setElapsedSeconds(
      computeElapsedSeconds(activitySession)
    );

    const intervalId = setInterval(() => {
      setElapsedSeconds(
        computeElapsedSeconds(activitySession)
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activitySession]);

  async function loadRewardForSession(
    sessionId: number
  ) {
    try {
      const rewardData =
        await loadActivityReward(sessionId);

      setReward(rewardData);
    } catch {
      setReward(null);
    }
  }

  async function handlePause() {
    if (!activitySession) return;

    setPausing(true);
    setError(null);

    try {
      const data =
        await pauseActivitySession(
          activitySession.id,
          elapsedSeconds
        );

      setActivitySession(
        data.activity_session
      );

      setActivity(data.activity);

      setElapsedSeconds(
        data.activity_session.elapsed_seconds
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    } finally {
      setPausing(false);
    }
  }

  async function handleResume() {
    if (!activitySession) return;

    setResuming(true);
    setError(null);

    try {
      const data =
        await resumeActivitySession(
          activitySession.id
        );

      setActivitySession(
        data.activity_session
      );

      setActivity(data.activity);

      setElapsedSeconds(
        computeElapsedSeconds(
          data.activity_session
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    } finally {
      setResuming(false);
    }
  }

  async function handleFinish() {
    if (
      !activitySession ||
      !activityReadyToFinish
    ) {
      return;
    }

    setFinishing(true);
    setError(null);

    try {
      const data =
        await finishActivitySession(
          activitySession.id,
          elapsedSeconds
        );

      setActivitySession(
        data.activity_session
      );

      setActivity(data.activity);

      setElapsedSeconds(
        data.activity_session.elapsed_seconds
      );

      setActivityReadyToFinish(true);

      await loadRewardForSession(
        data.activity_session.id
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    } finally {
      setFinishing(false);
    }
  }

  const sessionIsFinished =
    activitySession?.finished === true ||
    activitySession?.status === "finished";

  const sessionIsRunning =
    activitySession?.status ===
    "in_progress";

  const sessionIsPaused =
    activitySession?.status === "paused";

  const canFinish =
    activitySession &&
    !sessionIsFinished &&
    (sessionIsRunning || sessionIsPaused);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F4EFE8",
      }}
    >
      <ScrollView
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
            title="Détail de la session"
            subtitle="Consulte ou reprends cette activité."
          />

          {(loading || autoStarting) && (
            <View
              style={{
                padding: 22,
                borderRadius: 28,
                backgroundColor: "#FFFFFF",
                borderWidth: 2,
                borderColor:
                  "rgba(90, 74, 54, 0.16)",
                alignItems: "center",
                gap: 12,
              }}
            >
              <ActivityIndicator />

              <Text
                style={{
                  color: "rgba(21, 27, 47, 0.58)",
                  fontSize: 14,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                Ouverture de l’activité...
              </Text>
            </View>
          )}

          {error && (
            <ErrorBox message={error} />
          )}

          {!loading &&
            !autoStarting &&
            activitySession &&
            activity &&
            !sessionIsFinished && (
              <ActiveActivityCard
                activity={activity}
                activitySession={
                  activitySession
                }
                elapsedSeconds={
                  elapsedSeconds
                }
                onActivityReadyToFinishChange={
                  setActivityReadyToFinish
                }
              />
            )}

          {!loading &&
            !autoStarting &&
            activitySession &&
            activity &&
            sessionIsFinished &&
            reward && (
              <ActivityRewardCard
                activity={activity}
                reward={reward}
                onViewRoom={() =>
                  router.push("/explore")
                }
                onRestart={() =>
                  router.replace("/")
                }
              />
            )}

          {!loading &&
            !autoStarting &&
            activitySession &&
            activity &&
            sessionIsFinished &&
            !reward && (
              <View
                style={{
                  padding: 22,
                  borderRadius: 28,
                  backgroundColor:
                    "#FFFFFF",
                  borderWidth: 2,
                  borderColor:
                    "rgba(90, 74, 54, 0.16)",
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    color: "#176C3A",
                    fontWeight: "900",
                    textTransform:
                      "uppercase",
                  }}
                >
                  Activité terminée
                </Text>

                <Text
                  style={{
                    color: "#151B2F",
                    fontSize: 28,
                    fontWeight: "900",
                  }}
                >
                  {activity.name}
                </Text>

                <Text
                  style={{
                    color: "rgba(21, 27, 47, 0.58)",
                    lineHeight: 22,
                  }}
                >
                  Les informations de
                  récompense ne sont pas
                  disponibles pour cette
                  session.
                </Text>
              </View>
            )}

          {!loading &&
            !autoStarting &&
            activitySession &&
            activity &&
            !sessionIsFinished && (
              <View style={{ gap: 12 }}>
                {sessionIsRunning && (
                  <PrimaryButton
                    label={
                      pausing
                        ? "Pause..."
                        : "Pause"
                    }
                    onPress={handlePause}
                    disabled={
                      pausing ||
                      resuming ||
                      finishing
                    }
                  />
                )}

                {sessionIsPaused && (
                  <PrimaryButton
                    label={
                      resuming
                        ? "Reprise..."
                        : "Reprendre"
                    }
                    onPress={handleResume}
                    disabled={
                      resuming ||
                      pausing ||
                      finishing
                    }
                  />
                )}

                {canFinish && (
                  <PrimaryButton
                    label={
                      !activityReadyToFinish
                        ? "Termine l’activité avant de valider"
                        : finishing
                          ? "Finalisation..."
                          : "Terminer"
                    }
                    onPress={handleFinish}
                    disabled={
                      !activityReadyToFinish ||
                      finishing ||
                      pausing ||
                      resuming
                    }
                  />
                )}

                {activitySession.status ===
                  "selecting" && (
                  <View
                    style={{
                      padding: 16,
                      borderRadius: 20,
                      backgroundColor:
                        "#F4EFE8",
                      borderWidth: 1,
                      borderColor:
                        "rgba(90, 74, 54, 0.16)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: "rgba(21, 27, 47, 0.58)",
                        lineHeight: 22,
                      }}
                    >
                      Cette session a été
                      créée, mais aucune
                      activité n’a encore été
                      sélectionnée.
                    </Text>
                  </View>
                )}
              </View>
            )}

          <SecondaryButton
            label="← Retour à l’historique"
            onPress={() => router.back()}
          />

          <MobileNav active="history" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
