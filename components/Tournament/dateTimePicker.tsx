// src/components/DateTimePicker.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  error?: string;
  containerClassName?: string;
}

export default function CustomDateTimePicker({
  label,
  value,
  onChange,
  mode = "datetime",
  error,
  containerClassName = "",
}: DateTimePickerProps) {
  const [show, setShow] = useState(false);
  const [currentMode, setCurrentMode] = useState<"date" | "time">("date");

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || value;

    if (Platform.OS === "android") {
      setShow(false);
    }

    onChange(currentDate);

    // If datetime mode on Android, show time picker after date
    if (
      mode === "datetime" &&
      Platform.OS === "android" &&
      currentMode === "date"
    ) {
      setTimeout(() => {
        setCurrentMode("time");
        setShow(true);
      }, 100);
    }
  };

  const showPicker = () => {
    if (mode === "datetime" && Platform.OS === "android") {
      setCurrentMode("date");
    } else {
      setCurrentMode(mode as "date" | "time");
    }
    setShow(true);
  };

  const getDisplayValue = () => {
    switch (mode) {
      case "date":
        return value.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      case "time":
        return value.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
      case "datetime":
        return `${value.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })} ${value.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })}`;
      default:
        return value.toString();
    }
  };

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>

      <TouchableOpacity
        className={`border rounded-lg px-3 py-3 bg-white ${
          error ? "border-red-500" : "border-gray-200"
        }`}
        onPress={showPicker}
      >
        <Text className="text-gray-900">{getDisplayValue()}</Text>
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      {show && (
        <DateTimePicker
          value={value}
          mode={currentMode}
          is24Hour={false}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}
