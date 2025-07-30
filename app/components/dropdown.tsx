import React, { FC, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

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
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

// --- Components ---

/**
 * SVG Checkmark Icon to avoid external dependencies.
 */
const CheckIcon: FC<CheckIconProps> = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-5 h-5 ${className}`}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

/**
 * A reusable dropdown item component.
 */
const DropdownItem: FC<DropdownItemProps> = ({
  label,
  onPress,
  isSelected,
}) => {
  return (
    <Pressable onPress={onPress} className="flex-row items-center p-4">
      <View className="w-6 h-6 mr-3 items-center justify-center">
        {isSelected && <CheckIcon className="text-blue-500" />}
      </View>
      <Text
        className={`text-lg ${isSelected ? "text-blue-500 font-bold" : "text-gray-800"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

/**
 * A reusable dropdown menu component.
 */
const ReusableDropdown: FC<ReusableDropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSelect = (option: string) => {
    onValueChange(option);
    setIsOpen(false);
  };

  return (
    <View className="w-full">
      {/* The button that opens the dropdown */}
      <Pressable
        onPress={() => setIsOpen(true)}
        className="w-full bg-gray-100 border border-gray-300 rounded-lg p-4 flex-row justify-between items-center"
      >
        <Text className="text-lg text-gray-800">
          {selectedValue || placeholder}
        </Text>
        {/* You can add a chevron icon here if you like */}
        <Text className="text-lg">▼</Text>
      </Pressable>

      {/* The Modal that contains the dropdown options */}
      <Modal
        transparent={true}
        visible={isOpen}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setIsOpen(false)} // Close modal on outside touch
        >
          <View
            className="w-4/5 bg-white rounded-xl shadow-lg overflow-hidden"
            // This prevents the parent Pressable from capturing the press
            onStartShouldSetResponder={() => true}
          >
            {options.map((option, index) => (
              <DropdownItem
                key={index}
                label={option}
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
