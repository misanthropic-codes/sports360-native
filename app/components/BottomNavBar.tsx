import { useRouter } from "expo-router";
import { BarChart2, Home, Trophy, User, Users } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface NavItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  active: boolean;
  onPress: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 items-center justify-center p-2"
  >
    <View
      className={`w-12 h-8 rounded-full items-center justify-center ${
        active ? "bg-white" : ""
      }`}
    >
      <Icon color={active ? "#3B82F6" : "#FFFFFF"} size={24} />
    </View>
  </TouchableOpacity>
);

interface BottomNavBarProps {
  activeScreen: string;
  setActiveScreen: (screenName: string) => void;
  role: string; // player, groundowner, organizer
  type: string; // cricket, marathon
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  setActiveScreen,
  role,
  type,
}) => {
  const router = useRouter();

  const navItems = [
    { name: "Teams", icon: Users },
    { name: "Activity", icon: BarChart2 },
    { name: "Trophy", icon: Trophy },
    { name: "Home", icon: Home },
    { name: "Profile", icon: User },
  ];

  const handleNavigation = (screenName: string) => {
    setActiveScreen(screenName);

    switch (screenName) {
      case "Home":
        router.push(`/feed/${type}` as any); // /feed/cricket or /feed/marathon
        break;
      case "Activity":
        router.push(`/matches/MatchDetail`);
        break;
      case "Teams":
        router.push(`/Team/Myteam` as any);
        break;
      case "Profile":
        router.push(`/dashboard/${role}/${type}` as any);
        break;
      case "Trophy":
        // Add your Trophy navigation if needed
        router.push(`/trophies` as any);
        break;
    }
  };

  return (
    <View className="absolute bottom-4 left-4 right-4 h-16 bg-blue-500 rounded-full flex-row items-center justify-around shadow-lg">
      {navItems.map((item) => (
        <NavItem
          key={item.name}
          icon={item.icon}
          active={activeScreen === item.name}
          onPress={() => handleNavigation(item.name)}
        />
      ))}
    </View>
  );
};

export default BottomNavBar;
