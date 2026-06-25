import { useEffect, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { AvatarPicker } from "../components/AvatarPicker";
import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";

import {
  AvatarName,
  isAvatarName,
} from "../constants/avatarAssets";

import { useAuth } from "../context/AuthContext";
import { TA } from "../theme/tinyActTheme";

export default function AvatarScreen() {
  const router = useRouter();

  const { user, updateProfile } = useAuth();

  const editingExistingAvatar = Boolean(user?.avatar);

  const [selectedAvatar, setSelectedAvatar] =
    useState<AvatarName | null>(
      isAvatarName(user?.avatar) ? user.avatar : null
    );

  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (isAvatarName(user?.avatar)) {
      setSelectedAvatar(user.avatar);
    }
  }, [user?.avatar]);

  async function handleSave() {
    if (!selectedAvatar) {
      setError("Choisis un avatar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProfile({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        avatar: selectedAvatar,
      });

      router.replace(
        editingExistingAvatar ? "/profile" : "/"
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Impossible d’enregistrer l’avatar."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    router.replace(
      editingExistingAvatar ? "/profile" : "/interests"
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: TA.colors.bgStart,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 131,
          zIndex: 80,
          backgroundColor: TA.colors.bgStart,
        }}
      />

      <MobileNav active="profile" />

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: TA.colors.bgStart,
        }}
        contentContainerStyle={{
          paddingTop: 125,
          paddingHorizontal: 18,
          paddingBottom: 168,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            padding: 16,
            borderRadius: 34,
            backgroundColor: TA.colors.surface,
            borderWidth: 1.5,
            borderColor: "rgba(21, 27, 47, 0.10)",
            gap: 20,
            ...TA.shadow.soft,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: TA.colors.inkLight,
                fontSize: 13,
                fontFamily: TA.fonts.black,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Personnalisation
            </Text>

            <Text
              style={{
                color: TA.colors.ink,
                fontSize: 42,
                lineHeight: 43,
                fontFamily: TA.fonts.black,
                letterSpacing: -2,
              }}
            >
              Choisis ton avatar
            </Text>
          </View>

          {error && (
            <ErrorBox message={error} />
          )}

          <View
            style={{
              padding: 18,
              borderRadius: 28,
              backgroundColor: TA.colors.surface,
              borderWidth: 2,
              borderColor: TA.colors.borderMedium,
              gap: 16,
              ...TA.shadow.card,
            }}
          >
            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: 24,
          backgroundColor: TA.colors.bgStart,
          borderTopWidth: 1,
          borderTopColor: "rgba(21, 27, 47, 0.08)",
          zIndex: 120,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            alignSelf: "center",
            gap: 10,
          }}
        >
          <PrimaryButton
            label={
              saving
                ? "Enregistrement..."
                : editingExistingAvatar
                  ? "Enregistrer cet avatar"
                  : "Entrer dans Tiny Act"
            }
            onPress={handleSave}
            disabled={saving || !selectedAvatar}
          />

          <SecondaryButton
            label={
              editingExistingAvatar
                ? "← Retour au profil"
                : "← Retour aux intérêts"
            }
            onPress={handleBack}
            disabled={saving}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
