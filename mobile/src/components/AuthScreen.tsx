import type { PropsWithChildren } from "react";

import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { BRAND_LOGO } from "../constants/brandAssets";
import { TA } from "../theme/tinyActTheme";

export function AuthScreen({
  title,
  subtitle,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
}>) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 42,
          paddingHorizontal: 18,
          paddingBottom: 34,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            gap: 18,
          }}
        >
          <View style={{ gap: 12 }}>
            <Image
              source={BRAND_LOGO}
              resizeMode="contain"
              style={{
                width: 190,
                height: 106,
                marginLeft: -4,
              }}
            />

            <View style={{ gap: 7 }}>
              <Text
                style={{
                  color: TA.colors.ink,
                  fontSize: 43,
                  lineHeight: 45,
                  fontFamily: TA.fonts.black,
                  letterSpacing: -2,
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  color: TA.colors.inkMuted,
                  fontSize: 17,
                  lineHeight: 24,
                  fontFamily: TA.fonts.bold,
                }}
              >
                {subtitle}
              </Text>
            </View>
          </View>

          <View
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 34,
              backgroundColor: TA.colors.surface,
              borderWidth: 1.5,
              borderColor: TA.colors.borderMedium,
              gap: 17,
              ...TA.shadow.soft,
            }}
          >
            {children}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AuthField({
  label,
  style,
  ...props
}: TextInputProps & {
  label: string;
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 14,
          lineHeight: 17,
          fontFamily: TA.fonts.black,
        }}
      >
        {label}
      </Text>

      <TextInput
        {...props}
        placeholderTextColor="#9A95A7"
        style={[
          {
            minHeight: 58,
            paddingVertical: 15,
            paddingHorizontal: 16,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: TA.colors.borderMedium,
            backgroundColor: TA.colors.surface,
            color: TA.colors.ink,
            fontSize: 16,
            fontFamily: TA.fonts.bold,
            outlineStyle: "none" as never,
          },
          style,
        ]}
      />
    </View>
  );
}

export function AuthLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 4,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <Text
        style={{
          color: TA.colors.purple,
          fontSize: 15,
          lineHeight: 19,
          fontFamily: TA.fonts.black,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SocialButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 54,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: TA.colors.borderMedium,
        backgroundColor: TA.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          color: TA.colors.ink,
          fontSize: 15,
          lineHeight: 18,
          fontFamily: TA.fonts.black,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
