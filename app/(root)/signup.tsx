import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Role = 'Player' | 'Organizer' | 'Ground Owner';

import type { ColorValue } from 'react-native';

interface RoleCardProps {
  IconComponent: React.ComponentType<{ name: string; size?: number; color?: string | number | ColorValue }>;
  iconName: string;
  label: Role;
  selected: Role;
  onPress: (label: Role) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ IconComponent, iconName, label, selected, onPress }) => {
  const isOrganizer = label === 'Organizer';
  const isSelected = selected === label;

  const containerStyle = `
    flex-1 items-center justify-center bg-white rounded-2xl h-28 mx-2
    ${isSelected && isOrganizer ? 'border-2 border-purple-600' : ''}
    ${isSelected && !isOrganizer ? 'border-2 border-primary' : 'border border-gray-200'}
  `;

  const iconColor = isSelected ? (isOrganizer ? '#8B5CF6' : '#166FFF') : '#166FFF';
  const textColor = isSelected ? (isOrganizer ? 'text-purple-600' : 'text-primary') : 'text-primary';

  return (
    <TouchableOpacity className={containerStyle} onPress={() => onPress(label)}>
      <IconComponent name={iconName} size={32} color={iconColor} />
      <Text className={`mt-2 font-rubikMedium ${textColor}`}>{label}</Text>
    </TouchableOpacity>
  );
};

const App = () => {
  const [selectedRole, setSelectedRole] = useState<Role>('Organizer');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="bg-primary pt-6 pb-8 rounded-b-[40px]">
          <View className="px-5">
            <TouchableOpacity className="self-start p-2 -ml-2">
              <Feather name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-rubikBold text-3xl mt-4">
              Create Your Account
            </Text>
            <Text className="text-white font-rubik text-base mt-1">
              Join Sports360 community today !
            </Text>
          </View>
          <View className="mt-6">
            <View className="flex-row items-center px-6">
              <View className="flex-1 h-px bg-white/50" />
              <Text className="text-white font-rubikMedium mx-4">
                I want to register as
              </Text>
              <View className="flex-1 h-px bg-white/50" />
            </View>
            <View className="flex-row justify-between mt-4 px-4">
              <RoleCard
                label="Player"
                IconComponent={FontAwesome5}
                iconName="running"
                selected={selectedRole}
                onPress={setSelectedRole}
              />
              <RoleCard
                label="Organizer"
                IconComponent={Ionicons}
                iconName="briefcase"
                selected={selectedRole}
                onPress={setSelectedRole}
              />
              <RoleCard
                label="Ground Owner"
                IconComponent={MaterialCommunityIcons}
                iconName="stadium"
                selected={selectedRole}
                onPress={setSelectedRole}
              />
            </View>
          </View>
        </View>

        <View className="px-6 py-6">
          <View>
            <Text className="font-rubikMedium text-grayText">Enter full Name</Text>
            <TextInput
              className="bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2 font-rubik text-textBlack"
              placeholder="Riya Singh"
              placeholderTextColor="#C0C0C0"
            />
          </View>

          <View className="mt-4">
            <Text className="font-rubikMedium text-grayText">Enter email address</Text>
            <TextInput
              className="bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2 font-rubik text-textBlack"
              placeholder="riyasingh@gmail.com"
              placeholderTextColor="#C0C0C0"
              keyboardType="email-address"
            />
          </View>

          <View className="mt-4">
            <Text className="font-rubikMedium text-grayText">Enter phone number</Text>
            <View className="flex-row items-center bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2">
                <Text className="font-rubik text-textBlack mr-2">+91</Text>
                <TextInput
                    className="flex-1 h-full font-rubik text-textBlack"
                    placeholder="9876543210"
                    placeholderTextColor="#C0C0C0"
                    keyboardType="phone-pad"
                />
                 <TouchableOpacity>
                    <Text className="font-rubikSemiBold text-primary">Verify through OTP</Text>
                </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4">
            <Text className="font-rubikMedium text-grayText">Create password</Text>
            <View className="flex-row items-center bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2">
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="********"
                placeholderTextColor="#C0C0C0"
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color="#636364" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4">
            <Text className="font-rubikMedium text-grayText">Confirm password</Text>
            <View className="flex-row items-center bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2">
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="********"
                placeholderTextColor="#C0C0C0"
                secureTextEntry={!isConfirmPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                <Feather name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={20} color="#636364" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="bg-primary rounded-full h-14 items-center justify-center mt-8">
            <Text className="text-white font-rubikBold text-lg">SignUp</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="font-rubikMedium text-grayText">Already have an account? </Text>
            <TouchableOpacity>
              <Text className="font-rubikBold text-primary">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
