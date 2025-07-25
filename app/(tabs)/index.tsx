import { Text, View } from "react-native";
import "../global.css";

export default function App() {
  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-primary text-2xl font-rubikBold">
        Hello Rubik + Custom Colors
      </Text>
      <Text className="text-grayText font-rubik mt-2">
        Styled using NativeWind
      </Text>
    </View>
  );
}
