export type Mood = {
  id: number;
  name: string;
};

export type Location = {
  id: number;
  name: string;
};

export type Duration = {
  id: number;
  value: number;
  label: string;
};

export type ActivitySession = {
  id: number;
  status: string;
  finished: boolean;
  elapsed_seconds: number;
  activity_id: number;
  timer_started_at?: string | null;
  language?: string | null;
};

export type QuizQuestion = {
  id: number;
  question: string;
  category?: string | null;
  family?: string | null;
  difficulty?: string | null;
  correct_answer: string;
  answers: string[];
};

export type LanguageItem = {
  id: number;
  prompt: string;
  answer: string;
  translation?: string | null;
  item_type: "word" | "sentence" | string;
  language?: string | null;
};

export type MelodyPayload = {
  name: string;
  notes: string[];
  difficulty?: string | null;
  category?: string | null;
  source?: string | null;
};

export type ActivityPayload = {
  duration_seconds?: number;
  activity_session_id?: number | null;
  quiz_kind?: "culture" | "code";
  quiz_questions?: QuizQuestion[];
  language?: string | null;
  language_label?: string | null;
  language_mode?: "word" | "sentence" | string;
  language_items?: LanguageItem[];
  melody?: MelodyPayload | null;
};

export type Activity = {
  id: number;
  name: string;
  description?: string;
  content?: string;
  activity_type: string;
  payload?: ActivityPayload;
  interest?: {
    id: number;
    name: string;
  };
  duration?: Duration;
  location?: Location;
  mood?: Mood;
};

export type ActivitySessionSummary = ActivitySession & {
  xp_earned?: number;
  created_at?: string;
  updated_at?: string;
  activity: Activity;
};

export type ActivitySessionDetailsResponse = {
  activity_session: ActivitySession;
  activities: Activity[];
};

export type CreateActivitySessionPayload = {
  mood_id: number;
  location_id: number;
  duration_id: number;
};

export type CreateActivitySessionResponse = {
  activity_session: ActivitySession;
  activities: Activity[];
};

export type ActivitySessionActionResponse = {
  activity_session: ActivitySession;
  activity: Activity;
};

export type SelectActivityResponse = ActivitySessionActionResponse;
export type StartActivitySessionResponse = ActivitySessionActionResponse;
export type PauseActivitySessionResponse = ActivitySessionActionResponse;
export type ResumeActivitySessionResponse = ActivitySessionActionResponse;
export type FinishActivitySessionResponse = ActivitySessionActionResponse;

export type InitialDataResponse = {
  moods: Mood[];
  locations: Location[];
  durations: Duration[];
};

export type Step =
  | "mood"
  | "location"
  | "duration"
  | "recommendations"
  | "preview"
  | "activity"
  | "finished";
