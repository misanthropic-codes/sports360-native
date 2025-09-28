// utils/statusHelpers.ts
import { Clock, Info, Play, Trophy } from "lucide-react-native";

export const getStatusInfo = (status: string) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case "active":
    case "live":
      return { color: "#10B981", bgColor: "#ECFDF5", icon: Play };
    case "upcoming":
    case "scheduled":
      return { color: "#3B82F6", bgColor: "#EFF6FF", icon: Clock };
    case "completed":
    case "finished":
      return { color: "#8B5CF6", bgColor: "#F5F3FF", icon: Trophy };
    default:
      return { color: "#6B7280", bgColor: "#F9FAFB", icon: Info };
  }
};
