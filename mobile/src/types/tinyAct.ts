export type AuthUser = {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type CurrentUserResponse = {
  user: AuthUser;
};

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

export type QuizProgress = {
  questions: QuizQuestion[];
  current_index: number;
  selected_answer: string | null;
  score: number;
  completed: boolean;
};

export type WordLearningProgress = {
  items: LanguageItem[];
  current_index: number;
  show_translation: boolean;
  completed: boolean;
};

export type SentenceFeedback =
  | "correct"
  | "wrong"
  | "revealed"
  | null;

export type SentenceCompletionProgress = {
  items: LanguageItem[];
  current_index: number;
  input_value: string;
  attempts: number;
  score: number;
  feedback: SentenceFeedback;
  completed: boolean;
};

export type MelodyProgress = {
  notes: string[];
  current_index: number;
  played_notes: string[];
  wrong_note: string | null;
  completed: boolean;
};

export type ActivityProgressData = {
  quiz?: QuizProgress;
  word_learning?: WordLearningProgress;
  sentence_completion?: SentenceCompletionProgress;
  melody?: MelodyProgress;
};

export type ActivityProgressResponse = {
  activity_session_id: number;
  progress_data: ActivityProgressData;
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

export type SelectActivityResponse =
  ActivitySessionActionResponse;

export type StartActivitySessionResponse =
  ActivitySessionActionResponse;

export type PauseActivitySessionResponse =
  ActivitySessionActionResponse;

export type ResumeActivitySessionResponse =
  ActivitySessionActionResponse;

export type FinishActivitySessionResponse =
  ActivitySessionActionResponse;

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
