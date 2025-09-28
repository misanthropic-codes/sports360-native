import { MapPin } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface TournamentBannerProps {
  date: string; // in "MMM DD" or any string format you choose
  title: string;
  description: string;
  location: string;
  type: string;
  onJoinPress?: () => void; // Made optional since we're handling internally
}

const TournamentBanner: React.FC<TournamentBannerProps> = ({
  date,
  title,
  description,
  location,
  type,
  onJoinPress,
}) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleJoinNow = () => {
    setIsPopupVisible(true);
    setIsChecked(false); // Reset checkbox when opening
  };

  const handleConfirm = () => {
    if (isChecked) {
      console.log("Confirm button pressed");
      setIsPopupVisible(false);
      setIsChecked(false);
      // Call the original onJoinPress if provided
      if (onJoinPress) {
        onJoinPress();
      }
      // Add your join team logic here
    }
  };

  const handleCancel = () => {
    setIsPopupVisible(false);
    setIsChecked(false);
  };

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <>
      <View className="bg-blue-900 m-4 rounded-2xl p-5 overflow-hidden shadow-lg">
        {/* Decorative circles for background effect */}
        <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
        <View className="absolute -bottom-12 -left-5 w-24 h-24 bg-white/5 rounded-full" />

        <Text className="text-blue-200 text-xs font-semibold">
          {date.toUpperCase()}
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">{title}</Text>
        <Text className="text-blue-200 mt-1">{description}</Text>

        <View className="flex-row justify-between items-end mt-4">
          <View>
            <View className="bg-white/20 self-start px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">{type}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <MapPin size={14} color="#A5B4FC" />
              <Text className="text-blue-200 text-xs ml-1">{location}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleJoinNow}
            className="bg-white px-8 py-3 rounded-full shadow"
          >
            <Text className="text-blue-900 font-bold">Join Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Popup Modal */}
      <Modal
        transparent={true}
        visible={isPopupVisible}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-4"
          onPress={handleCancel}
        >
          <Pressable
            className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl mx-4"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="border-b border-gray-200 pb-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 text-center">
                Tournament Rules
              </Text>
            </View>

            {/* Terms and Conditions Checkbox */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={toggleCheckbox}
                className={`w-5 h-5 mr-3 border-2 rounded justify-center items-center ${
                  isChecked ? "border-blue-500" : "border-gray-300 bg-white"
                }`}
                style={
                  isChecked
                    ? { backgroundColor: "#166FFF", borderColor: "#166FFF" }
                    : {}
                }
              >
                {isChecked && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleCheckbox} className="flex-1">
                <Text className="text-gray-700 text-sm">
                  I agree to the rules
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View className="flex-row space-x-3">
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-red-500 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                className={`flex-1 py-3 rounded-lg ${
                  isChecked ? "opacity-100" : "opacity-50"
                }`}
                style={{ backgroundColor: "#166FFF" }}
                disabled={!isChecked}
              >
                <Text className="text-white font-semibold text-center">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default TournamentBanner;
