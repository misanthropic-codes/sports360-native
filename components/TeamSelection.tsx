// components/TeamSelection.tsx
import { Team } from "@/api/tournamentApi";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TeamSelectionProps {
  teams: Team[];
  selectedTeams: string[];
  onTeamToggle: (teamId: string) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  teams,
  selectedTeams,
  onTeamToggle,
}) => {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-bold text-gray-800">Select Teams</Text>
        <View className="bg-purple-100 px-3 py-1 rounded-full">
          <Text className="text-purple-700 font-medium text-sm">
            {selectedTeams.length} selected
          </Text>
        </View>
      </View>

      <View className="bg-gray-50 rounded-xl p-4">
        <Text className="text-sm text-gray-600 mb-3">
          Choose at least 2 teams to generate fixtures
        </Text>

        <View className="flex-row flex-wrap -m-1">
          {teams.map((team) => {
            const isSelected = selectedTeams.includes(team.id);
            return (
              <TouchableOpacity
                key={team.id}
                className={`m-1 px-4 py-3 rounded-lg border-2 ${
                  isSelected
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white border-gray-200"
                }`}
                style={{ elevation: 0, shadowOpacity: 0 }}
                onPress={() => onTeamToggle(team.id)}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-medium ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {team.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {teams.length === 0 && (
          <View className="py-8 items-center">
            <Text className="text-gray-500 text-center">
              No teams available for this tournament
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TeamSelection;
