// src/components/Select.tsx
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  containerClassName?: string;
}

export default function Select({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  containerClassName = "",
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>

      <TouchableOpacity
        className={`border rounded-lg px-3 py-3 bg-white ${
          error ? "border-red-500" : "border-gray-200"
        }`}
        onPress={() => setModalVisible(true)}
      >
        <Text className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-lg max-h-96">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {label}
              </Text>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`p-4 border-b border-gray-100 ${
                    item.value === value ? "bg-primary/10" : ""
                  }`}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    className={`${
                      item.value === value
                        ? "text-primary font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              className="p-4 bg-gray-100"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-gray-600 font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
