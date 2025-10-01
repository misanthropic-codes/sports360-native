import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Post Grounds Page</Text>
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6", // Equivalent to bg-gray-100
  },
  title: {
    fontSize: 24, // Equivalent to text-2xl
    fontWeight: "bold", // Equivalent to font-bold
    color: "#2563eb", // Equivalent to text-blue-600
  },
});
