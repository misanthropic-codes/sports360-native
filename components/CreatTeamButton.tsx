import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PlusCircle } from 'lucide-react-native';

interface CreateTeamButtonProps {
  onPress: () => void;
}

const CreateTeamButton: React.FC<CreateTeamButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-blue-500 m-4 rounded-xl p-4 flex-row items-center justify-between shadow-lg"
    >
      <View>
        <Text className="text-white font-bold text-lg">Create Your Team</Text>
        <Text className="text-blue-200 text-sm">Create Your Own Squad</Text>
      </View>
      <PlusCircle size={36} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

export default CreateTeamButton;