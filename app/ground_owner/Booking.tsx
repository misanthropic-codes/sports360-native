import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { useGroundOwnerStore } from "@/store/groundOwnerStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const GroundListScreen: React.FC = () => {
  const { token } = useAuth();
  const router = useRouter();
  
  // Use ground owner store with caching
  const {
    bookingRequests,
    bookingRequestsLoading,
    bookingRequestsError,
    fetchBookingRequests,
  } = useGroundOwnerStore();
  
  const [refreshing, setRefreshing] = useState(false);

  const FIXED_IMAGE =
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2505&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Fetch booking requests with smart caching
  useEffect(() => {
    if (token) {
      fetchBookingRequests(token); // Smart fetch - only if not cached
    }
  }, [token]);

  // Pull to refresh handler
  const onRefresh = async () => {
    if (!token) return;
    
    setRefreshing(true);
    await fetchBookingRequests(token, true); // Force refresh
    setRefreshing(false);
  };

  const handleGroundPress = (item: any) => {
    router.push({
      pathname: "/ground_owner/BookingRequest",
      params: { groundData: JSON.stringify(item) }
    } as any);
  };

  // Show loading only when data is being fetched from backend (not from cache)
  if (bookingRequestsLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          backgroundColor="#4CAF50"
          barStyle="light-content"
          translucent={false}
        />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading grounds...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#4CAF50"
        barStyle="light-content"
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ground Booking Requests</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
      >
        {bookingRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No booking requests found</Text>
            <Text style={styles.emptySubtext}>
              New booking requests will appear here
            </Text>
          </View>
        ) : (
          bookingRequests.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.groundCard}
              activeOpacity={0.8}
              onPress={() => handleGroundPress(item)}
            >
              {/* Always use the fixed Unsplash image */}
              <Image
                source={{ uri: FIXED_IMAGE }}
                style={styles.groundImage}
                resizeMode="cover"
              />

              <View style={styles.cardContent}>
                <Text style={styles.groundName}>
                  {item.ground.groundOwnerName}
                </Text>
                <Text style={styles.groundLocation}>
                  {item.ground.primaryLocation}
                </Text>
                <Text style={styles.bookingCount}>
                  {item.bookings.length} booking request
                  {item.bookings.length > 1 ? "s" : ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNavBar />
    </SafeAreaView>
  );
};

export default GroundListScreen;

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  header: {
    backgroundColor: "#4CAF50",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },

  groundCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    overflow: "hidden",
  },
  groundImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#EAEAEA",
  },
  cardContent: {
    padding: 16,
  },
  groundName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  groundLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  bookingCount: {
    fontSize: 13,
    color: "#4CAF50",
    marginTop: 6,
    fontWeight: "600",
  },

  emptyState: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
});
