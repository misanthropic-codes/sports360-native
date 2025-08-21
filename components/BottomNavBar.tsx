import { usePathname, useRouter } from "expo-router";
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
  role: string; // player, groundowner, organizer
  type: string; // cricket, marathon
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ role, type }) => {
  const router = useRouter();
  const pathname = usePathname(); // ✅ gives current route path

  const navItems = [
    { name: "Teams", icon: Users, path: `/team/Myteam` },
    { name: "Activity", icon: BarChart2, path: `/matches/MatchDetail` },
    { name: "Trophy", icon: Trophy, path: `/trophies` },
    { name: "Home", icon: Home, path: `/feed/${type}` },
    { name: "Profile", icon: User, path: `/dashboard/${role}/${type}` },
  ];

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  return (
    <View className="absolute bottom-4 left-4 right-4 h-16 bg-blue-500 rounded-full flex-row items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.path); // ✅ check active via path
        return (
          <NavItem
            key={item.name}
            icon={item.icon}
            active={active}
            onPress={() => handleNavigation(item.path)}
          />
        );
      })}
    </View>
  );
};

export default BottomNavBar;
