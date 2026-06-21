import { Pressable, Text, View } from "react-native";

import { Image as ExpoImage } from "expo-image";

import {
  getChoiceColor,
  getChoiceImageSource,
} from "../constants/brandAssets";

import { TA } from "../theme/tinyActTheme";

type ChoiceCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ChoiceCard({
  label,
  selected,
  onPress,
}: ChoiceCardProps) {
  const imageSource = getChoiceImageSource(label);
  const color = getChoiceColor(label);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 116,
        padding: 14,
        borderRadius: 30,
        backgroundColor: color.bg,
        borderWidth: 2,
        borderColor: selected
          ? TA.colors.purple
          : color.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        opacity: pressed ? 0.86 : 1,
        transform: [
          {
            translateY: pressed ? 1 : 0,
          },
        ],
        ...TA.shadow.webCard,
      })}
    >
      <View
        style={{
          width: 92,
          height: 92,
          borderRadius: 26,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: TA.colors.surface,
          overflow: "hidden",
        }}
      >
        {imageSource ? (
          <ExpoImage
            source={imageSource}
            contentFit="contain"
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <Text
            style={{
              color: TA.colors.purple,
              fontSize: 28,
              fontFamily: TA.fonts.black,
            }}
          >
            ✦
          </Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 31,
            lineHeight: 35,
            fontFamily: TA.fonts.black,
            color: TA.colors.ink,
            letterSpacing: -1.2,
          }}
        >
          {label}
        </Text>
      </View>

      <Text
        style={{
          color: TA.colors.purple,
          fontSize: 42,
          lineHeight: 42,
          fontFamily: TA.fonts.black,
        }}
      >
        ›
      </Text>
    </Pressable>
  );
}
