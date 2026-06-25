import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ActivityRenderer } from "./ActivityRenderer";

import { getActivityInterestVisual } from "../constants/activityAssets";

import {
  Activity,
  ActivitySession,
} from "../types/tinyAct";

import { TA } from "../theme/tinyActTheme";

export type ActivityFooterAction = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

export type ActivityHeaderMeta = {
  progressLabel?: string;
  subtitle?: string;
};

type ActiveActivityCardProps = {
  activity: Activity;
  activitySession: ActivitySession;
  elapsedSeconds: number;
  onActivityReadyToFinishChange?: (ready: boolean) => void;
  onFooterActionChange?: (action: ActivityFooterAction | null) => void;
};

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function activityDescription(activity: Activity) {
  return (
    activity.description ||
    activity.content ||
    "Concentre-toi sur cette petite action."
  );
}

export function ActiveActivityCard({
  activity,
  activitySession,
  elapsedSeconds,
  onActivityReadyToFinishChange,
  onFooterActionChange,
}: ActiveActivityCardProps) {
  void activitySession;

  const visual = getActivityInterestVisual(activity);

  const [headerMeta, setHeaderMeta] =
    useState<ActivityHeaderMeta | null>(null);

  useEffect(() => {
    setHeaderMeta(null);
  }, [activity.id]);

  const subtitle =
    headerMeta?.subtitle || activityDescription(activity);

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          minHeight: 154,
          padding: 16,
          borderRadius: 28,
          backgroundColor: visual.softColor,
          borderWidth: 1.5,
          borderColor: visual.color,
          overflow: "hidden",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -42,
            bottom: -48,
            width: 170,
            height: 170,
            borderRadius: 999,
            backgroundColor: visual.color,
            opacity: 0.18,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <MetaPill
              label={visual.label}
              backgroundColor={visual.color}
              foregroundColor={TA.colors.white}
            />

            <MetaPill
              label={activity.duration?.label || "Durée"}
              backgroundColor={TA.colors.surface}
              foregroundColor={TA.colors.ink}
            />
          </View>

          <View
            style={{
              minWidth: 82,
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 18,
              backgroundColor: TA.colors.surface,
              borderWidth: 1.5,
              borderColor: TA.colors.borderMedium,
              alignItems: "center",
              ...TA.shadow.soft,
            }}
          >
            <Text
              style={{
                color: TA.colors.inkLight,
                fontSize: 9,
                lineHeight: 11,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Temps
            </Text>

            <Text
              style={{
                marginTop: 2,
                color: TA.colors.ink,
                fontSize: 20,
                lineHeight: 23,
                fontFamily: TA.fonts.black,
                letterSpacing: -0.8,
              }}
            >
              {formatElapsedTime(elapsedSeconds)}
            </Text>
          </View>
        </View>

        {headerMeta?.progressLabel && (
          <Text
            numberOfLines={1}
            style={{
              marginTop: 14,
              color: visual.color,
              fontSize: 13,
              lineHeight: 16,
              fontFamily: TA.fonts.black,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            {headerMeta.progressLabel}
          </Text>
        )}

        <Text
          numberOfLines={2}
          style={{
            marginTop: headerMeta?.progressLabel ? 6 : 14,
            color: TA.colors.ink,
            fontSize: 31,
            lineHeight: 34,
            fontFamily: TA.fonts.black,
            letterSpacing: -1.2,
          }}
        >
          {activity.name}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            marginTop: 6,
            maxWidth: "88%",
            color: TA.colors.inkMuted,
            fontSize: 15,
            lineHeight: 20,
            fontFamily: TA.fonts.bold,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <ActivityRenderer
        activity={activity}
        onActivityReadyToFinishChange={
          onActivityReadyToFinishChange
        }
        onFooterActionChange={onFooterActionChange}
        onHeaderMetaChange={setHeaderMeta}
      />
    </View>
  );
}

function MetaPill({
  label,
  backgroundColor,
  foregroundColor,
}: {
  label: string;
  backgroundColor: string;
  foregroundColor: string;
}) {
  const outlined = backgroundColor === TA.colors.surface;

  return (
    <View
      style={{
        paddingVertical: 8,
        paddingHorizontal: 13,
        borderRadius: 999,
        backgroundColor,
        borderWidth: outlined ? 1.5 : 0,
        borderColor: TA.colors.borderMedium,
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: foregroundColor,
          fontSize: 13,
          fontFamily: TA.fonts.black,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
