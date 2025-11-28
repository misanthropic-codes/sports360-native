import { usePathname, useRouter } from "expo-router";
import {
    BarChart3,
    Calendar,
    ClipboardList,
    Home,
    MapPin,
} from "lucide-react-native";
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
          <Icon color={active ? "#16a34a" : "#FFFFFF"} size={24} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: Home, path: `/dashboard/ground_owner` },
    { name: "Grounds", icon: MapPin, path: `/ground_owner/myGrounds` },
    {
      name: "Bookings",
      icon: ClipboardList,
      path: `/ground_owner/Slots`,
    },
    {
      name: "Calendar",
      icon: Calendar,
      path: `/ground_owner/Booking`,
    },
    { name: "Analytics", icon: BarChart3, path: `/ground_owner/Analytics` },
  ];

  const handleNavigation = (path: string) => {
    router.push(path as any);
  };

  return (
    <View
      className="absolute bottom-4 left-4 right-4 h-16 bg-green-600 rounded-full flex-row items-center justify-around"
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
