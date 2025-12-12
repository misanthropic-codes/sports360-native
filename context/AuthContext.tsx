// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

// Import all stores for logout cleanup
import { useBookingStore } from "@/store/bookingStore";
import { useGroundStore as useMainGroundStore } from "@/store/groundStore";
import { useGroundStore as useBookingGroundStore } from "@/store/groundTStore";
import { useOrganizerStore } from "@/store/organizerAnalyticsStore";
import { usePlayerAnalyticsStore } from "@/store/playerAnalyticsStore";
import { useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useTeamStore } from "@/store/teamStore";
import { useTournamentStore } from "@/store/tournamentStore";
import { useUserStore } from "@/store/userStore";

export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  profilePicUrl?: string;
  phone: string;
  passwordHash?: string; // From backend, should not be used in frontend
  role: "player" | "organizer" | "ground_owner";
  isVerified: string; // Backend returns as string "false" or "true"
  createdAt: string;
  domains?: string[]; // Optional, populated after onboarding
  token?: string; // Optional, obtained from login
}

interface AuthContextType {
  role: string;
  token: any;
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(parsedUser.token);
      }
    };
    loadUser();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    setToken(userData.token || null);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      console.warn("Cannot update user: no user is logged in");
      return;
    }

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("✅ User updated in AuthContext:", updates);
  };

  const logout = async () => {
    console.log("🚪 Logging out - clearing all cached data...");
    
    // Clear AuthContext state
    setUser(null);
    setToken(null);
    
    // Clear all Zustand stores
    try {
      // Team stores
      useTeamStore.getState().invalidateCache();
      useTeamDetailsStore.getState().invalidateAllCache();
      
      // Tournament store
      useTournamentStore.getState().invalidateCache();
      
      // User & Analytics stores
      useUserStore.getState().invalidateCache();
      usePlayerAnalyticsStore.getState().invalidateCache();
      useOrganizerStore.getState().resetStore();
      
      // Booking & Ground stores
      useBookingStore.getState().invalidateAllCache();
      useMainGroundStore.getState().invalidateGroundsCache();
      useBookingGroundStore.getState().resetStore();
      
      console.log("✅ All Zustand stores cleared");
    } catch (error) {
      console.error("❌ Error clearing Zustand stores:", error);
    }
    
    // Clear ALL AsyncStorage data
    try {
      await AsyncStorage.clear();
      console.log("✅ AsyncStorage cleared");
    } catch (error) {
      console.error("❌ Error clearing AsyncStorage:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role: user?.role ?? "",
        token,
        user,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
