import React from "react";
import { Text, View } from "react-native";
import ReusableDropdown from "./dropdown";

interface FormDropdownProps {
  label: string;
  options: string[];
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const FormDropdown: React.FC<FormDropdownProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-slate-600 mb-2">
        {label}
      </Text>
      <ReusableDropdown
        options={options}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
      />
    </View>
  );
};

export default FormDropdown;
