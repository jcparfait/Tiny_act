import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ActiveActivityCard } from "../components/ActiveActivityCard";
import { ActivityCard } from "../components/ActivityCard";
import { ActivityRewardCard } from "../components/ActivityRewardCard";
import { ChoiceCard } from "../components/ChoiceCard";
import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PreviewActivityCard } from "../components/PreviewActivityCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenHeader } from "../components/ScreenHeader";
import { SecondaryButton } from "../components/SecondaryButton";
import { SessionBadge } from "../components/SessionBadge";

import {
  createActivitySession,
  finishActivitySession,
  loadActivityReward,
  loadActivitySessions,
  loadInitialData,
  pauseActivitySession,
  resumeActivitySession,
  selectActivity,
  startActivitySession,
} from "../services/api";

import {
  Activity,
  ActivityReward,
  ActivitySession,
  ActivitySessionSummary,
  Duration,
  Location,
  Mood,
  Step,
} from "../types/tinyAct";

import { TA } from "../theme/tinyActTheme";

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

function isActiveSession(
  session: ActivitySessionSummary
) {
  return (
    !session.finished &&
    session.status !== "finished"
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const [step, setStep] =
    useState<Step>("mood");

  const [moods, setMoods] =
    useState<Mood[]>([]);

  const [locations, setLocations] =
    useState<Location[]>([]);

  const [durations, setDurations] =
    useState<Duration[]>([]);

  const [selectedMoodId, setSelectedMoodId] =
    useState<number | null>(null);

  const [
    selectedLocationId,
    setSelectedLocationId,
  ] = useState<number | null>(null);

  const [
    selectedDurationId,
    setSelectedDurationId,
  ] = useState<number | null>(null);

  const [activitySession, setActivitySession] =
    useState<ActivitySession | null>(null);

  const [
    recommendedActivities,
    setRecommendedActivities,
  ] = useState<Activity[]>([]);

  const [selectedActivity, setSelectedActivity] =
    useState<Activity | null>(null);

  const [reward, setReward] =
    useState<ActivityReward | null>(null);

  const [
    resumableSession,
    setResumableSession,
  ] = useState<ActivitySessionSummary | null>(
    null
  );

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [
    activityReadyToFinish,
    setActivityReadyToFinish,
  ] = useState(true);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [
    selectingActivity,
    setSelectingActivity,
  ] = useState(false);

  const [
    startingActivity,
    setStartingActivity,
  ] = useState(false);

  const [
    pausingActivity,
    setPausingActivity,
  ] = useState(false);

  const [
    resumingActivity,
    setResumingActivity,
  ] = useState(false);

  const [
    finishingActivity,
    setFinishingActivity,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setError(null);

        const [
          initialData,
          sessionsData,
        ] = await Promise.all([
          loadInitialData(),
          loadActivitySessions(),
        ]);

        setMoods(initialData.moods);
        setLocations(initialData.locations);
        setDurations(initialData.durations);

        const activeSession =
          sessionsData.find(isActiveSession) ||
          null;

        setResumableSession(activeSession);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur inconnue"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (
      step !== "activity" &&
      step !== "finished"
    ) {
      return;
    }

    setElapsedSeconds(
      computeElapsedSeconds(activitySession)
    );

    if (
      activitySession?.status !== "in_progress"
    ) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds(
        computeElapsedSeconds(activitySession)
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [step, activitySession]);

  const title =
    step === "mood"
      ? "Comment tu te sens ?"
      : step === "location"
        ? "Où es-tu ?"
        : step === "duration"
          ? "Combien de temps ?"
          : step === "recommendations"
            ? "On a trouvé ça pour toi"
            : step === "preview"
              ? "Prêt à commencer ?"
              : step === "activity"
                ? "C’est parti"
                : "Bien joué";

  const subtitle =
    step === "mood"
      ? "Choisis ton état actuel, puis on te proposera une micro-action."
      : step === "location"
        ? "On adapte les activités à l’endroit où tu peux vraiment agir maintenant."
        : step === "duration"
          ? "Choisis une durée réaliste. L’objectif est de commencer, pas de te charger."
          : step === "recommendations"
            ? "Choisis une activité pour transformer ton envie de scroll en action."
            : step === "preview"
              ? "Voici le résumé de ton activité avant de la lancer."
              : step === "activity"
                ? "Concentre-toi seulement sur cette petite action."
                : "Ta session est terminée.";

  function handleBack() {
    setError(null);

    if (step === "location") {
      setStep("mood");
      return;
    }

    if (step === "duration") {
      setStep("location");
      return;
    }

    if (step === "recommendations") {
      setStep("duration");
      return;
    }

    if (step === "preview") {
      setStep("recommendations");
    }
  }

  function resetFlow() {
    setStep("mood");
    setSelectedMoodId(null);
    setSelectedLocationId(null);
    setSelectedDurationId(null);
    setActivitySession(null);
    setRecommendedActivities([]);
    setSelectedActivity(null);
    setElapsedSeconds(0);
    setActivityReadyToFinish(true);
    setError(null);
    setReward(null);
  }

  async function handleDurationChoice(
    durationId: number
  ) {
    if (
      !selectedMoodId ||
      !selectedLocationId ||
      submitting
    ) {
      return;
    }

    setSelectedDurationId(durationId);
    setSubmitting(true);
    setError(null);
    setRecommendedActivities([]);
    setSelectedActivity(null);
    setActivityReadyToFinish(true);
    setReward(null);

    try {
      const data =
        await createActivitySession({
          mood_id: selectedMoodId,
          location_id: selectedLocationId,
          duration_id: durationId,
        });

      const activitiesFromApi =
        Array.isArray(data.activities)
          ? data.activities
          : [];

      setActivitySession(
        data.activity_session
      );

      setRecommendedActivities(
        activitiesFromApi
      );

      setStep("recommendations");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSelectActivity(
    activity: Activity
  ) {
    if (!activitySession) return;

    setSelectingActivity(true);
    setError(null);
    setActivityReadyToFinish(true);

    try {
      const data =
        await selectActivity(
          activitySession.id,
          activity.id
        );

      setActivitySession(
        data.activity_session
      );

      setSelectedActivity(data.activity);
      setStep("preview");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    } finally {
      setSelectingActivity(false);
    }
  }

  async function handleStartActivity() {
    if (!activitySession || !selectedActivity) {
      return;
    }

    setStartingActivity(true);
    setError(null);

    setActivityReadyToFinish(
      selectedActivity.activity_type !== "melody"
    );

    try {
      const data =
        await startActivitySession(
          activitySession.id
        );

      setActivitySession(
        data.activity_session
      );

      setSelectedActivity(data.activity);

      setElapsedSeconds(
        computeElapsedSeconds(
          data.activity_session
        )
      );

      setActivityReadyToFinish(
        data.activity.activity_type !== "melody"
      );

      setStep("activity");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    } finally {
      setStartingActivity(false);
    }
  }

  async function handlePauseActivity() {
    if (!activitySession || !selectedActivity) {
      return;
    }

    setPausingActivity(true);
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

      setSelectedActivity(data.activity);

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
      setPausingActivity(false);
    }
  }

  async function handleResumeActivity() {
    if (!activitySession || !selectedActivity) {
      return;
    }

    setResumingActivity(true);
    setError(null);

    try {
      const data =
        await resumeActivitySession(
          activitySession.id
        );

      setActivitySession(
        data.activity_session
      );

      setSelectedActivity(data.activity);

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
      setResumingActivity(false);
    }
  }

  async function handleFinishActivity() {
    if (
      !activitySession ||
      !selectedActivity ||
      !activityReadyToFinish
    ) {
      return;
    }

    setFinishingActivity(true);
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

      setSelectedActivity(data.activity);

      const rewardData =
        await loadActivityReward(
          data.activity_session.id
        );

      setReward(rewardData);

      setElapsedSeconds(
        data.activity_session.elapsed_seconds
      );

      setActivityReadyToFinish(true);
      setStep("finished");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );
    } finally {
      setFinishingActivity(false);
    }
  }

  function openResumableSession() {
    if (!resumableSession) return;

    router.push({
      pathname: "/session/[id]",
      params: {
        id: String(resumableSession.id),
      },
    });
  }

  const activityIsPaused =
    activitySession?.status === "paused";

  const activityIsInProgress =
    activitySession?.status === "in_progress";

  const finishButtonDisabled =
    finishingActivity ||
    pausingActivity ||
    resumingActivity ||
    !activityReadyToFinish;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: TA.colors.bg,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 18,
          paddingBottom: 40,
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
          <MobileNav active="new" />

          {step === "mood" &&
            resumableSession && (
              <HomeNotification
                title={
                  resumableSession.activity.name
                }
                subtitle={`${
                  resumableSession.activity.interest
                    ?.name || "Activité"
                } · ${
                  resumableSession.activity.duration
                    ?.label || ""
                }`}
                onPress={openResumableSession}
              />
            )}

          <ScreenHeader
            title={title}
            subtitle={subtitle}
          />

          {loading && <ActivityIndicator />}

          {error && (
            <ErrorBox message={error} />
          )}

          {!loading &&
            !error &&
            step === "mood" && (
              <View style={{ gap: 22 }}>
                {moods.map((mood) => (
                  <ChoiceCard
                    key={mood.id}
                    label={
                      mood.name === "Mitigé"
                        ? "Bof"
                        : mood.name
                    }
                    selected={
                      selectedMoodId === mood.id
                    }
                    onPress={() => {
                      setSelectedMoodId(mood.id);
                      setStep("location");
                    }}
                  />
                ))}
              </View>
            )}

          {!loading &&
            !error &&
            step === "location" && (
              <View style={{ gap: 22 }}>
                {locations.map((location) => {
                  const label =
                    location.name
                      .toLowerCase()
                      .includes("bureau")
                      ? "Transport"
                      : location.name;

                  return (
                    <ChoiceCard
                      key={location.id}
                      label={label}
                      selected={
                        selectedLocationId ===
                        location.id
                      }
                      onPress={() => {
                        setSelectedLocationId(
                          location.id
                        );
                        setStep("duration");
                      }}
                    />
                  );
                })}
              </View>
            )}

          {!loading &&
            !error &&
            step === "duration" && (
              <View style={{ gap: 22 }}>
                {durations.map((duration) => (
                  <ChoiceCard
                    key={duration.id}
                    label={`${duration.value} minutes`}
                    selected={
                      selectedDurationId ===
                      duration.id
                    }
                    onPress={() =>
                      handleDurationChoice(
                        duration.id
                      )
                    }
                  />
                ))}

                {submitting && (
                  <View
                    style={{
                      padding: 18,
                      borderRadius: TA.radius.card,
                      backgroundColor:
                        TA.colors.surface,
                      borderWidth: 1,
                      borderColor:
                        TA.colors.borderMedium,
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator />

                    <Text
                      style={{
                        marginTop: 10,
                        color: TA.colors.inkMuted,
                        fontFamily: TA.fonts.bold,
                      }}
                    >
                      Recherche d’une activité...
                    </Text>
                  </View>
                )}
              </View>
            )}

          {step === "recommendations" && (
            <View style={{ gap: 14 }}>
              {activitySession && (
                <SessionBadge
                  activitySession={
                    activitySession
                  }
                  activitiesCount={
                    recommendedActivities.length
                  }
                />
              )}

              {recommendedActivities.length ===
              0 ? (
                <View
                  style={{
                    padding: 20,
                    borderRadius: 24,
                    backgroundColor:
                      TA.colors.surface,
                    borderWidth: 2,
                    borderColor:
                      TA.colors.borderMedium,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: TA.fonts.black,
                      color: TA.colors.ink,
                    }}
                  >
                    Aucune activité affichée
                  </Text>

                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 15,
                      color: TA.colors.inkMuted,
                      lineHeight: 22,
                      fontFamily: TA.fonts.bold,
                    }}
                  >
                    Rails n’a pas renvoyé de
                    tableau d’activités exploitable
                    côté mobile.
                  </Text>
                </View>
              ) : (
                recommendedActivities.map(
                  (activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      selectingActivity={
                        selectingActivity
                      }
                      onSelect={
                        handleSelectActivity
                      }
                    />
                  )
                )
              )}
            </View>
          )}

          {step === "preview" &&
            selectedActivity && (
              <PreviewActivityCard
                activity={selectedActivity}
              />
            )}

          {step === "activity" &&
            selectedActivity &&
            activitySession && (
              <ActiveActivityCard
                activity={selectedActivity}
                activitySession={
                  activitySession
                }
                elapsedSeconds={elapsedSeconds}
                onActivityReadyToFinishChange={
                  setActivityReadyToFinish
                }
              />
            )}

          {step === "finished" &&
            selectedActivity &&
            reward && (
              <ActivityRewardCard
                activity={selectedActivity}
                reward={reward}
                onViewRoom={() =>
                  router.push("/explore")
                }
                onRestart={resetFlow}
              />
            )}

          {step !== "mood" &&
            step !== "activity" &&
            step !== "finished" && (
              <SecondaryButton
                label="← Retour"
                onPress={handleBack}
              />
            )}

          {step === "recommendations" && (
            <PrimaryButton
              label="Recommencer"
              onPress={resetFlow}
            />
          )}

          {step === "preview" &&
            selectedActivity && (
              <PrimaryButton
                label={
                  startingActivity
                    ? "Démarrage..."
                    : "Commencer l’activité"
                }
                onPress={handleStartActivity}
                disabled={startingActivity}
              />
            )}

          {step === "activity" &&
            selectedActivity &&
            activitySession && (
              <View style={{ gap: 12 }}>
                {activityIsInProgress && (
                  <PrimaryButton
                    label={
                      pausingActivity
                        ? "Pause..."
                        : "Pause"
                    }
                    onPress={handlePauseActivity}
                    disabled={
                      pausingActivity ||
                      finishingActivity
                    }
                  />
                )}

                {activityIsPaused && (
                  <PrimaryButton
                    label={
                      resumingActivity
                        ? "Reprise..."
                        : "Reprendre"
                    }
                    onPress={handleResumeActivity}
                    disabled={
                      resumingActivity ||
                      finishingActivity
                    }
                  />
                )}

                <PrimaryButton
                  label={
                    !activityReadyToFinish
                      ? "Joue toutes les notes pour terminer"
                      : finishingActivity
                        ? "Finalisation..."
                        : "Terminer"
                  }
                  onPress={handleFinishActivity}
                  disabled={finishButtonDisabled}
                />
              </View>
            )}

          <StepFooter step={step} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeNotification({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <View
      style={{
        marginTop: 112,
      }}
    >
      <SecondaryButton
        label={`▶ Reprendre · ${title}`}
        onPress={onPress}
      />

      <Text
        numberOfLines={1}
        style={{
          marginTop: 8,
          color: TA.colors.inkMuted,
          textAlign: "center",
          fontSize: 13,
          fontFamily: TA.fonts.bold,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function StepFooter({
  step,
}: {
  step: Step;
}) {
  const visible =
    step === "mood" ||
    step === "location" ||
    step === "duration";

  if (!visible) return null;

  const currentStep =
    step === "mood"
      ? 1
      : step === "location"
        ? 2
        : 3;

  return (
    <View
      style={{
        alignItems: "center",
        gap: 10,
        paddingTop: 18,
        paddingBottom: 8,
      }}
    >
      <Text
        style={{
          color: TA.colors.inkLight,
          fontSize: 13,
          fontFamily: TA.fonts.black,
          textTransform: "uppercase",
          letterSpacing: 1.4,
        }}
      >
        Étape {currentStep} sur 3
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        {[1, 2, 3].map((index) => (
          <View
            key={index}
            style={{
              width:
                index === currentStep ? 28 : 10,
              height: 10,
              borderRadius: 999,
              backgroundColor:
                index === currentStep
                  ? TA.colors.purple
                  : "rgba(21,27,47,0.14)",
            }}
          />
        ))}
      </View>
    </View>
  );
}
