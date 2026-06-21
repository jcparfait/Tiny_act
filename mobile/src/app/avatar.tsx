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
import { ScreenHeader } from "../components/ScreenHeader";
import { SecondaryButton } from "../components/SecondaryButton";

import {
  AvatarName,
  isAvatarName,
} from "../constants/avatarAssets";

import { useAuth } from "../context/AuthContext";

export default function AvatarScreen() {
  const router = useRouter();

  const { user, updateProfile } = useAuth();

  const editingExistingAvatar = Boolean(user?.avatar);

  const [selectedAvatar, setSelectedAvatar] =
    useState<AvatarName | null>(
      isAvatarName(user?.avatar) ? user.avatar : null
    );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

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
        backgroundColor: "#F4EFE8",
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
            minHeight: "100%",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <ScreenHeader
            kicker="Personnalisation"
            title="Choisis ton avatar"
            subtitle="Il représentera ton profil dans Tiny Act. Tu pourras le modifier plus tard."
          />

          <View
            style={{
              padding: 24,
              borderRadius: 32,
              backgroundColor: "#151B2F",
              gap: 18,
              alignItems: "center",
            }}
          >
            <View
              style={{
                padding: 6,
                borderRadius: 999,
                backgroundColor: "#FFFFFF",
              }}
            >
              <AvatarImage
                avatar={selectedAvatar}
                size={128}
              />
            </View>

            <View
              style={{
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 27,
                  lineHeight: 33,
                  fontWeight: "900",
                  textAlign: "center",
                }}
              >
                {selectedAvatar
                  ? "Ton avatar est prêt."
                  : "Sélectionne ton avatar."}
              </Text>

              <Text
                style={{
                  color: "#FFFFFF",
                  opacity: 0.72,
                  fontSize: 15,
                  lineHeight: 22,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                L’idée n’est pas de te représenter parfaitement, mais de rendre ton espace plus personnel.
              </Text>
            </View>
          </View>

          <View
            style={{
              padding: 18,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              borderWidth: 2,
              borderColor: "rgba(90, 74, 54, 0.16)",
              gap: 16,
            }}
          >
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  color: "#7C63F2",
                  fontSize: 12,
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Avatars disponibles
              </Text>

              <Text
                style={{
                  color: "#151B2F",
                  fontSize: 24,
                  fontWeight: "900",
                }}
              >
                Choisis celui qui te parle le plus
              </Text>
            </View>

            <AvatarPicker
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
            />
          </View>

          {error && <ErrorBox message={error} />}

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
          />

          {editingExistingAvatar && (
            <MobileNav active="profile" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
