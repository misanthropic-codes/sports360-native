import { usePathname, useRouter } from "expo-router";
import { BarChart2, Home, Trophy, User, Users } from "lucide-react-native";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";

interface NavItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  active: boolean;
  onPress: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, active, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(active ? 1 : 0)).current;
  const opacityAnim = React.useRef(new Animated.Value(active ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: active ? 1 : 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: active ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active]);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center p-2"
      activeOpacity={0.7}
    >
      <View className="relative w-12 h-8 items-center justify-center">
        {/* Background circle with smooth animation */}
        <Animated.View
          className="absolute inset-0 bg-white rounded-full"
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        />
        {/* Icon */}
        <View className="items-center justify-center z-10">
          <Icon color={active ? "#3B82F6" : "#FFFFFF"} size={24} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface BottomNavBarProps {
  role: string; // player, groundowner, organizer
  type: string; // cricket, marathon
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ role, type }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Move Home button to center in array
  const navItems = [
    { name: "Teams", icon: Users, path: `/team/Myteam` },
    { name: "Activity", icon: BarChart2, path: `/booking/Cricket-booking` },
    { name: "Home", icon: Home, path: `/feed/${type}` }, // center
    { name: "Trophy", icon: Trophy, path: `/tournament/ViewTournament` },
    { name: "Profile", icon: User, path: `/dashboard/${role}/${type}` },
  ];

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  return (
    <View
      className="absolute bottom-4 left-4 right-4 h-16 bg-blue-500 rounded-full flex-row items-center justify-around"
      style={{
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      }}
    >
      {navItems.map((item) => {
        const active = pathname.startsWith(item.path);
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
