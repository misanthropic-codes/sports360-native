import LiveMatchCard, { LiveMatchListItem } from "@/components/LiveMatchCard";
import React from "react";
import { ScrollView, Text, View } from "react-native";

interface LiveMatchesSectionProps {
  myLiveMatches: LiveMatchListItem[];
  allLiveMatches?: LiveMatchListItem[];
  showAllMatches?: boolean;
}

const LiveMatchesSection: React.FC<LiveMatchesSectionProps> = ({
  myLiveMatches,
  allLiveMatches = [],
  showAllMatches = true,
}) => {
  if (myLiveMatches.length === 0 && (!showAllMatches || allLiveMatches.length === 0)) {
    return null;
  }

  return (
    <>
      {myLiveMatches.length > 0 && (
        <View className="mt-4 mb-2 px-4">
          <View className="flex-row items-center mb-3">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-slate-900 font-extrabold text-sm uppercase">
              Your Live Matches
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 px-4 pb-2"
          >
            {myLiveMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} variant="highlight" highlightMine />
            ))}
          </ScrollView>
        </View>
      )}

      {showAllMatches && allLiveMatches.length > 0 && (
        <View className="mt-2 mb-2 px-4">
          <View className="flex-row items-center mb-3">
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <Text className="text-slate-900 font-extrabold text-sm uppercase">
              All Ongoing Matches
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 px-4 pb-2"
          >
            {allLiveMatches.map((match) => (
              <LiveMatchCard key={match.id} match={match} variant="compact" />
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

export default LiveMatchesSection;
