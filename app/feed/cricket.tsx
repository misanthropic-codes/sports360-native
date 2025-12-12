import React from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import OrganizerHome from "./OrganizerHome";
import PlayerHome from "./PlayerHome";

const CricketScreen = () => {
  const { user, token } = useAuth();

  // Show loading while auth is being determined
  if (!user || !token) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  const role = user?.role?.toLowerCase();

  // Route to appropriate feed based on role
  if (role === "organizer") {
    return <OrganizerHome />;
  }

  // Default to player feed (for player, ground_owner, or any other role)
  return <PlayerHome />;
};

export default CricketScreen;
