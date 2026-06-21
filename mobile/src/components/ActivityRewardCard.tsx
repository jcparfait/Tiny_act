import { Text, View } from "react-native";
import { Image as ExpoImage } from "expo-image";

import { getFurnitureSource } from "../constants/furnitureAssets";

import {
  Activity,
  ActivityReward,
} from "../types/tinyAct";

import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

type ActivityRewardCardProps = {
  activity: Activity;
  reward: ActivityReward;
  onViewRoom: () => void;
  onRestart: () => void;
};

export function ActivityRewardCard({
  activity,
  reward,
  onViewRoom,
  onRestart,
}: ActivityRewardCardProps) {
  const newlyUnlocked =
    reward.newly_unlocked_furnitures || [];

  const nextFurniture =
    reward.next_furniture || null;

  const nextFurnitureProgress =
    nextFurniture &&
    nextFurniture.required_xp > 0
      ? Math.min(
          reward.interest_xp / nextFurniture.required_xp,
          1
        )
      : 0;

  return (
    <View style={{ gap: 18 }}>
      <View
        style={{
          padding: 24,
          borderRadius: 28,
          backgroundColor: "#151B2F",
          gap: 10,
        }}
      >
        <Text
          style={{
            color: "#68D391",
            fontSize: 13,
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Activité terminée
        </Text>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 34,
            lineHeight: 40,
            fontWeight: "900",
          }}
        >
          Bien joué !
        </Text>

        <Text
          style={{
            color: "#FFFFFF",
            opacity: 0.78,
            fontSize: 16,
            lineHeight: 23,
          }}
        >
          Tu as terminé « {activity.name} ».
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <RewardStat
          label="XP gagnée"
          value={`+${reward.xp_earned} XP`}
          description={`${reward.interest.name} progresse`}
        />

        <RewardStat
          label="Temps récupéré"
          value={`${reward.saved_scroll_minutes} min`}
          description="de scroll évité"
        />

        <RewardStat
          label="XP total"
          value={`${reward.total_xp} XP`}
          description="sur ton compte"
        />
      </View>

      {newlyUnlocked.length > 0 ? (
        <View
          style={{
            padding: 20,
            borderRadius: 26,
            backgroundColor: "#FFF0D5",
            borderWidth: 2,
            borderColor: "#F3C567",
            gap: 16,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: "#A45B00",
                fontSize: 13,
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Nouvelle récompense
            </Text>

            <Text
              style={{
                color: "#151B2F",
                fontSize: 25,
                fontWeight: "900",
              }}
            >
              Meuble débloqué !
            </Text>
          </View>

          {newlyUnlocked.map((furniture) => (
            <View
              key={furniture.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 14,
                borderRadius: 20,
                backgroundColor: "#FFFFFF",
              }}
            >
              <View
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 18,
                  backgroundColor: "#F4EFE8",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ExpoImage
                  source={getFurnitureSource(furniture.image_key)}
                  contentFit="contain"
                  style={{
                    width: 84,
                    height: 84,
                  }}
                />
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: "#7C63F2",
                    fontSize: 12,
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                >
                  {furniture.interest.name}
                </Text>

                <Text
                  style={{
                    color: "#151B2F",
                    fontSize: 20,
                    fontWeight: "900",
                  }}
                >
                  {furniture.name}
                </Text>

                <Text
                  style={{
                    color: "rgba(21, 27, 47, 0.58)",
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  Disponible dans ta salle
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={{
            padding: 20,
            borderRadius: 26,
            backgroundColor: "#FFFFFF",
            borderWidth: 2,
            borderColor: "rgba(90, 74, 54, 0.16)",
            gap: 14,
          }}
        >
          <View style={{ gap: 4 }}>
            <Text
              style={{
                color: "#7C63F2",
                fontSize: 13,
                fontWeight: "900",
                textTransform: "uppercase",
              }}
            >
              Progression de la salle
            </Text>

            <Text
              style={{
                color: "#151B2F",
                fontSize: 23,
                fontWeight: "900",
              }}
            >
              {reward.interest_xp} XP en {reward.interest.name}
            </Text>
          </View>

          {nextFurniture ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <ExpoImage
                  source={getFurnitureSource(nextFurniture.image_key)}
                  contentFit="contain"
                  style={{
                    width: 86,
                    height: 86,
                    opacity: 0.55,
                  }}
                />

                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={{
                      color: "#151B2F",
                      fontSize: 18,
                      fontWeight: "900",
                    }}
                  >
                    Prochain meuble : {nextFurniture.name}
                  </Text>

                  <Text
                    style={{
                      color: "rgba(21, 27, 47, 0.58)",
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    Encore {nextFurniture.remaining_xp} XP
                  </Text>
                </View>
              </View>

              <View
                style={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "#E7E0D8",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${nextFurnitureProgress * 100}%`,
                    height: "100%",
                    backgroundColor: "#7C63F2",
                  }}
                />
              </View>
            </>
          ) : (
            <Text
              style={{
                color: "#176C3A",
                fontWeight: "900",
                lineHeight: 22,
              }}
            >
              Tous les meubles de cette catégorie sont débloqués.
            </Text>
          )}
        </View>
      )}

      <PrimaryButton
        label="Voir ma salle"
        onPress={onViewRoom}
      />

      <SecondaryButton
        label="Recommencer une activité"
        onPress={onRestart}
      />
    </View>
  );
}

function RewardStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: 145,
        padding: 16,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "rgba(90, 74, 54, 0.16)",
        gap: 4,
      }}
    >
      <Text
        style={{
          color: "rgba(21, 27, 47, 0.58)",
          fontSize: 12,
          fontWeight: "900",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: "#151B2F",
          fontSize: 23,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: "rgba(21, 27, 47, 0.58)",
          fontSize: 12,
          fontWeight: "700",
        }}
      >
        {description}
      </Text>
    </View>
  );
}
