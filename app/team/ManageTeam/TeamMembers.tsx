import React from "react";
import { View, Text } from "react-native";

type Member = {
  name: string;
  role: string;
};

const members: Member[] = [
  { name: "John Doe", role: "Captain" },
  { name: "Jane Smith", role: "Player" },
  { name: "Mike Johnson", role: "Player" },
];

const TeamMembers: React.FC = () => {
  return (
    <View className="space-y-2">
      {members.map((member, index) => (
        <View
          key={index}
          className="flex-row justify-between p-4 bg-white rounded shadow"
        >
          <Text className="text-lg">{member.name}</Text>
          <Text className="text-gray-500">{member.role}</Text>
        </View>
      ))}
    </View>
  );
};

export default TeamMembers;
