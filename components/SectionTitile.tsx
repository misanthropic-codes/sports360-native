import React from "react";
import { Text } from "react-native";

interface SectionTitleProps {
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <Text className="text-xl font-bold text-slate-800 px-4 mt-4 mb-2">
      {title}
    </Text>
  );
};

export default SectionTitle;
