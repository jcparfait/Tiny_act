import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

import {
  loadActivityProgress,
  saveActivityProgress,
} from "../../services/api";

import {
  Activity,
  SportPlanStep,
  SportProgress,
} from "../../types/tinyAct";

import { TA } from "../../theme/tinyActTheme";

import type {
  ActivityFooterAction,
  ActivityHeaderMeta,
} from "../ActiveActivityCard";

type SportPhase =
  | "preview"
  | "preparation"
  | "step"
  | "finished";

type SportActivityProps = {
  activity: Activity;
  onActivityReadyToFinishChange?: (
    ready: boolean
  ) => void;
  onFooterActionChange?: (
    action: ActivityFooterAction | null
  ) => void;
  onHeaderMetaChange?: (
    meta: ActivityHeaderMeta | null
  ) => void;
};

function validProgress(
  value: SportProgress | undefined
): value is SportProgress {
  return (
    value !== undefined &&
    typeof value.phase === "string" &&
    typeof value.current_index === "number" &&
    typeof value.completed === "boolean"
  );
}

function formatTimer(totalSeconds?: number | null) {
  if (
    totalSeconds === null ||
    totalSeconds === undefined
  ) {
    return "";
  }

  const safeSeconds = Math.max(
    0,
    Number(totalSeconds || 0)
  );

  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function stepKindLabel(kind?: string | null) {
  if (kind === "warmup") return "Échauffement";
  if (kind === "rest") return "Pause";
  if (kind === "cooldown") return "Retour au calme";
  if (kind === "instruction") return "Consigne";

  return "Exercice";
}

function stepColor(kind?: string | null) {
  if (kind === "rest") return "#13A8C7";
  if (kind === "warmup") return "#F39A20";
  if (kind === "cooldown") return "#8AD6C9";
  if (kind === "instruction") return "#7C63F2";

  return "#92BD73";
}

function stepDurationLabel(step: SportPlanStep) {
  if (!step.duration_seconds) return "Libre";

  return formatTimer(step.duration_seconds);
}

function fallbackStepsFromText(
  activity: Activity
): SportPlanStep[] {
  const source =
    activity.content ||
    activity.description ||
    "Réalise cette activité à ton rythme.";

  const matches = source.match(
    /(?:^|\s)\d+\)\s*(.*?)(?=\s+\d+\)|$)/g
  );

  if (!matches) {
    return [
      {
        kind: "exercise",
        text: source,
        duration_seconds: null,
        auto_advance: false,
        loop: false,
      },
    ];
  }

  return matches
    .map((match) =>
      match.replace(/^\s*\d+\)\s*/, "").trim()
    )
    .filter(Boolean)
    .map((text) => ({
      kind: text.toLowerCase().includes("récup")
        ? "rest"
        : "exercise",
      text,
      duration_seconds: null,
      auto_advance: false,
      loop: true,
    }));
}

