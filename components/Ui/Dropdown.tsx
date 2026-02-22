
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const Dropdown: React.FC<DropdownProps> = ({ label, placeholder = "Select...", options, value, onSelect, icon }) => {
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">{label}</Text>}
      
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="flex-row items-center justify-between bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
      >
        <Text className={`text-base ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center items-center p-4"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="bg-white w-full max-h-[70%] rounded-2xl overflow-hidden shadow-xl">
            <View className="p-4 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
              <Text className="font-bold text-lg text-gray-800">{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`p-4 border-b border-gray-100 flex-row items-center ${item.value === value ? 'bg-purple-50' : ''}`}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  {item.value === value && <Ionicons name="checkmark" size={18} color="#7C3AED" style={{marginRight: 8}} />}
                  <Text className={`text-base ${item.value === value ? 'text-purple-700 font-bold' : 'text-gray-700'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Dropdown;
