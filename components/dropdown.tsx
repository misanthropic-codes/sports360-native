import { ChevronDown } from "lucide-react-native";
import React, { FC, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

// --- Type Definitions ---
interface CheckIconProps {
  className?: string;
}
interface DropdownItemProps {
  label: string;
  onPress: () => void;
  isSelected: boolean;
}
interface ReusableDropdownProps {
  options: string[];
  displayOptions?: string[]; // Optional display labels
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

// --- Components ---
const CheckIcon: FC<CheckIconProps> = () => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    style={{ width: 20, height: 20 }}
  >
    <Polyline
      points="20 6 9 17 4 12"
      stroke="#4F46E5" // Changed to match theme color
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DropdownItem: FC<DropdownItemProps> = ({
  label,
  onPress,
  isSelected,
}) => {
  return (
    <Pressable onPress={onPress} className="flex-row items-center p-4">
      <View className="w-6 h-6 mr-3 items-center justify-center">
        {isSelected && <CheckIcon />}
      </View>
      <Text
        className={`text-base ${isSelected ? "text-indigo-600 font-bold" : "text-slate-800"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const ReusableDropdown: FC<ReusableDropdownProps> = ({
  options,
  displayOptions,
  selectedValue,
  onValueChange,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Use displayOptions if provided, otherwise use options
  const displayLabels = displayOptions || options;

  const handleSelect = (option: string) => {
    onValueChange(option);
    setIsOpen(false);
  };
  
  // Get display label for selected value
  const getDisplayLabel = (value: string | null): string | null => {
    if (!value) return null;
    const index = options.indexOf(value);
    return index !== -1 ? displayLabels[index] : value;
  };

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="bg-white border border-slate-300 rounded-lg p-3 h-14 flex-row justify-between items-center"
      >
        <Text
          className={
            selectedValue
              ? "text-base text-slate-900"
              : "text-base text-slate-400"
          }
        >
          {getDisplayLabel(selectedValue) || placeholder}
        </Text>
        <ChevronDown size={20} color="#64748B" />
      </Pressable>

      <Modal
        transparent={true}
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50 p-8"
          onPress={() => setIsOpen(false)}
        >
          <View
            className="w-full bg-white rounded-xl shadow-lg overflow-hidden"
            onStartShouldSetResponder={() => true}
          >
            {options.map((option, index) => (
              <DropdownItem
                key={index}
                label={displayLabels[index]}
                isSelected={option === selectedValue}
                onPress={() => handleSelect(option)}
              />
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ReusableDropdown;
