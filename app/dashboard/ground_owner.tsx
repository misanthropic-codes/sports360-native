// GroundOwnerDashboard.jsx

import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext"; // adjust path
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

const GroundOwnerDashboard = () => {
  const { user, role, token, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ground Owner Dashboard</Text>
      </View>

      <View style={styles.content}>
        {user ? (
          <>
            <Text style={styles.text}>Welcome, {user.fullName}!</Text>
            <Text style={styles.text}>Role: {role}</Text>
            <Text style={styles.text}>Email: {user.email}</Text>
            {user.phone && <Text style={styles.text}>Phone: {user.phone}</Text>}
            {user.dateOfBirth && (
              <Text style={styles.text}>DOB: {user.dateOfBirth}</Text>
            )}
            <Text style={styles.text}>Token: {token}</Text>
          </>
        ) : (
          <Text style={styles.text}>No user data found. Please login.</Text>
        )}
      </View>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default GroundOwnerDashboard;