export function SportActivity({
  activity,
  onActivityReadyToFinishChange,
  onFooterActionChange,
  onHeaderMetaChange,
}: SportActivityProps) {
  const sessionId =
    activity.payload?.activity_session_id || null;

  const sportPlan =
    activity.payload?.sport_plan || null;

  const steps = useMemo(
    () =>
      sportPlan?.steps?.length
        ? sportPlan.steps
        : fallbackStepsFromText(activity),
    [activity, sportPlan]
  );

  const preparationSeconds = Number(
    sportPlan?.preparation_seconds || 30
  );

  const [phase, setPhase] =
    useState<SportPhase>("preview");

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState<number | null>(null);

  const [completed, setCompleted] =
    useState(false);

  const [progressLoaded, setProgressLoaded] =
    useState(false);

  const currentStep = steps[currentIndex] || null;

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setProgressLoaded(false);
      setPhase("preview");
      setCurrentIndex(0);
      setRemainingSeconds(null);
      setCompleted(false);

      if (!sessionId) {
        setProgressLoaded(true);
        return;
      }

      try {
        const response =
          await loadActivityProgress(sessionId);

        if (cancelled) return;

        const saved =
          response.progress_data.sport;

        if (validProgress(saved)) {
          const safeIndex = Math.min(
            Math.max(saved.current_index || 0, 0),
            Math.max(steps.length - 1, 0)
          );

          setPhase(
            saved.completed
              ? "finished"
              : saved.phase
          );

          setCurrentIndex(safeIndex);

          setRemainingSeconds(
            typeof saved.remaining_seconds === "number"
              ? saved.remaining_seconds
              : null
          );

          setCompleted(saved.completed);
        }
      } catch (error) {
        console.warn(
          "Impossible de charger le parcours sport",
          error
        );
      } finally {
        if (!cancelled) {
          setProgressLoaded(true);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [activity.id, sessionId, steps.length]);

  useEffect(() => {
    onActivityReadyToFinishChange?.(completed);
  }, [
    completed,
    onActivityReadyToFinishChange,
  ]);

  useEffect(() => {
    if (!progressLoaded || !sessionId) return;

    const timeoutId = setTimeout(() => {
      saveActivityProgress(sessionId, {
        sport: {
          phase,
          current_index: currentIndex,
          remaining_seconds: remainingSeconds,
          completed,
        },
      }).catch((error) => {
        console.warn(
          "Impossible de sauvegarder le parcours sport",
          error
        );
      });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [
    completed,
    currentIndex,
    phase,
    progressLoaded,
    remainingSeconds,
    sessionId,
  ]);

  useEffect(() => {
    if (!progressLoaded) return;

    const progressLabel =
      phase === "preview"
        ? `Parcours · ${steps.length} étape(s)`
        : phase === "preparation"
          ? `Préparation · ${formatTimer(
              remainingSeconds
            )}`
          : phase === "step"
            ? `Étape ${currentIndex + 1}/${
                steps.length
              } · ${stepKindLabel(
                currentStep?.kind
              )}`
            : "Parcours terminé";

    const subtitle =
      phase === "preview"
        ? `${formatTimer(
            preparationSeconds
          )} de préparation, puis suis les étapes une par une.`
        : phase === "preparation"
          ? "Mets-toi en place avant le départ."
          : phase === "step"
            ? currentStep?.text ||
              "Continue l’exercice."
            : "Tu peux maintenant valider l’activité.";

    onHeaderMetaChange?.({
      progressLabel,
      subtitle,
    });
  }, [
    currentIndex,
    currentStep?.kind,
    currentStep?.text,
    onHeaderMetaChange,
    phase,
    preparationSeconds,
    progressLoaded,
    remainingSeconds,
    steps.length,
  ]);

  useEffect(() => {
    if (!progressLoaded) return;

    if (phase === "preview") {
      onFooterActionChange?.({
        label: "Lancer l’activité",
        onPress: startPreparation,
      });

      return;
    }

    if (phase === "preparation") {
      onFooterActionChange?.({
        label: "Passer la préparation",
        onPress: startFirstStep,
      });

      return;
    }

    if (phase === "step") {
      onFooterActionChange?.({
        label:
          currentIndex >= steps.length - 1
            ? "Terminer le parcours"
            : "Passer cette étape",
        onPress: goNextStep,
      });

      return;
    }

    onFooterActionChange?.(null);
  }, [
    currentIndex,
    onFooterActionChange,
    phase,
    progressLoaded,
    steps.length,
  ]);

  useEffect(() => {
    const timerIsActive =
      progressLoaded &&
      (phase === "preparation" ||
        phase === "step") &&
      typeof remainingSeconds === "number" &&
      remainingSeconds > 0;

    if (!timerIsActive) return;

    const intervalId = setInterval(() => {
      setRemainingSeconds((currentValue) => {
        if (
          currentValue === null ||
          currentValue === undefined
        ) {
          return currentValue;
        }

        return Math.max(currentValue - 1, 0);
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    phase,
    progressLoaded,
    remainingSeconds,
  ]);

  useEffect(() => {
    if (!progressLoaded) return;

    const shouldAutoAdvance =
      (phase === "preparation" ||
        phase === "step") &&
      remainingSeconds === 0;

    if (!shouldAutoAdvance) return;

    const timeoutId = setTimeout(() => {
      if (phase === "preparation") {
        startFirstStep();
      } else if (phase === "step") {
        goNextStep();
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [
    phase,
    progressLoaded,
    remainingSeconds,
  ]);

  function startPreparation() {
    if (steps.length === 0) return;

    setCompleted(false);
    setCurrentIndex(0);
    setPhase("preparation");
    setRemainingSeconds(preparationSeconds);
  }

  function startFirstStep() {
    if (steps.length === 0) {
      finishSport();
      return;
    }

    const firstStep = steps[0];

    setCurrentIndex(0);
    setPhase("step");

    setRemainingSeconds(
      firstStep.duration_seconds
        ? Number(firstStep.duration_seconds)
        : null
    );
  }

  function goNextStep() {
    if (phase === "preparation") {
      startFirstStep();
      return;
    }

    if (currentIndex >= steps.length - 1) {
      finishSport();
      return;
    }

    const nextIndex = currentIndex + 1;
    const nextStep = steps[nextIndex];

    setCurrentIndex(nextIndex);
    setPhase("step");

    setRemainingSeconds(
      nextStep.duration_seconds
        ? Number(nextStep.duration_seconds)
        : null
    );
  }

  function finishSport() {
    setPhase("finished");
    setCompleted(true);
    setRemainingSeconds(null);
  }

  if (!progressLoaded) {
    return (
      <View
        style={{
          padding: 18,
          alignItems: "center",
          gap: 10,
        }}
      >
        <ActivityIndicator />

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 13,
            fontFamily: TA.fonts.bold,
          }}
        >
          Chargement du parcours…
        </Text>
      </View>
    );
  }

  if (phase === "preview") {
    return (
      <View style={{ gap: 10 }}>
        <View
          style={{
            padding: 14,
            borderRadius: 24,
            backgroundColor: "#F0FAEA",
            borderWidth: 1.5,
            borderColor: "#92BD73",
            gap: 8,
          }}
        >
          <Text
            style={{
              color: "#77A956",
              fontSize: 12,
              lineHeight: 15,
              fontFamily: TA.fonts.black,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Parcours complet
          </Text>

          <Text
            style={{
              color: TA.colors.ink,
              fontSize: 17,
              lineHeight: 23,
              fontFamily: TA.fonts.black,
            }}
          >
            {steps.length} étape(s) issues du plan sport.
          </Text>

          <Text
            style={{
              color: TA.colors.inkMuted,
              fontSize: 13,
              lineHeight: 18,
              fontFamily: TA.fonts.bold,
            }}
          >
            Tu verras d’abord la préparation, puis chaque étape
            une par une.
          </Text>
        </View>

        <View style={{ gap: 7 }}>
          <StepPreviewCard
            index={0}
            label="Préparation"
            text="Prépare-toi avant le départ."
            durationLabel={formatTimer(preparationSeconds)}
            color="#92BD73"
          />

          {steps.map((step, index) => (
            <StepPreviewCard
              key={`${step.text}-${index}`}
              index={index + 1}
              label={stepKindLabel(step.kind)}
              text={step.text}
              durationLabel={stepDurationLabel(step)}
              color={stepColor(step.kind)}
            />
          ))}
        </View>
      </View>
    );
  }

  if (phase === "preparation") {
    return (
      <CountdownCard
        label="Préparation"
        title="Prépare-toi"
        text="Place-toi correctement avant le départ."
        time={formatTimer(remainingSeconds)}
        color="#92BD73"
      />
    );
  }

  if (phase === "finished") {
    return (
      <View
        style={{
          padding: 16,
          borderRadius: 24,
          backgroundColor: "#EAF8EF",
          borderWidth: 1.5,
          borderColor: "#2EAD63",
          gap: 8,
        }}
      >
        <Text
          style={{
            color: "#176C3A",
            fontSize: 12,
            lineHeight: 15,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Parcours terminé
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 20,
            lineHeight: 25,
            fontFamily: TA.fonts.black,
          }}
        >
          Bravo, toutes les étapes sont faites.
        </Text>

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: TA.fonts.bold,
          }}
        >
          Tu peux maintenant valider l’activité avec le bouton en bas.
        </Text>
      </View>
    );
  }

  return (
    <CurrentSportStepCard
      step={currentStep}
      currentIndex={currentIndex}
      totalSteps={steps.length}
      remainingSeconds={remainingSeconds}
    />
  );
}

function CurrentSportStepCard({
  step,
  currentIndex,
  totalSteps,
  remainingSeconds,
}: {
  step: SportPlanStep | null;
  currentIndex: number;
  totalSteps: number;
  remainingSeconds: number | null;
}) {
  const color = stepColor(step?.kind);

  return (
    <View
      style={{
        padding: 18,
        borderRadius: 28,
        backgroundColor: TA.colors.surface,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        gap: 18,
        ...TA.shadow.soft,
      }}
    >
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: TA.colors.inkLight,
            fontSize: 13,
            lineHeight: 16,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1.4,
          }}
        >
          Étape {currentIndex + 1} / {totalSteps}
        </Text>

        <Text
          style={{
            color,
            fontSize: 12,
            lineHeight: 15,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {stepKindLabel(step?.kind)}
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 34,
            lineHeight: 38,
            fontFamily: TA.fonts.black,
            letterSpacing: -1.6,
          }}
        >
          {step?.text || "Continue l’exercice."}
        </Text>
      </View>

      <View
        style={{
          alignSelf: "flex-start",
          minWidth: 128,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 28,
          backgroundColor: "#F0FAEA",
          borderWidth: 1.5,
          borderColor: "#D7EBCB",
        }}
      >
        <Text
          style={{
            color: "#4F8D38",
            fontSize: 46,
            lineHeight: 50,
            fontFamily: TA.fonts.black,
            letterSpacing: -1.8,
          }}
        >
          {remainingSeconds === null
            ? "Libre"
            : formatTimer(remainingSeconds)}
        </Text>
      </View>
    </View>
  );
}

function StepPreviewCard({
  index,
  label,
  text,
  durationLabel,
  color,
}: {
  index: number;
  label: string;
  text: string;
  durationLabel: string;
  color: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: TA.colors.surface,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: TA.colors.white,
            fontSize: 12,
            fontFamily: TA.fonts.black,
          }}
        >
          {index}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color,
            fontSize: 11,
            lineHeight: 14,
            fontFamily: TA.fonts.black,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          {label} · {durationLabel}
        </Text>

        <Text
          numberOfLines={3}
          style={{
            marginTop: 2,
            color: TA.colors.ink,
            fontSize: 14,
            lineHeight: 18,
            fontFamily: TA.fonts.bold,
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

function CountdownCard({
  label,
  title,
  text,
  time,
  color,
}: {
  label: string;
  title: string;
  text: string;
  time: string;
  color: string;
}) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 24,
        backgroundColor: "#F0FAEA",
        borderWidth: 1.5,
        borderColor: color,
        gap: 12,
      }}
    >
      <Text
        style={{
          color,
          fontSize: 12,
          lineHeight: 15,
          fontFamily: TA.fonts.black,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: TA.colors.ink,
              fontSize: 25,
              lineHeight: 29,
              fontFamily: TA.fonts.black,
              letterSpacing: -1,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: TA.colors.inkMuted,
              fontSize: 14,
              lineHeight: 20,
              fontFamily: TA.fonts.bold,
            }}
          >
            {text}
          </Text>
        </View>

        <View
          style={{
            minWidth: 102,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 22,
            backgroundColor: TA.colors.surface,
            borderWidth: 1.5,
            borderColor: TA.colors.borderMedium,
            alignItems: "center",
            ...TA.shadow.soft,
          }}
        >
          <Text
            style={{
              color: TA.colors.inkLight,
              fontSize: 10,
              lineHeight: 12,
              fontFamily: TA.fonts.black,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Départ
          </Text>

          <Text
            style={{
              marginTop: 2,
              color: TA.colors.ink,
              fontSize: 32,
              lineHeight: 36,
              fontFamily: TA.fonts.black,
              letterSpacing: -1.2,
            }}
          >
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
}
