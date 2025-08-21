import React from "react";
import { Switch, Text, View } from "react-native";

interface FormSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const FormSwitch: React.FC<FormSwitchProps> = ({
  label,
  value,
  onValueChange,
}) => {
  return (
    <View className="flex-row justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
      <Text className="text-base font-semibold text-slate-700">{label}</Text>
      <Switch
        trackColor={{ false: "#E2E8F0", true: "#60A5FA" }}
        thumbColor={value ? "#2563EB" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
};

export default FormSwitch;
