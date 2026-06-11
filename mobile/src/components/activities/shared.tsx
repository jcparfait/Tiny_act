import { Pressable, Text, View } from "react-native";
import { Activity, QuizQuestion } from "../../types/tinyAct";

export function activityMainText(activity: Activity) {
  return activity.content || activity.description || "Aucune consigne renseignée.";
}

export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function IntroCard({ label, text }: { label: string; text: string }) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 20,
        backgroundColor: "#FFF4EA",
        borderWidth: 1,
        borderColor: "#F2D7C8",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "800",
          color: "#FF4B2B",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 16,
          color: "#17152F",
          lineHeight: 24,
          fontWeight: "700",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export function QuestionCard({ question }: { question: QuizQuestion }) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 22,
        backgroundColor: "#17152F",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: "#FFFFFF",
          opacity: 0.7,
          fontWeight: "800",
          textTransform: "uppercase",
        }}
      >
        {question.family || question.category || question.difficulty || "Question"}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 19,
          color: "#FFFFFF",
          lineHeight: 27,
          fontWeight: "900",
        }}
      >
        {question.question}
      </Text>
    </View>
  );
}

export function DarkInfoBox({ title, text }: { title: string; text: string }) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 18,
        backgroundColor: "#17152F",
      }}
    >
      <Text
        style={{
          fontSize: 15,
          color: "#FFFFFF",
          lineHeight: 22,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 6,
          fontSize: 14,
          color: "#FFFFFF",
          opacity: 0.75,
          lineHeight: 20,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export function DarkButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 15,
        borderRadius: 999,
        backgroundColor: "#17152F",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: "800",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function FeedbackBox({
  success,
  text,
}: {
  success: boolean;
  text: string;
}) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 18,
        backgroundColor: success ? "#D9F8E5" : "#FFE1DD",
        borderWidth: 1,
        borderColor: success ? "#2EAD63" : "#FF4B2B",
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: success ? "#176C3A" : "#B42318",
        }}
      >
        {text}
      </Text>
    </View>
  );
}

export function ScoreCard({
  score,
  total,
  label = "Score",
}: {
  score: number;
  total: number;
  label?: string;
}) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 22,
        backgroundColor: "#17152F",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: "#FFFFFF",
          opacity: 0.7,
          fontWeight: "800",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          marginTop: 6,
          fontSize: 42,
          color: "#FFFFFF",
          fontWeight: "900",
        }}
      >
        {score}/{total}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 15,
          color: "#FFFFFF",
          opacity: 0.8,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Tu peux maintenant terminer l’activité avec le bouton en bas.
      </Text>
    </View>
  );
}

export function FallbackActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
      <IntroCard
        label={`Type : ${activity.activity_type}`}
        text={activityMainText(activity)}
      />

      <Text
        style={{
          fontSize: 14,
          color: "#5D5A70",
          lineHeight: 21,
        }}
      >
        Ce type d’activité n’a pas encore d’interface mobile dédiée.
      </Text>
    </View>
  );
}
