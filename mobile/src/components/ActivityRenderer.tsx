import { useEffect, useMemo } from "react";

import { Activity } from "../types/tinyAct";

import type {
  ActivityFooterAction,
  ActivityHeaderMeta,
} from "./ActiveActivityCard";

import { MelodyActivity } from "./activities/MelodyActivity";
import { QuizActivity } from "./activities/QuizActivity";
import { SentenceCompletionActivity } from "./activities/SentenceCompletionActivity";
import { SportActivity } from "./activities/SportActivity";
import { StandardActivity } from "./activities/StandardActivity";
import { WordLearningActivity } from "./activities/WordLearningActivity";
import { FallbackActivity } from "./activities/shared";

type ActivityRendererProps = {
  activity: Activity;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
  onFooterActionChange?: (action: ActivityFooterAction | null) => void;
  onHeaderMetaChange?: (meta: ActivityHeaderMeta | null) => void;
};

function normalizeInterestName(value?: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}

function isSportActivity(activity: Activity) {
  return (
    normalizeInterestName(activity.interest?.name) === "sport" ||
    Boolean(activity.payload?.sport_plan)
  );
}

export function ActivityRenderer({
  activity,
  onActivityReadyToFinishChange,
  onFooterActionChange,
  onHeaderMetaChange,
}: ActivityRendererProps) {
  const sportActivity = useMemo(
    () => isSportActivity(activity),
    [activity]
  );

  useEffect(() => {
    onFooterActionChange?.(null);
    onHeaderMetaChange?.(null);
  }, [activity.id, onFooterActionChange, onHeaderMetaChange]);

  useEffect(() => {
    if (
      !sportActivity &&
      activity.activity_type !== "melody" &&
      activity.activity_type !== "culture_quiz" &&
      activity.activity_type !== "code_quiz" &&
      activity.activity_type !== "word_learning" &&
      activity.activity_type !== "sentence_completion"
    ) {
      onActivityReadyToFinishChange?.(true);
    }
  }, [
    activity.id,
    activity.activity_type,
    sportActivity,
    onActivityReadyToFinishChange,
  ]);

  if (sportActivity) {
    return (
      <SportActivity
        activity={activity}
        onActivityReadyToFinishChange={
          onActivityReadyToFinishChange
        }
        onFooterActionChange={onFooterActionChange}
        onHeaderMetaChange={onHeaderMetaChange}
      />
    );
  }

  if (activity.activity_type === "standard") {
    return <StandardActivity activity={activity} />;
  }

  if (
    activity.activity_type === "culture_quiz" ||
    activity.activity_type === "code_quiz"
  ) {
    return (
      <QuizActivity
        activity={activity}
        onActivityReadyToFinishChange={
          onActivityReadyToFinishChange
        }
        onFooterActionChange={onFooterActionChange}
      />
    );
  }

  if (activity.activity_type === "word_learning") {
    return (
      <WordLearningActivity
        activity={activity}
        onActivityReadyToFinishChange={
          onActivityReadyToFinishChange
        }
        onFooterActionChange={onFooterActionChange}
        onHeaderMetaChange={onHeaderMetaChange}
      />
    );
  }

  if (activity.activity_type === "sentence_completion") {
    return (
      <SentenceCompletionActivity
        activity={activity}
        onActivityReadyToFinishChange={
          onActivityReadyToFinishChange
        }
        onFooterActionChange={onFooterActionChange}
        onHeaderMetaChange={onHeaderMetaChange}
      />
    );
  }

  if (activity.activity_type === "melody") {
    return (
      <MelodyActivity
        activity={activity}
        onActivityReadyToFinishChange={onActivityReadyToFinishChange}
      />
    );
  }

  return <FallbackActivity activity={activity} />;
}
