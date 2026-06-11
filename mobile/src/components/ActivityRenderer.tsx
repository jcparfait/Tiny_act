import { useEffect } from "react";
import { Activity } from "../types/tinyAct";

import { MelodyActivity } from "./activities/MelodyActivity";
import { QuizActivity } from "./activities/QuizActivity";
import { SentenceCompletionActivity } from "./activities/SentenceCompletionActivity";
import { StandardActivity } from "./activities/StandardActivity";
import { WordLearningActivity } from "./activities/WordLearningActivity";
import { FallbackActivity } from "./activities/shared";

type ActivityRendererProps = {
  activity: Activity;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
};

export function ActivityRenderer({
  activity,
  onActivityReadyToFinishChange,
}: ActivityRendererProps) {
  useEffect(() => {
    if (activity.activity_type !== "melody") {
      onActivityReadyToFinishChange?.(true);
    }
  }, [activity.id, activity.activity_type, onActivityReadyToFinishChange]);

  if (activity.activity_type === "standard") {
    return <StandardActivity activity={activity} />;
  }

  if (
    activity.activity_type === "culture_quiz" ||
    activity.activity_type === "code_quiz"
  ) {
    return <QuizActivity activity={activity} />;
  }

  if (activity.activity_type === "word_learning") {
    return <WordLearningActivity activity={activity} />;
  }

  if (activity.activity_type === "sentence_completion") {
    return <SentenceCompletionActivity activity={activity} />;
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
