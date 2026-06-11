import { Text, View } from "react-native";

type ErrorBoxProps = {
  message: string;
};

export function ErrorBox({ message }: ErrorBoxProps) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#FFE1DD",
        borderWidth: 1,
        borderColor: "#FF9B8F",
      }}
    >
      <Text style={{ color: "#B42318", fontSize: 15, fontWeight: "700" }}>
        {message}
      </Text>
    </View>
  );
}
