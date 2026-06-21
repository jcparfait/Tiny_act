import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { ActiveActivityCard } from "../components/ActiveActivityCard";
import { ActivityCard } from "../components/ActivityCard";
import { ActivityRewardCard } from "../components/ActivityRewardCard";
import { ChoiceCard } from "../components/ChoiceCard";
import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PreviewActivityCard } from "../components/PreviewActivityCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

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

import { loadRoom } from "../services/roomApi";

import {
  Activity,
  ActivityReward,
  ActivitySession,
  ActivitySessionSummary,
  Duration,
  Location,
  MobileRoom,
  Mood,
  RoomFurnitureItem,
  RoomInventoryItem,
  RoomResponse,
  Step,
} from "../types/tinyAct";

import {
  getFurnitureSource,
  ROOM_BACKGROUND,
} from "../constants/furnitureAssets";

import {
  BonusChallenge,
  getDailyBonusChallenge,
} from "../constants/bonusChallenges";

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

function getRemainingXp(
  furniture: RoomInventoryItem
) {
  return Math.max(
    furniture.required_xp - furniture.current_xp,
    0
  );
}

function sortFurnituresByZ(
  furnitures: RoomFurnitureItem[]
) {
  return [...furnitures].sort(
    (firstItem, secondItem) =>
      firstItem.z - secondItem.z
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

  const [roomData, setRoomData] =
    useState<RoomResponse | null>(null);

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

  const bonusChallenge = useMemo(
    () => getDailyBonusChallenge(),
    []
  );

  const nextFurniture = useMemo(() => {
    if (!roomData) return null;

    const lockedItems = roomData.inventory
      .filter((item) => !item.unlocked)
      .sort(
        (firstItem, secondItem) =>
          getRemainingXp(firstItem) -
          getRemainingXp(secondItem)
      );

    return lockedItems[0] || null;
  }, [roomData]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setError(null);

        const [
          initialData,
          sessionsData,
          loadedRoom,
        ] = await Promise.all([
          loadInitialData(),
          loadActivitySessions(),
          loadRoom(),
        ]);

        setMoods(initialData.moods);
        setLocations(initialData.locations);
        setDurations(initialData.durations);
        setRoomData(loadedRoom);

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
      ? ""
      : step === "location"
        ? "On adapte les activités à l’endroit où tu peux vraiment agir maintenant."
        : step === "duration"
          ? "Choisis une durée réaliste. L’objectif est de commencer, pas de te charger."
          : step === "recommendations"
            ? "Choisis une action."
            : step === "preview"
              ? "Voici le résumé avant de lancer l’activité."
              : step === "activity"
                ? "Concentre-toi seulement sur cette petite action."
                : "Ta session est terminée.";

  const kicker =
    step === "recommendations"
      ? "Choisis une action"
      : step === "preview"
        ? "Résumé"
        : step === "activity"
          ? "Activité"
          : step === "finished"
            ? "Récompense"
            : undefined;

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

  const showSelectionFooter =
    step === "mood" ||
    step === "location" ||
    step === "duration";

  const showBackFooter =
    step === "location" ||
    step === "duration" ||
    step === "recommendations" ||
    step === "preview";

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
          active="new"
          onLogoPress={resetFlow}
        />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 128,
            paddingHorizontal: 18,
            paddingBottom: 150,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 520,
              minHeight: "100%",
              gap: 20,
            }}
          >
            {step === "mood" && (
              <HomeNotificationBand
                room={roomData?.room || null}
                resumableSession={resumableSession}
                nextFurniture={nextFurniture}
                bonusChallenge={bonusChallenge}
                onResume={openResumableSession}
                onOpenRoom={() =>
                  router.push("/explore")
                }
                onBonusPress={() => {
                  setStep("mood");
                }}
              />
            )}

            <SelectionTitle
              kicker={kicker}
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
                        ...TA.shadow.card,
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
              <View style={{ gap: 22 }}>
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
                      ...TA.shadow.card,
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
          </View>
        </ScrollView>

        {showSelectionFooter && (
          <SelectionFooter step={step} />
        )}

        {showBackFooter && (
          <BottomBackButton onPress={handleBack} />
        )}

        {step === "preview" &&
          selectedActivity && (
            <BottomPrimaryAction
              label={
                startingActivity
                  ? "Démarrage..."
                  : "Commencer l’activité"
              }
              onPress={handleStartActivity}
              disabled={startingActivity}
            />
          )}

        {step === "recommendations" && (
          <BottomPrimaryAction
            label="Recommencer"
            onPress={resetFlow}
          />
        )}

        {step === "activity" &&
          selectedActivity &&
          activitySession && (
            <ActivityBottomActions
              activityIsInProgress={
                activityIsInProgress
              }
              activityIsPaused={activityIsPaused}
              pausingActivity={pausingActivity}
              resumingActivity={resumingActivity}
              finishingActivity={finishingActivity}
              finishButtonDisabled={
                finishButtonDisabled
              }
              activityReadyToFinish={
                activityReadyToFinish
              }
              onPause={handlePauseActivity}
              onResume={handleResumeActivity}
              onFinish={handleFinishActivity}
            />
          )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function SelectionTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      {kicker && (
        <Text
          style={{
            color: TA.colors.inkLight,
            fontSize: 13,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {kicker}
        </Text>
      )}

      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 42,
          lineHeight: 43,
          fontFamily: TA.fonts.black,
          letterSpacing: -2,
        }}
      >
        {title}
      </Text>

      {subtitle.length > 0 && (
        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 17,
            lineHeight: 24,
            fontFamily: TA.fonts.bold,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function HomeNotificationBand({
  room,
  resumableSession,
  nextFurniture,
  bonusChallenge,
  onResume,
  onOpenRoom,
  onBonusPress,
}: {
  room: MobileRoom | null;
  resumableSession: ActivitySessionSummary | null;
  nextFurniture: RoomInventoryItem | null;
  bonusChallenge: BonusChallenge;
  onResume: () => void;
  onOpenRoom: () => void;
  onBonusPress: () => void;
}) {
  const remainingXp = nextFurniture
    ? getRemainingXp(nextFurniture)
    : 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 10,
        paddingVertical: 8,
        paddingRight: 18,
      }}
      style={{
        marginHorizontal: -18,
        paddingLeft: 18,
        maxHeight: 94,
      }}
    >
      <BubbleNotification
        label="Décoration"
        icon="room"
        title="Décore ta room"
        subtitle="Place tes objets"
        color="#13A8C7"
        rotation="-1deg"
        room={room}
        onPress={onOpenRoom}
      />

      {resumableSession && (
        <BubbleNotification
          label="Reprendre"
          icon="play"
          title={resumableSession.activity.name}
          subtitle={`${
            resumableSession.activity.interest?.name ||
            "Activité"
          } · ${
            resumableSession.activity.duration?.label ||
            ""
          }`}
          color="#7C63F2"
          rotation="1deg"
          onPress={onResume}
        />
      )}

      <BubbleNotification
        label="Prochain objet"
        icon="furniture"
        title="Prochain objet débloqué"
        subtitle={
          nextFurniture
            ? `${nextFurniture.name} · ${remainingXp} XP manquants`
            : "Tout est débloqué"
        }
        color="#77B84E"
        rotation="-1.5deg"
        furniture={nextFurniture}
        onPress={onOpenRoom}
      />

      <BubbleNotification
        label="Défi du jour"
        icon="bonus"
        title={bonusChallenge.title}
        subtitle={`${bonusChallenge.rewardLabel} · ${bonusChallenge.subtitle}`}
        color="#F39A20"
        rotation="1.5deg"
        onPress={onBonusPress}
      />
    </ScrollView>
  );
}

function BubbleNotification({
  label,
  icon,
  title,
  subtitle,
  color,
  rotation,
  room,
  furniture,
  onPress,
}: {
  label: string;
  icon:
    | "room"
    | "play"
    | "furniture"
    | "bonus";
  title: string;
  subtitle: string;
  color: string;
  rotation: string;
  room?: MobileRoom | null;
  furniture?: RoomInventoryItem | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 232,
        height: 74,
        opacity: pressed ? 0.82 : 1,
        transform: [
          {
            rotate: rotation,
          },
          {
            scale: pressed ? 0.985 : 1,
          },
        ],
      })}
    >
      <View
        style={{
          position: "absolute",
          left: 5,
          right: 2,
          top: 6,
          bottom: 2,
          borderRadius: 26,
          backgroundColor: "rgba(21, 27, 47, 0.17)",
          transform: [
            {
              translateY: 5,
            },
          ],
        }}
      />

      <View
        style={{
          flex: 1,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 31,
          backgroundColor: color,
          borderWidth: 1.5,
          borderColor: TA.colors.handDrawnDark,
          paddingLeft: 68,
          paddingRight: 15,
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 16,
            top: 15,
            width: 42,
            height: 42,
            borderRadius: 17,
            backgroundColor: "rgba(255,255,255,0.32)",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {icon === "room" && (
            <RoomMiniature room={room || null} />
          )}

          {icon === "furniture" && furniture && (
            <ExpoImage
              source={getFurnitureSource(
                furniture.image_key
              )}
              contentFit="contain"
              style={{
                width: "86%",
                height: "86%",
              }}
            />
          )}

          {icon === "play" && (
            <Text
              style={{
                color: TA.colors.white,
                fontSize: 20,
                fontFamily: TA.fonts.black,
              }}
            >
              ▶
            </Text>
          )}

          {icon === "bonus" && (
            <Text
              style={{
                color: TA.colors.white,
                fontSize: 24,
                fontFamily: TA.fonts.black,
              }}
            >
              ✦
            </Text>
          )}

          {icon === "furniture" && !furniture && (
            <Text
              style={{
                color: TA.colors.white,
                fontSize: 22,
                fontFamily: TA.fonts.black,
              }}
            >
              ✓
            </Text>
          )}
        </View>

        <Text
          numberOfLines={1}
          style={{
            color: "rgba(255,255,255,0.82)",
            fontSize: 9,
            lineHeight: 11,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            marginTop: 1,
            color: TA.colors.white,
            fontSize: 16,
            lineHeight: 19,
            fontFamily: TA.fonts.black,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            marginTop: 1,
            color: "rgba(255,255,255,0.82)",
            fontSize: 11,
            lineHeight: 13,
            fontFamily: TA.fonts.bold,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

function RoomMiniature({
  room,
}: {
  room: MobileRoom | null;
}) {
  const width = 42;
  const height = 42;

  const scaleX = room?.width
    ? width / room.width
    : 1;

  const scaleY = room?.height
    ? height / room.height
    : 1;

  return (
    <View
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ExpoImage
        source={ROOM_BACKGROUND}
        contentFit="cover"
        style={{
          width,
          height,
          position: "absolute",
          left: 0,
          top: 0,
        }}
      />

      {room &&
        sortFurnituresByZ(room.furnitures).map(
          (furniture) => (
            <ExpoImage
              key={furniture.id}
              source={getFurnitureSource(
                furniture.image_key
              )}
              contentFit="contain"
              style={{
                position: "absolute",
                left: furniture.x * scaleX,
                top: furniture.y * scaleY,
                width: furniture.width * scaleX,
                height: furniture.height * scaleY,
                transform: [
                  {
                    rotate: `${furniture.rotation}deg`,
                  },
                ],
              }}
            />
          )
        )}
    </View>
  );
}

function SelectionFooter({
  step,
}: {
  step: Step;
}) {
  const currentStep =
    step === "mood"
      ? 1
      : step === "location"
        ? 2
        : 3;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: step === "mood" ? 34 : 118,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: TA.colors.inkLight,
          fontSize: 13,
          fontFamily: TA.fonts.black,
          textTransform: "uppercase",
          letterSpacing: 1.5,
        }}
      >
        Étape {currentStep} sur 3
      </Text>

      <View
        style={{
          marginTop: 12,
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
                index === currentStep ? 32 : 10,
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

function BottomBackButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 26,
      }}
    >
      <SecondaryButton
        label="← Retour"
        onPress={onPress}
      />
    </View>
  );
}

function BottomPrimaryAction({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 26,
      }}
    >
      <PrimaryButton
        label={label}
        onPress={onPress}
        disabled={disabled}
      />
    </View>
  );
}

