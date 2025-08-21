import { CheckSquare, User, Users } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface RegistrationCardProps {
  type: "Team" | "Individual";
  price: string;
  priceSubtitle: string;
  features: string[];
  onRegisterPress: () => void;
}

const RegistrationCard: React.FC<RegistrationCardProps> = ({
  type,
  price,
  priceSubtitle,
  features,
  onRegisterPress,
}) => {
  const isTeam = type === "Team";
  const Icon = isTeam ? Users : User;

  return (
    <View className="bg-slate-50 rounded-2xl p-5 mx-4 my-2 border border-slate-200">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <View className="bg-blue-100 p-3 rounded-lg mr-3">
            <Icon size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-800">
              Register As {type}
            </Text>
            {isTeam && (
              <Text className="text-xs text-slate-500">
                Register as a complete team.
              </Text>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-slate-800">{price}</Text>
          <Text className="text-xs text-slate-500">{priceSubtitle}</Text>
        </View>
      </View>

      <View className="my-4">
        {features.map((feature, index) => (
          <View
            key={`${feature}-${index}`}
            className="flex-row items-center mb-2"
          >
            <CheckSquare size={16} color="#3B82F6" />
            <Text className="text-slate-600 ml-2">{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={onRegisterPress}
        className="bg-blue-500 w-full py-4 rounded-lg items-center justify-center shadow"
      >
        <Text className="text-white font-bold text-base">Register {type}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegistrationCard;
