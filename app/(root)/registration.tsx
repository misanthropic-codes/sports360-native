import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function RegistrationScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold mb-4">Registration Screen</Text>
      <Button title="Back to Welcome" onPress={() => router.push("/welcome")} />
    </View>
  );
}
