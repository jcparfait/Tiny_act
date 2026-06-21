import type { PropsWithChildren } from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

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
        backgroundColor: "#F4EFE8",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 440,
            gap: 20,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 38,
                fontWeight: "900",
                color: "#151B2F",
              }}
            >
              {title}
            </Text>

            <Text
              style={{
                fontSize: 17,
                lineHeight: 24,
                color: "rgba(21, 27, 47, 0.58)",
              }}
            >
              {subtitle}
            </Text>
          </View>

          <View
            style={{
              padding: 22,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              borderWidth: 2,
              borderColor: "rgba(90, 74, 54, 0.16)",
              gap: 16,
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
  ...props
}: TextInputProps & {
  label: string;
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text
        style={{
          color: "#151B2F",
          fontWeight: "800",
        }}
      >
        {label}
      </Text>

      <TextInput
        {...props}
        placeholderTextColor="#8E8A9D"
        style={{
          padding: 14,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: "rgba(90, 74, 54, 0.16)",
          color: "#151B2F",
          fontSize: 16,
          outlineStyle: "none" as never,
        }}
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
    <Pressable onPress={onPress}>
      <Text
        style={{
          color: "#7C63F2",
          fontWeight: "900",
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
      style={{
        padding: 14,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#151B2F",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text
        style={{
          color: "#151B2F",
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
