import React, { ReactNode } from "react";
import { Text, View } from "react-native";

interface InfoRowProps {
  icon: ReactNode; // Any valid React element, e.g., an icon component
  title: string;
  subtitle: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, title, subtitle }) => {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="mr-4">{icon}</View>
      <View>
        <Text className="text-base font-bold text-slate-800">{title}</Text>
        <Text className="text-sm text-slate-500">{subtitle}</Text>
      </View>
    </View>
  );
};

export default InfoRow;
