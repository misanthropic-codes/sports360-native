// components/Tournament/InfoCard.tsx
import React from "react";
import { Text, View } from "react-native";

interface InfoCardProps {
  title: string;
  icon: React.ReactElement<any>;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

const InfoCard = ({
  title,
  icon,
  color = "#6B7280",
  bgColor = "#F8FAFC",
  children,
}: InfoCardProps) => (
  <View
    className="bg-white rounded-2xl p-5 shadow-sm mb-4"
    style={{ backgroundColor: bgColor }}
  >
    <View className="flex-row items-center mb-3">
      {React.cloneElement(icon, { size: 22, color })}
      <Text className="ml-3 text-lg font-bold" style={{ color }}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

export default InfoCard;
