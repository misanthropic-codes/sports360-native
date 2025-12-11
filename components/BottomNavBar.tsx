import { usePathname, useRouter } from "expo-router";
import { Home, MapPin, Trophy, User, Users } from "lucide-react-native";
import React from "react";
import { Animated, TouchableOpacity, View } from "react-native";

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
});

NavItem.displayName = "NavItem";

interface BottomNavBarProps {
  role: string; // player, groundowner, organizer
  type: string; // cricket, marathon
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ role, type }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Memoize navItems to prevent recreation on every render
  const navItems = React.useMemo(() => {
    const allItems = [
      { 
        name: "Teams", 
        icon: Users, 
        path: role === "organizer" ? `/team/ExploreTeams` : `/team/Myteam`, 
        roles: ["player", "organizer"] 
      }, // Route organizers to ExploreTeams, players to Myteam
      { name: "Grounds", icon: MapPin, path: `/booking/Cricket-booking`, roles: ["player", "organizer", "ground_owner"] },
      { name: "Home", icon: Home, path: `/feed/${type}`, roles: ["player", "organizer", "ground_owner"] },
      { name: "Trophy", icon: Trophy, path: `/tournament/ViewTournament`, roles: ["player", "organizer", "ground_owner"] },
      { name: "Profile", icon: User, path: `/dashboard/${role}/${type}`, roles: ["player", "organizer", "ground_owner"] },
    ];
    
    // Filter items based on role
    return allItems.filter(item => item.roles.includes(role));
  }, [role, type]);

  // Memoize navigation handler
  const handleNavigation = React.useCallback((path: string) => {
    // Use push for instant navigation (replace is slower)
    router.push(path as any);
  }, [router]);

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

// Memoize the entire component to prevent re-renders when props don't change
export default React.memo(BottomNavBar, (prevProps, nextProps) => {
  return prevProps.role === nextProps.role && prevProps.type === nextProps.type;
});
