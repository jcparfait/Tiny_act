import { Text, View } from "react-native";

import { Image as ExpoImage } from "expo-image";

import { getFurnitureSource } from "../constants/furnitureAssets";

import {
  Activity,
  ActivityReward,
  ActivityRewardFurniture,
} from "../types/tinyAct";

import { TA } from "../theme/tinyActTheme";

type ActivityRewardCardProps = {
  activity: Activity;
  reward: ActivityReward;
  onViewRoom?: () => void;
  onRestart?: () => void;
};

export function ActivityRewardCard({
  activity,
  reward,
}: ActivityRewardCardProps) {
  const newlyUnlocked =
    reward.newly_unlocked_furnitures || [];

  const nextFurniture =
    reward.next_furniture || null;

  const firstUnlocked = newlyUnlocked[0] || null;

  return (
    <View style={{ gap: 16 }}>
      <View
        style={{
          padding: 18,
          borderRadius: 34,
          backgroundColor: "#FFF4D8",
          borderWidth: 2,
          borderColor: "#EAD7A0",
          gap: 18,
          overflow: "hidden",
          ...TA.shadow.card,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -70,
            top: -70,
            width: 190,
            height: 190,
            borderRadius: 999,
            backgroundColor: "rgba(216, 154, 50, 0.22)",
          }}
        />

        <View
          style={{
            alignSelf: "flex-start",
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderRadius: 999,
            backgroundColor: "#DDF9E8",
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Text
            style={{
              color: "#176C3A",
              fontSize: 15,
              lineHeight: 18,
              fontFamily: TA.fonts.black,
            }}
          >
            ✓
          </Text>

          <Text
            style={{
              color: "#176C3A",
              fontSize: 13,
              lineHeight: 16,
              fontFamily: TA.fonts.black,
            }}
          >
            Terminé
          </Text>
        </View>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 33,
            lineHeight: 37,
            fontFamily: TA.fonts.black,
            letterSpacing: -1.4,
          }}
        >
          {activity.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 9,
          }}
        >
          <SummaryPill
            label="Catégorie"
            value={reward.interest.name}
          />

          <SummaryPill
            label="Durée"
            value={`${reward.duration_minutes} min`}
          />

          <SummaryPill
            label="Statut"
            value="Terminé"
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <RewardMetric
          label="Temps d’écran gagné"
          value={`${reward.saved_scroll_minutes} min`}
          description={`Tu as évité ${reward.saved_scroll_minutes} minutes de scroll.`}
          symbol="▯"
          backgroundColor="#F1F7FF"
          symbolColor="#B7AAFF"
        />

        <RewardMetric
          label="XP gagnée"
          value={`+${reward.xp_earned} XP`}
          description={`Ton intérêt ${reward.interest.name} progresse.`}
          symbol="ϟ"
          backgroundColor="#FFF4E4"
          symbolColor="#DCCBFF"
        />
      </View>

      <RoomRewardCard
        firstUnlocked={firstUnlocked}
        nextFurniture={nextFurniture}
        interestName={reward.interest.name}
      />
    </View>
  );
}

function SummaryPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: TA.colors.surface,
        gap: 4,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: TA.colors.inkLight,
          fontSize: 10,
          lineHeight: 12,
          fontFamily: TA.fonts.black,
          textTransform: "uppercase",
          letterSpacing: 1.1,
        }}
      >
        {label}
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
          color: TA.colors.ink,
          fontSize: 15,
          lineHeight: 18,
          fontFamily: TA.fonts.black,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function RewardMetric({
  label,
  value,
  description,
  symbol,
  backgroundColor,
  symbolColor,
}: {
  label: string;
  value: string;
  description: string;
  symbol: string;
  backgroundColor: string;
  symbolColor: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 178,
        padding: 16,
        borderRadius: 28,
        backgroundColor,
        borderWidth: 1.5,
        borderColor: TA.colors.borderMedium,
        overflow: "hidden",
        ...TA.shadow.soft,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 14,
          top: 22,
          width: 68,
          height: 68,
          borderRadius: 999,
          backgroundColor: symbolColor,
          opacity: 0.42,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 34,
            fontFamily: TA.fonts.black,
          }}
        >
          {symbol}
        </Text>
      </View>

      <Text
        style={{
          maxWidth: "72%",
          color: TA.colors.inkMuted,
          fontSize: 14,
          lineHeight: 17,
          fontFamily: TA.fonts.black,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: TA.colors.ink,
          fontSize: 34,
          lineHeight: 38,
          fontFamily: TA.fonts.black,
          letterSpacing: -1.5,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: TA.colors.inkMuted,
          fontSize: 14,
          lineHeight: 18,
          fontFamily: TA.fonts.bold,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

function RoomRewardCard({
  firstUnlocked,
  nextFurniture,
  interestName,
}: {
  firstUnlocked: ActivityRewardFurniture | null;
  nextFurniture: ActivityRewardFurniture | null;
  interestName: string;
}) {
  const hasUnlockedFurniture = Boolean(firstUnlocked);

  const title = hasUnlockedFurniture
    ? "Nouveau meuble débloqué !"
    : nextFurniture
      ? "Continue à progresser pour débloquer de nouveaux meubles."
      : `Tous les meubles en ${interestName} sont débloqués.`;

  const subtitle = hasUnlockedFurniture
    ? firstUnlocked?.name || "Disponible dans ta room."
    : nextFurniture
      ? `Encore ${nextFurniture.remaining_xp} XP pour ${nextFurniture.name}.`
      : "Ta room est déjà complète pour cette catégorie.";

  const imageFurniture = firstUnlocked || nextFurniture;

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 28,
        backgroundColor: "#F5EEFF",
        borderWidth: 1.5,
        borderColor: "#DFD2FF",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        ...TA.shadow.soft,
      }}
    >
      <View
        style={{
          width: 66,
          height: 66,
          borderRadius: 22,
          backgroundColor: "#F8EFD6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageFurniture ? (
          <ExpoImage
            source={getFurnitureSource(
              imageFurniture.image_key
            )}
            contentFit="contain"
            style={{
              width: 56,
              height: 56,
              opacity: hasUnlockedFurniture ? 1 : 0.55,
            }}
          />
        ) : (
          <Text
            style={{
              color: TA.colors.gold,
              fontSize: 30,
              fontFamily: TA.fonts.black,
            }}
          >
            ▰
          </Text>
        )}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 13,
            lineHeight: 16,
            fontFamily: TA.fonts.black,
          }}
        >
          Récompense room
        </Text>

        <Text
          style={{
            color: TA.colors.ink,
            fontSize: 20,
            lineHeight: 25,
            fontFamily: TA.fonts.black,
            letterSpacing: -0.7,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: TA.colors.inkMuted,
            fontSize: 13,
            lineHeight: 18,
            fontFamily: TA.fonts.bold,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
