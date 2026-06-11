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
};

export type Activity = {
  id: number;
  name: string;
  description?: string;
  content?: string;
  activity_type: string;
  interest?: {
    id: number;
    name: string;
  };
  duration?: Duration;
  location?: Location;
  mood?: Mood;
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

export type SelectActivityResponse = {
  activity_session: ActivitySession;
  activity: Activity;
};

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
  | "preview";
