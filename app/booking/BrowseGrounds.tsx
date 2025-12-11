import type { Ground } from "@/api/bookingApi";
import { getAllGrounds } from "@/api/bookingApi";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, MapPin, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BrowseGrounds() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [filteredGrounds, setFilteredGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains) ? user.domains[0] : user?.domains || "cricket";

  const fetchGrounds = async () => {
    if (!token) return;

    try {
      const data = await getAllGrounds(token);
      setGrounds(data);
      setFilteredGrounds(data);
    } catch (error) {
      console.error("Failed to fetch grounds:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGrounds();
  }, [token]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = grounds.filter(
        (ground) =>
          ground.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ground.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ground.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGrounds(filtered);
    } else {
      setFilteredGrounds(grounds);
    }
  }, [searchQuery, grounds]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGrounds();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading grounds...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1">Browse Grounds</Text>
        </View>

        {/* Search Bar */}
        <View className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex-row items-center">
          <Search size={20} color="#ffffff" />
          <TextInput
            className="flex-1 ml-3 text-white placeholder:text-white/70"
            placeholder="Search by name or location..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => router.push("/booking/SearchAvailable" as any)}
            className="flex-1 bg-blue-50 rounded-xl p-3 flex-row items-center justify-center"
          >
            <Calendar size={18} color="#3B82F6" />
            <Text className="text-blue-600 font-semibold text-sm ml-2">
              Check Availability
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      >
        {filteredGrounds.length > 0 ? (
          filteredGrounds.map((ground) => (
            <TouchableOpacity
              key={ground.id}
              onPress={() =>
                router.push({
                  pathname: "/booking/GroundDetails" as any,
                  params: { groundId: ground.id },
                })
              }
              className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
            >
              {/* Image */}
              {ground.imageUrls && (
                <Image
                  source={{ uri: ground.imageUrls.split(",")[0] }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
              )}
              {!ground.imageUrls && (
                <View className="w-full h-48 bg-gray-200 items-center justify-center">
                  <MapPin size={40} color="#9CA3AF" />
                </View>
              )}

              {/* Details */}
              <View className="p-4">
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  {ground.name || ground.groundOwnerName || "Unknown Ground"}
                </Text>

                <View className="flex-row items-center mb-3">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {ground.location || ground.address || "Location not specified"}
                  </Text>
                </View>

                {/* Pricing */}
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                  <View>
                    {ground.pricePerHour && (
                      <Text className="text-blue-600 font-bold text-lg">
                        ₹{ground.pricePerHour}/hr
                      </Text>
                    )}
                    {ground.tournamentPrice && (
                      <Text className="text-gray-500 text-xs mt-1">
                        Tournament: ₹{ground.tournamentPrice}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/booking/CreateBooking" as any,
                        params: { groundId: ground.id },
                      })
                    }
                    className="bg-blue-600 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-sm">Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center">
            <MapPin size={48} color="#CBD5E1" />
            <Text className="text-gray-400 mt-4 text-center">
              {searchQuery ? "No grounds found matching your search" : "No grounds available"}
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
}
