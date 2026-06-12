import { useEffect, useState } from "react";
import { Text } from "react-native";

import {
  AuthField,
  AuthScreen,
} from "../components/AuthScreen";

import { ErrorBox } from "../components/ErrorBox";
import { MobileNav } from "../components/MobileNav";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] =
    useState(user?.first_name || "");

  const [lastName, setLastName] =
    useState(user?.last_name || "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setFirstName(user?.first_name || "");
    setLastName(user?.last_name || "");
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      setSaved(true);
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Impossible de modifier le profil."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthScreen
      title="Mon profil"
      subtitle="Modifie les informations liées à ton compte."
    >
      <Text
        style={{
          color: "#5D5A70",
          fontWeight: "700",
        }}
      >
        {user?.email}
      </Text>

      <AuthField
        label="Prénom"
        value={firstName}
        onChangeText={setFirstName}
      />

      <AuthField
        label="Nom"
        value={lastName}
        onChangeText={setLastName}
      />

      {saved && (
        <Text
          style={{
            color: "#176C3A",
            fontWeight: "900",
          }}
        >
          Profil enregistré.
        </Text>
      )}

      {error && <ErrorBox message={error} />}

      <PrimaryButton
        label={
          saving
            ? "Enregistrement..."
            : "Enregistrer"
        }
        onPress={handleSave}
        disabled={saving}
      />

      <MobileNav active="profile" />
    </AuthScreen>
  );
}
