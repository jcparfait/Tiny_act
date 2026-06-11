import { Text, View } from "react-native";
import { Activity } from "../../types/tinyAct";
import { activityMainText, IntroCard } from "./shared";

export function StandardActivity({ activity }: { activity: Activity }) {
  return (
    <View style={{ gap: 14 }}>
      <IntroCard label="À faire" text={activityMainText(activity)} />

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
