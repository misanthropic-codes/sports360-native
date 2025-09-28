// src/components/MultiSelect.tsx
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  error?: string;
  containerClassName?: string;
}

export default function MultiSelect({
  label,
  values,
  onValuesChange,
  options,
  placeholder = "Select options",
  error,
  containerClassName = "",
}: MultiSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));
  const displayText =
    selectedOptions.length > 0
      ? selectedOptions.length === 1
        ? selectedOptions[0].label
        : `${selectedOptions.length} teams selected`
      : placeholder;

  const toggleOption = (value: string) => {
    if (values.includes(value)) {
      onValuesChange(values.filter((v) => v !== value));
    } else {
      onValuesChange([...values, value]);
    }
  };

  const selectAll = () => {
    onValuesChange(options.map((opt) => opt.value));
  };

  const clearAll = () => {
    onValuesChange([]);
  };

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>

      <TouchableOpacity
        className={`border rounded-lg px-3 py-3 bg-white ${
          error ? "border-red-500" : "border-gray-200"
        }`}
        onPress={() => setModalVisible(true)}
      >
        <Text
          className={
            selectedOptions.length > 0 ? "text-gray-900" : "text-gray-400"
          }
        >
          {displayText}
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
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                {label}
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-primary px-3 py-2 rounded-lg"
                  onPress={selectAll}
                >
                  <Text className="text-white text-sm font-medium">
                    Select All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="border border-gray-300 px-3 py-2 rounded-lg"
                  onPress={clearAll}
                >
                  <Text className="text-gray-700 text-sm font-medium">
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${
                    values.includes(item.value) ? "bg-primary/10" : ""
                  }`}
                  onPress={() => toggleOption(item.value)}
                >
                  <Text
                    className={`${
                      values.includes(item.value)
                        ? "text-primary font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {values.includes(item.value) && (
                    <View className="w-5 h-5 bg-primary rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              className="p-4 bg-gray-100"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center text-gray-600 font-medium">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
