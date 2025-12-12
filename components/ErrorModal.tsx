import { AlertCircle, XCircle } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface ErrorModalProps {
  visible: boolean;
  type: "SESSION_EXPIRED" | "SERVER_ERROR";
  message: string;
  onDismiss: () => void;
  onLogout?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  type,
  message,
  onDismiss,
  onLogout,
}) => {
  const isSessionExpired = type === "SESSION_EXPIRED";

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center p-4"
        onPress={onDismiss}
      >
        <Pressable
          className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl mx-4"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            {isSessionExpired ? (
              <View className="bg-amber-100 p-4 rounded-full">
                <AlertCircle size={40} color="#F59E0B" />
              </View>
            ) : (
              <View className="bg-red-100 p-4 rounded-full">
                <XCircle size={40} color="#EF4444" />
              </View>
            )}
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-800 text-center mb-2">
            {isSessionExpired ? "Session Expired" : "Server Error"}
          </Text>

          {/* Message */}
          <Text className="text-gray-600 text-center mb-6">{message}</Text>

          {/* Buttons */}
          {isSessionExpired ? (
            <TouchableOpacity
              onPress={onLogout}
              className="bg-blue-600 py-3 rounded-lg"
              style={{ backgroundColor: "#166FFF" }}
            >
              <Text className="text-white font-semibold text-center">
                Logout & Login Again
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onDismiss}
              className="bg-gray-600 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Dismiss
              </Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ErrorModal;
