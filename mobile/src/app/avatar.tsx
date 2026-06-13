import { useEffect, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import {
  AvatarImage,
  AvatarPicker,
} from "../components/AvatarPicker";

import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";

import {
  AvatarName,
  isAvatarName,
} from "../constants/avatarAssets";

import { useAuth } from "../context/AuthContext";

export default function AvatarScreen() {
  const router = useRouter();

  const {
    user,
    updateProfile,
  } = useAuth();

  const editingExistingAvatar =
    Boolean(user?.avatar);

  const [selectedAvatar, setSelectedAvatar] =
    useState<AvatarName | null>(
      isAvatarName(user?.avatar)
        ? user.avatar
        : null
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
        editingExistingAvatar
          ? "/profile"
          : "/"
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFF4EA",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          padding: 18,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 620,
            gap: 24,
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                color: "#FF4B2B",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Personnalisation
            </Text>

            <Text
              style={{
                fontSize: 36,
                lineHeight: 42,
                color: "#17152F",
                fontWeight: "900",
              }}
            >
              Choisis ton avatar
            </Text>

            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: "#5D5A70",
              }}
            >
              Il représentera ton profil dans Tiny Act.
              Tu pourras le modifier plus tard.
            </Text>
          </View>

          {selectedAvatar && (
            <View
              style={{
                alignItems: "center",
                gap: 10,
              }}
            >
              <AvatarImage
                avatar={selectedAvatar}
                size={112}
              />

              <Text
                style={{
                  color: "#17152F",
                  fontWeight: "900",
                }}
              >
                Ton avatar
              </Text>
            </View>
          )}

          <AvatarPicker
            selectedAvatar={selectedAvatar}
            onSelect={setSelectedAvatar}
          />

          {error && <ErrorBox message={error} />}

          <PrimaryButton
            label={
              saving
                ? "Enregistrement..."
                : "Choisir cet avatar"
            }
            onPress={handleSave}
            disabled={
              saving || !selectedAvatar
            }
          />

          {editingExistingAvatar && (
            <MobileNav active="profile" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
