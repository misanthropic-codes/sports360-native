// components/AppScreen.tsx

import React, { ReactNode } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

interface AppScreenProps {
  children: ReactNode;
}

const AppScreen: React.FC<AppScreenProps> = ({ children }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar barStyle="dark-content" />
      <View
        style={{ flex: 1, paddingHorizontal: 16, backgroundColor: "#f9fafb" }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default AppScreen;
