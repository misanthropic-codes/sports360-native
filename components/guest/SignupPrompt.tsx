import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface SignupPromptProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const SignupPrompt: React.FC<SignupPromptProps> = ({
  visible,
  onClose,
  title = 'Sign Up to Continue',
  message = 'Create an account to access this feature and unlock the full Sports360 experience.',
}) => {
  const router = useRouter();

  const handleSignUp = () => {
    onClose();
    router.push('/(root)/signup');
  };

  const handleLogin = () => {
    onClose();
    router.push('/(root)/login');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center self-center mb-4">
            <Feather name="lock" size={32} color="#2563EB" />
          </View>

          {/* Title */}
          <Text className="text-gray-900 font-rubikBold text-xl text-center mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-gray-600 font-rubikRegular text-base text-center mb-6">
            {message}
          </Text>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-primary py-4 rounded-xl items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-rubikBold text-base">
              Sign Up Now
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="border border-primary py-4 rounded-xl items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-primary font-rubikBold text-base">
              Log In
            </Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="py-2"
            activeOpacity={0.7}
          >
            <Text className="text-gray-500 font-rubikMedium text-sm text-center">
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SignupPrompt;