function ActivityBottomActions({
  activityIsInProgress,
  activityIsPaused,
  pausingActivity,
  resumingActivity,
  finishingActivity,
  finishButtonDisabled,
  activityReadyToFinish,
  onPause,
  onResume,
  onFinish,
}: {
  activityIsInProgress: boolean;
  activityIsPaused: boolean;
  pausingActivity: boolean;
  resumingActivity: boolean;
  finishingActivity: boolean;
  finishButtonDisabled: boolean;
  activityReadyToFinish: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 26,
        flexDirection: "row",
        gap: 12,
      }}
    >
      {activityIsInProgress && (
        <View style={{ flex: 0.9 }}>
          <SecondaryButton
            label={
              pausingActivity
                ? "Pause..."
                : "Pause"
            }
            onPress={onPause}
            disabled={
              pausingActivity ||
              finishingActivity
            }
          />
        </View>
      )}

      {activityIsPaused && (
        <View style={{ flex: 0.9 }}>
          <SecondaryButton
            label={
              resumingActivity
                ? "Reprise..."
                : "Reprendre"
            }
            onPress={onResume}
            disabled={
              resumingActivity ||
              finishingActivity
            }
          />
        </View>
      )}

      <View style={{ flex: 1.6 }}>
        <PrimaryButton
          label={
            !activityReadyToFinish
              ? "Termine l’activité"
              : finishingActivity
                ? "Finalisation..."
                : "Terminer"
          }
          onPress={onFinish}
          disabled={finishButtonDisabled}
        />
      </View>
    </View>
  );
}
