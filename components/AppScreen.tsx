import React, { ReactNode } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

interface AppScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>; // ✅ allow passing custom styles
}

const AppScreen: React.FC<AppScreenProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" />
      <View
        style={[
          { flex: 1, paddingHorizontal: 16, backgroundColor: "#f9fafb" },
          style, // ✅ merge custom styles
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default AppScreen;
