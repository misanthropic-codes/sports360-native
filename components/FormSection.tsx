import React from "react";
import { Text, View } from "react-native";

interface FormSectionProps {
  title: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title }) => {
  return (
    <View className="pt-6 pb-2">
      <Text className="text-xl font-bold text-slate-800">{title}</Text>
    </View>
  );
};

export default FormSection;
