// app/GenerateFixtureScreen.tsx
import {
  GenerateFixturePayload,
  generateFixtures,
  getTeamsByTournament,
  Match,
  Team,
} from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";

// Components
import GenerateButton from "@/components/GenerateButton";
import MatchesList from "@/components/MatchesList";
import TeamSelection from "@/components/TeamSelection";
import TournamentHeader from "@/components/TournamentHeader";

const GenerateFixtureScreen = () => {
  const { id: tournamentId } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [fetchingTeams, setFetchingTeams] = useState(true);

  // Hardcoded groundId
  const hardcodedGroundId = "60299d7d-b9ab-4967-9052-cbbf840825de";

  // Fetch available teams
  useEffect(() => {
    if (!tournamentId || !token) return;

    const fetchTeams = async () => {
      try {
        setFetchingTeams(true);
        const teamRes = await getTeamsByTournament(tournamentId, token);
        setTeams(teamRes?.data || []);
      } catch (err) {
        console.log("Error fetching teams", err);
        Alert.alert("Error", "Failed to fetch teams for this tournament");
      } finally {
        setFetchingTeams(false);
      }
    };

    fetchTeams();
  }, [tournamentId, token]);

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleGenerate = async () => {
    if (!tournamentId || selectedTeams.length < 2) {
      Alert.alert(
        "Invalid Selection",
        "Please select at least 2 teams to generate fixtures"
      );
      return;
    }

    const payload: GenerateFixturePayload = {
      tournamentId,
      tournamentFormat: "knockout",
      teamIds: selectedTeams,
      groundId: hardcodedGroundId,
      startDate: new Date().toISOString(),
      matchDurationMinutes: 120,
      restTimeBetweenMatches: 30,
      randomizeTeams: true,
    };

    try {
      setLoading(true);
      const res = await generateFixtures(payload, token!);
      setMatches(res);

      // Show success message
      Alert.alert(
        "Success!",
        `Successfully generated ${res.length} matches for the tournament`
      );
    } catch (err) {
      console.log("Error generating fixtures", err);
      Alert.alert("Error", "Failed to generate fixtures. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!tournamentId) {
    return (
      <ScrollView className="flex-1 bg-white p-6">
        <TournamentHeader
          tournamentId="Invalid Tournament ID"
          tournamentName={""}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TournamentHeader tournamentId={tournamentId} tournamentName={""} />

      {/* Team Selection */}
      <TeamSelection
        teams={teams}
        selectedTeams={selectedTeams}
        onTeamToggle={handleTeamToggle}
      />

      {/* Generate Button */}
      <GenerateButton
        onGenerate={handleGenerate}
        loading={loading}
        disabled={fetchingTeams}
        selectedCount={selectedTeams.length}
      />

      {/* Generated Matches */}
      <MatchesList matches={matches} teams={teams} />
    </ScrollView>
  );
};

export default GenerateFixtureScreen;
