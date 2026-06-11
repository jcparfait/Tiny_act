import { Text, View } from "react-native";
import { Activity } from "../types/tinyAct";

type ActivityRendererProps = {
  activity: Activity;
};

function activityMainText(activity: Activity) {
  return activity.content || activity.description || "Aucune consigne renseignée.";
}

export function ActivityRenderer({ activity }: ActivityRendererProps) {
  if (activity.activity_type === "standard") {
    return <StandardActivity activity={activity} />;
  }

  if (
    activity.activity_type === "culture_quiz" ||
    activity.activity_type === "code_quiz"
  ) {
    return <QuizActivity activity={activity} />;
  }

  if (activity.activity_type === "sentence_completion") {
    return <SentenceCompletionActivity activity={activity} />;
  }

  return <FallbackActivity activity={activity} />;
}

function StandardActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
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
          À faire
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 17,
            color: "#17152F",
            lineHeight: 25,
            fontWeight: "700",
          }}
        >
          {activityMainText(activity)}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 14,
          color: "#5D5A70",
          lineHeight: 21,
        }}
      >
        Fais simplement cette action. Pas besoin de performance : le but est de
        commencer, pas de réussir parfaitement.
      </Text>
    </View>
  );
}

function QuizActivity({ activity }: { activity: Activity }) {
  const quizLabel =
    activity.activity_type === "code_quiz" ? "Quiz code" : "Quiz culture";

  return (
    <View style={{ gap: 14 }}>
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
          {quizLabel}
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 17,
            color: "#17152F",
            lineHeight: 25,
            fontWeight: "700",
          }}
        >
          {activityMainText(activity)}
        </Text>
      </View>

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
          Le moteur de quiz mobile arrive à l’étape suivante.
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
          Pour l’instant, l’activité démarre, se met en pause, reprend et se
          termine correctement. Ensuite on affichera les vraies questions.
        </Text>
      </View>
    </View>
  );
}

function SentenceCompletionActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
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
          Phrase à compléter
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 17,
            color: "#17152F",
            lineHeight: 25,
            fontWeight: "700",
          }}
        >
          {activityMainText(activity)}
        </Text>
      </View>

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
          Le champ de réponse mobile sera ajouté ensuite.
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
          On pourra ensuite afficher une phrase avec un trou, saisir la réponse,
          valider, puis gérer les bonnes et mauvaises réponses.
        </Text>
      </View>
    </View>
  );
}

function FallbackActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
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
          Type : {activity.activity_type}
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 17,
            color: "#17152F",
            lineHeight: 25,
            fontWeight: "700",
          }}
        >
          {activityMainText(activity)}
        </Text>
      </View>

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
