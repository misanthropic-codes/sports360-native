import { getBottomNavPaths } from "@/utils/navigation";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { Home, MapPin, Trophy, User, Users } from "lucide-react-native";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";

function triggerTabHaptic() {
  if (!Constants.isDevice) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

interface NavItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  active: boolean;
  onPress: () => void;
}

const NavItem = React.memo<NavItemProps>(({ icon: Icon, active, onPress }) => {
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

  const handlePress = React.useCallback(() => {
    triggerTabHaptic();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
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
});

NavItem.displayName = "NavItem";

interface BottomNavBarProps {
  role: string; // player, groundowner, organizer
  type: string; // cricket, marathon
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ role, type }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { feedPath, bookingPath, dashboardPath, normalizedRole } = React.useMemo(
    () => getBottomNavPaths(role, type),
    [role, type]
  );

  // Memoize navItems to prevent recreation on every render
  const navItems = React.useMemo(() => {
    const allItems = [
      {
        name: "Teams",
        icon: Users,
        path:
          normalizedRole === "organizer"
            ? "/team/ExploreTeams"
            : "/team/Myteam",
        roles: ["player", "organizer"],
      },
      {
        name: "Grounds",
        icon: MapPin,
        path: bookingPath,
        roles: ["player", "organizer", "ground_owner"],
      },
      { name: "Home", icon: Home, path: feedPath, roles: ["player", "organizer", "ground_owner"] },
      {
        name: "Trophy",
        icon: Trophy,
        path:
          normalizedRole === "organizer"
            ? "/tournament/MyTournaments"
            : "/tournament/ViewTournament",
        roles: ["player", "organizer", "ground_owner"],
      },
      {
        name: "Profile",
        icon: User,
        path: dashboardPath,
        roles: ["player", "organizer", "ground_owner"],
      },
    ];

    return allItems.filter((item) => item.roles.includes(normalizedRole));
  }, [normalizedRole, feedPath, bookingPath, dashboardPath]);

  const handleNavigation = React.useCallback(
    (path: string) => {
      if (pathname === path) return;
      router.replace(path as any);
    },
    [router, pathname]
  );

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
        // Special handling for Teams and Grounds tabs - highlight for any related routes
        let active;
        if (item.name === "Teams") {
          active = pathname.startsWith('/team/');
        } else if (item.name === "Grounds") {
          active = pathname.startsWith('/booking/');
        } else {
          active = pathname.startsWith(item.path);
        }
        
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

// Memoize the entire component to prevent re-renders when props don't change
export default React.memo(BottomNavBar, (prevProps, nextProps) => {
  return prevProps.role === nextProps.role && prevProps.type === nextProps.type;
});
