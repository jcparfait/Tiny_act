import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ActiveActivityCard } from "../components/ActiveActivityCard";
import { ActivityCard } from "../components/ActivityCard";
import { ChoiceCard } from "../components/ChoiceCard";
import { ErrorBox } from "../components/ErrorBox";
import { PreviewActivityCard } from "../components/PreviewActivityCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenHeader } from "../components/ScreenHeader";
import { SecondaryButton } from "../components/SecondaryButton";
import { SessionBadge } from "../components/SessionBadge";

import {
  createActivitySession,
  finishActivitySession,
  loadInitialData,
  pauseActivitySession,
  resumeActivitySession,
  selectActivity,
  startActivitySession,
} from "../services/api";

import {
  Activity,
  ActivitySession,
  Duration,
  Location,
  Mood,
  Step,
} from "../types/tinyAct";

function computeElapsedSeconds(activitySession: ActivitySession | null) {
  if (!activitySession) return 0;

  const baseElapsedSeconds = activitySession.elapsed_seconds || 0;

  if (
    activitySession.status !== "in_progress" ||
    !activitySession.timer_started_at
  ) {
    return baseElapsedSeconds;
  }

  const startedAt = new Date(activitySession.timer_started_at).getTime();
  const now = Date.now();
  const secondsSinceStart = Math.max(
    0,
    Math.floor((now - startedAt) / 1000)
  );

  return baseElapsedSeconds + secondsSinceStart;
}

