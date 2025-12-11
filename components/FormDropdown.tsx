import React from "react";
import { Text, View } from "react-native";
import ReusableDropdown from "./dropdown";

interface FormDropdownProps {
  label: string;
  options: string[];
  displayOptions?: string[]; // Optional display labels
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const FormDropdown: React.FC<FormDropdownProps> = ({
  label,
  options,
  displayOptions,
  selectedValue,
  onValueChange,
  placeholder,
}) => {
  // Use displayOptions if provided, otherwise use options
  const displayLabels = displayOptions || options;
  
  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-slate-600 mb-2">
        {label}
      </Text>
      <ReusableDropdown
        options={options}
        displayOptions={displayLabels}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
      />
    </View>
  );
};

export default FormDropdown;
