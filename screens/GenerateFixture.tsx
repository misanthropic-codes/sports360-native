// src/screens/GenerateFixtureScreen.tsx
import { GenerateFixturePayload } from "@/api/tournamentApi";
import CustomDateTimePicker from "@/components/Tournament/dateTimePicker";
import Input from "@/components/Tournament/Input";
import MultiSelect from "@/components/Tournament/MultiSelect";
import Select from "@/components/Tournament/Select";
import Toggle from "@/components/Tournament/Toggle";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFetchGrounds } from "../app/hooks/useFetchGrounds";
import { useFetchTeams } from "../app/hooks/useFetchTeams";
import { useGenerateFixtures } from "../app/hooks/useGenerateFixtures";
type RootStackParamList = {
  GenerateFixture: { tournamentId: string };
  FixturePreview: { matches: any[]; payload: GenerateFixturePayload };
};

type GenerateFixtureScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "GenerateFixture"
>;
type GenerateFixtureScreenRouteProp = RouteProp<
  RootStackParamList,
  "GenerateFixture"
>;

interface Props {
  navigation: GenerateFixtureScreenNavigationProp;
  route: GenerateFixtureScreenRouteProp;
}

export default function GenerateFixtureScreen({ navigation, route }: Props) {
  const { tournamentId } = route.params;

  // State for form fields
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedGround, setSelectedGround] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [matchDuration, setMatchDuration] = useState<string>("90");
  const [restTime, setRestTime] = useState<string>("15");
  const [format, setFormat] = useState<string>("knockout");
  const [randomizeTeams, setRandomizeTeams] = useState<boolean>(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks
  const {
    teams,
    loading: teamsLoading,
    error: teamsError,
  } = useFetchTeams(tournamentId);
  const {
    grounds,
    loading: groundsLoading,
    error: groundsError,
  } = useFetchGrounds();
  const { loading: generating, generate } = useGenerateFixtures();

  // Team and ground options
  const teamOptions = teams.map((team) => ({
    label: team.name,
    value: team.id,
  }));

  const groundOptions = grounds.map((ground) => ({
    label: ground.name,
    value: ground.id,
  }));

  const formatOptions = [
    { label: "Knockout", value: "knockout" },
    { label: "Round Robin", value: "round-robin" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedTeams.length < 2) {
      newErrors.teams = "Please select at least 2 teams";
    }

    if (!selectedGround) {
      newErrors.ground = "Please select a ground";
    }

    if (!matchDuration || parseInt(matchDuration) <= 0) {
      newErrors.matchDuration = "Please enter a valid match duration";
    }

    if (!restTime || parseInt(restTime) < 0) {
      newErrors.restTime = "Please enter a valid rest time";
    }

    if (startDate < new Date()) {
      newErrors.startDate = "Start date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    const payload: GenerateFixturePayload = {
      tournamentId,
      tournamentFormat: format as "knockout" | "round-robin",
      teamIds: selectedTeams,
      groundId: selectedGround,
      startDate: startDate.toISOString(),
      matchDurationMinutes: parseInt(matchDuration),
      restTimeBetweenMatches: parseInt(restTime),
      randomizeTeams,
    };

    try {
      const matches = await generate(payload, teams, grounds);
      navigation.navigate("FixturePreview", { matches, payload });
    } catch (error) {
      Alert.alert("Error", "Failed to generate fixtures. Please try again.");
    }
  };

  const isLoading = teamsLoading || groundsLoading || generating;
  const hasError = teamsError || groundsError;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6A4CFF" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-4">
          {teamsError || groundsError}
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Generate Fixtures
        </Text>

        <MultiSelect
          label="Select Teams"
          values={selectedTeams}
          onValuesChange={setSelectedTeams}
          options={teamOptions}
          placeholder="Choose teams for the tournament"
          error={errors.teams}
        />

        <Select
          label="Ground"
          value={selectedGround}
          onValueChange={setSelectedGround}
          options={groundOptions}
          placeholder="Select a ground"
          error={errors.ground}
        />

        <CustomDateTimePicker
          label="Start Date & Time"
          value={startDate}
          onChange={setStartDate}
          mode="datetime"
          error={errors.startDate}
        />

        <Input
          label="Match Duration (minutes)"
          value={matchDuration}
          onChangeText={setMatchDuration}
          keyboardType="numeric"
          placeholder="90"
          error={errors.matchDuration}
        />

        <Input
          label="Rest Time Between Matches (minutes)"
          value={restTime}
          onChangeText={setRestTime}
          keyboardType="numeric"
          placeholder="15"
          error={errors.restTime}
        />

        <Select
          label="Tournament Format"
          value={format}
          onValueChange={setFormat}
          options={formatOptions}
        />

        <Toggle
          label="Randomize Teams"
          value={randomizeTeams}
          onToggle={setRandomizeTeams}
        />
      </ScrollView>

      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className={`py-4 px-6 rounded-lg ${
            selectedTeams.length >= 2 && selectedGround && !generating
              ? "bg-primary"
              : "bg-gray-300"
          }`}
          onPress={handleGenerate}
          disabled={selectedTeams.length < 2 || !selectedGround || generating}
        >
          {generating ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold ml-2">
                Generating...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-center text-lg">
              Generate Fixtures
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