export default function HomeScreen() {
  const [step, setStep] = useState<Step>("mood");

  const [moods, setMoods] = useState<Mood[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);

  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null
  );
  const [selectedDurationId, setSelectedDurationId] = useState<number | null>(
    null
  );

  const [activitySession, setActivitySession] =
    useState<ActivitySession | null>(null);
  const [recommendedActivities, setRecommendedActivities] = useState<
    Activity[]
  >([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectingActivity, setSelectingActivity] = useState(false);
  const [startingActivity, setStartingActivity] = useState(false);
  const [pausingActivity, setPausingActivity] = useState(false);
  const [resumingActivity, setResumingActivity] = useState(false);
  const [finishingActivity, setFinishingActivity] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const data = await loadInitialData();

        setMoods(data.moods);
        setLocations(data.locations);
        setDurations(data.durations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (step !== "activity" && step !== "finished") return;

    setElapsedSeconds(computeElapsedSeconds(activitySession));

    if (activitySession?.status !== "in_progress") return;

    const intervalId = setInterval(() => {
      setElapsedSeconds(computeElapsedSeconds(activitySession));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [step, activitySession]);

  const title =
    step === "mood"
      ? "Comment tu te sens ?"
      : step === "location"
        ? "Tu es où ?"
        : step === "duration"
          ? "Tu as combien de temps ?"
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
        ? "Choisis le contexte dans lequel tu peux faire ton activité."
        : step === "duration"
          ? "Choisis une durée réaliste pour commencer maintenant."
          : step === "recommendations"
            ? "Choisis une activité pour transformer ton envie de scroll en action."
            : step === "preview"
              ? "Voici le résumé de ton activité avant de la lancer."
              : step === "activity"
                ? "Concentre-toi seulement sur cette petite action."
                : "Ta session est terminée.";

  function handleContinue() {
    setError(null);

    if (step === "mood" && selectedMoodId) {
      setStep("location");
      return;
    }

    if (step === "location" && selectedLocationId) {
      setStep("duration");
    }
  }

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
    setError(null);
  }

  async function handleCreateActivitySession() {
    if (!selectedMoodId || !selectedLocationId || !selectedDurationId) return;

    setSubmitting(true);
    setError(null);
    setRecommendedActivities([]);
    setSelectedActivity(null);

    try {
      const data = await createActivitySession({
        mood_id: selectedMoodId,
        location_id: selectedLocationId,
        duration_id: selectedDurationId,
      });

      const activitiesFromApi = Array.isArray(data.activities)
        ? data.activities
        : [];

      setActivitySession(data.activity_session);
      setRecommendedActivities(activitiesFromApi);
      setStep("recommendations");

      console.log("Activity session created:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSelectActivity(activity: Activity) {
    if (!activitySession) return;

    setSelectingActivity(true);
    setError(null);

    try {
      const data = await selectActivity(activitySession.id, activity.id);

      setActivitySession(data.activity_session);
      setSelectedActivity(data.activity);
      setStep("preview");

      console.log("Activity selected:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSelectingActivity(false);
    }
  }

  async function handleStartActivity() {
    if (!activitySession || !selectedActivity) return;

    setStartingActivity(true);
    setError(null);

    try {
      const data = await startActivitySession(activitySession.id);

      setActivitySession(data.activity_session);
      setSelectedActivity(data.activity);
      setElapsedSeconds(computeElapsedSeconds(data.activity_session));
      setStep("activity");

      console.log("Activity started:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setStartingActivity(false);
    }
  }

  async function handlePauseActivity() {
    if (!activitySession || !selectedActivity) return;

    setPausingActivity(true);
    setError(null);

    try {
      const data = await pauseActivitySession(
        activitySession.id,
        elapsedSeconds
      );

      setActivitySession(data.activity_session);
      setSelectedActivity(data.activity);
      setElapsedSeconds(data.activity_session.elapsed_seconds);

      console.log("Activity paused:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setPausingActivity(false);
    }
  }

  async function handleResumeActivity() {
    if (!activitySession || !selectedActivity) return;

    setResumingActivity(true);
    setError(null);

    try {
      const data = await resumeActivitySession(activitySession.id);

      setActivitySession(data.activity_session);
      setSelectedActivity(data.activity);
      setElapsedSeconds(computeElapsedSeconds(data.activity_session));

      console.log("Activity resumed:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setResumingActivity(false);
    }
  }

  async function handleFinishActivity() {
    if (!activitySession || !selectedActivity) return;

    setFinishingActivity(true);
    setError(null);

    try {
      const data = await finishActivitySession(
        activitySession.id,
        elapsedSeconds
      );

      setActivitySession(data.activity_session);
      setSelectedActivity(data.activity);
      setElapsedSeconds(data.activity_session.elapsed_seconds);
      setStep("finished");

      console.log("Activity finished:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setFinishingActivity(false);
    }
  }

  const activityIsPaused = activitySession?.status === "paused";
  const activityIsInProgress = activitySession?.status === "in_progress";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF4EA" }}>
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
          <ScreenHeader title={title} subtitle={subtitle} />

          {loading && <ActivityIndicator />}

          {error && <ErrorBox message={error} />}

          {!loading && !error && step === "mood" && (
            <View style={{ gap: 14 }}>
              {moods.map((mood) => (
                <ChoiceCard
                  key={mood.id}
                  label={mood.name === "Mitigé" ? "Bof" : mood.name}
                  selected={selectedMoodId === mood.id}
                  onPress={() => setSelectedMoodId(mood.id)}
                />
              ))}
            </View>
          )}

          {!loading && !error && step === "location" && (
            <View style={{ gap: 14 }}>
              {locations.map((location) => (
                <ChoiceCard
                  key={location.id}
                  label={location.name}
                  selected={selectedLocationId === location.id}
                  onPress={() => setSelectedLocationId(location.id)}
                />
              ))}
            </View>
          )}

          {!loading && !error && step === "duration" && (
            <View style={{ gap: 14 }}>
              {durations.map((duration) => (
                <ChoiceCard
                  key={duration.id}
                  label={duration.label}
                  selected={selectedDurationId === duration.id}
                  onPress={() => setSelectedDurationId(duration.id)}
                />
              ))}
            </View>
          )}

          {step === "recommendations" && (
            <View style={{ gap: 14 }}>
              {activitySession && (
                <SessionBadge
                  activitySession={activitySession}
                  activitiesCount={recommendedActivities.length}
                />
              )}

              {recommendedActivities.length === 0 ? (
                <View
                  style={{
                    padding: 20,
                    borderRadius: 24,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 2,
                    borderColor: "#F2D7C8",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#17152F",
                    }}
                  >
                    Aucune activité affichée
                  </Text>

                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 15,
                      color: "#5D5A70",
                      lineHeight: 22,
                    }}
                  >
                    Rails n’a pas renvoyé de tableau d’activités exploitable côté
                    mobile.
                  </Text>
                </View>
              ) : (
                recommendedActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    selectingActivity={selectingActivity}
                    onSelect={handleSelectActivity}
                  />
                ))
              )}
            </View>
          )}

          {step === "preview" && selectedActivity && (
            <PreviewActivityCard activity={selectedActivity} />
          )}

          {step === "activity" && selectedActivity && activitySession && (
            <ActiveActivityCard
              activity={selectedActivity}
              activitySession={activitySession}
              elapsedSeconds={elapsedSeconds}
            />
          )}

          {step === "finished" && selectedActivity && activitySession && (
            <ActiveActivityCard
              activity={selectedActivity}
              activitySession={activitySession}
              elapsedSeconds={elapsedSeconds}
            />
          )}

          {step !== "mood" && step !== "activity" && step !== "finished" && (
            <SecondaryButton label="← Retour" onPress={handleBack} />
          )}

          {step === "mood" && selectedMoodId && (
            <PrimaryButton label="Continuer" onPress={handleContinue} />
          )}

          {step === "location" && selectedLocationId && (
            <PrimaryButton label="Continuer" onPress={handleContinue} />
          )}

          {step === "duration" && selectedDurationId && (
            <PrimaryButton
              label={submitting ? "Recherche..." : "Trouver une activité"}
              onPress={handleCreateActivitySession}
              disabled={submitting}
            />
          )}

          {step === "recommendations" && (
            <PrimaryButton label="Recommencer" onPress={resetFlow} />
          )}

          {step === "preview" && selectedActivity && (
            <PrimaryButton
              label={startingActivity ? "Démarrage..." : "Commencer l’activité"}
              onPress={handleStartActivity}
              disabled={startingActivity}
            />
          )}

          {step === "activity" && selectedActivity && activitySession && (
            <View style={{ gap: 12 }}>
              {activityIsInProgress && (
                <PrimaryButton
                  label={pausingActivity ? "Pause..." : "Pause"}
                  onPress={handlePauseActivity}
                  disabled={pausingActivity || finishingActivity}
                />
              )}

              {activityIsPaused && (
                <PrimaryButton
                  label={resumingActivity ? "Reprise..." : "Reprendre"}
                  onPress={handleResumeActivity}
                  disabled={resumingActivity || finishingActivity}
                />
              )}

              <PrimaryButton
                label={finishingActivity ? "Finalisation..." : "Terminer"}
                onPress={handleFinishActivity}
                disabled={
                  finishingActivity || pausingActivity || resumingActivity
                }
              />
            </View>
          )}

          {step === "finished" && (
            <PrimaryButton label="Recommencer" onPress={resetFlow} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
