// GroundOwnerDashboard.tsx
import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ---------------------- TYPES ----------------------
interface Summary {
  totalMyRequests: number;
  myPendingRequests: number;
  myApprovedRequests: number;
  myRejectedRequests: number;
  totalGroundRequests: number;
  groundPendingRequests: number;
  groundApprovedRequests: number;
  groundRejectedRequests: number;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

interface Ground {
  id: string;
  userId: string;
  groundOwnerName: string;
  ownerName: string;
  groundType: string;
  yearsOfOperation: string;
  primaryLocation: string;
  facilityAvailable: string;
  bookingFrequency: string;
  groundDescription: string;
  imageUrls: string;
  acceptOnlineBookings: boolean;
  allowTournamentsBookings: boolean;
  receiveGroundAvailabilityNotifications: boolean;
}

interface BookingRequest {
  id: string;
  userId: string;
  groundId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  tournamentId: string;
  status: string;
  message: string;
  requestedAt: string;
  reviewedAt: string;
  reviewedBy: string;
  rejectionReason: string | null;
  ground: Ground;
  user: User;
}

interface BookingStatusResponse {
  message: string;
  userRole: string;
  summary: Summary;
  data: {
    myBookingRequests: BookingRequest[];
    groundBookingRequests: BookingRequest[];
  };
}

// ---------------------- COMPONENT ----------------------
const GroundOwnerDashboard: React.FC = () => {
  const { user, role, token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [groundInfo, setGroundInfo] = useState<Ground | null>(null);

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const response = await fetch(
          "http://172.20.10.4:8080/api/v1/booking/status",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data: BookingStatusResponse = await response.json();

        if (data?.summary) setSummary(data.summary);
        if (data?.data?.groundBookingRequests)
          setBookings(data.data.groundBookingRequests);

        if (data?.data?.groundBookingRequests?.length > 0) {
          setGroundInfo(data.data.groundBookingRequests[0].ground);
        }
      } catch (error) {
        console.error("Error fetching booking status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingStatus();
  }, [token]);

  const renderBookingItem = ({ item }: { item: BookingRequest }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingTitle}>{item.purpose.toUpperCase()}</Text>
      <Text style={styles.bookingText}>By: {item.user.fullName}</Text>
      <Text style={styles.bookingText}>Email: {item.user.email}</Text>
      <Text style={styles.bookingText}>
        Time: {new Date(item.startTime).toLocaleString()} -{" "}
        {new Date(item.endTime).toLocaleString()}
      </Text>
      <Text style={styles.bookingText}>
        Status: {item.status.toUpperCase()}
      </Text>
      <Text style={styles.bookingMessage}>"{item.message}"</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ground Owner Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {user?.fullName}</Text>
        <Text style={styles.subtitle}>Email: {user?.email}</Text>
      </View>

      {/* Summary */}
      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {summary.totalGroundRequests}
            </Text>
            <Text style={styles.summaryLabel}>Total Requests</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {summary.groundApprovedRequests}
            </Text>
            <Text style={styles.summaryLabel}>Approved</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {summary.groundPendingRequests}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {summary.groundRejectedRequests}
            </Text>
            <Text style={styles.summaryLabel}>Rejected</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Ground Info */}
        {groundInfo && (
          <View style={styles.groundInfo}>
            <Text style={styles.sectionTitle}>Ground Information</Text>
            <Text style={styles.groundText}>
              Name: {groundInfo.groundOwnerName}
            </Text>
            <Text style={styles.groundText}>Owner: {groundInfo.ownerName}</Text>
            <Text style={styles.groundText}>Type: {groundInfo.groundType}</Text>
            <Text style={styles.groundText}>
              Location: {groundInfo.primaryLocation}
            </Text>
            <Text style={styles.groundText}>
              Facilities: {groundInfo.facilityAvailable}
            </Text>
            <Text style={styles.groundDescription}>
              {groundInfo.groundDescription}
            </Text>
            <ScrollView horizontal>
              {groundInfo.imageUrls.split(",").map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={styles.groundImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bookings List */}
        <View style={styles.bookingList}>
          <Text style={styles.sectionTitle}>Booking Requests</Text>
          {bookings.length > 0 ? (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item.id}
              renderItem={renderBookingItem}
            />
          ) : (
            <Text style={styles.noBookings}>
              No booking requests available.
            </Text>
          )}
        </View>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

export default GroundOwnerDashboard;

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, backgroundColor: "#4CAF50", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "white" },
  subtitle: { fontSize: 16, color: "white", marginTop: 5 },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "23%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryNumber: { fontSize: 20, fontWeight: "bold", color: "#4CAF50" },
  summaryLabel: { fontSize: 12, color: "#555" },
  content: { flex: 1, padding: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  groundInfo: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  groundText: { fontSize: 14, marginVertical: 2 },
  groundDescription: { marginVertical: 10, fontStyle: "italic" },
  groundImage: { width: 120, height: 80, borderRadius: 8, marginRight: 10 },
  bookingList: { marginBottom: 20 },
  bookingCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingTitle: { fontSize: 16, fontWeight: "bold" },
  bookingText: { fontSize: 14, marginTop: 4 },
  bookingMessage: { fontStyle: "italic", marginTop: 6, color: "#555" },
  noBookings: { fontSize: 14, textAlign: "center", marginTop: 10 },
});
