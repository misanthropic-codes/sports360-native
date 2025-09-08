// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth?: string | null;
  profilePicUrl?: string;
  phone?: string;
  role: string;
  isVerified?: boolean | string;
  createdAt?: string;
  domains: string[];
  token: string;
}

interface AuthContextType {
  role: string;
  token: any;
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
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
    setToken(userData.token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
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
