// GroundOwnerDashboard.tsx
import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import {
    BarChart3,
    Calendar,
    CheckCircle,
    ClipboardList,
    Clock,
    Mail,
    PlusCircle,
    Timer,
    User,
    XCircle
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
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
  reviewedAt: string | null;
  reviewedBy: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [groundInfo, setGroundInfo] = useState<Ground | null>(null);

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching booking status...");
        console.log("Token:", token ? "Present" : "Missing");

        const response = await fetch(
          "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1/booking/status",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BookingStatusResponse = await response.json();
        console.log("Full API Response:", JSON.stringify(data, null, 2));

        // Set summary
        if (data?.summary) {
          console.log("Setting summary:", data.summary);
          setSummary(data.summary);
        }

        // Set bookings - FIXED: Check for groundBookingRequests properly
        if (
          data?.data?.groundBookingRequests &&
          Array.isArray(data.data.groundBookingRequests)
        ) {
          console.log(
            "Number of bookings:",
            data.data.groundBookingRequests.length
          );
          setBookings(data.data.groundBookingRequests);

          // Set ground info from first booking
          if (
            data.data.groundBookingRequests.length > 0 &&
            data.data.groundBookingRequests[0]?.ground
          ) {
            console.log(
              "Setting ground info:",
              data.data.groundBookingRequests[0].ground.groundOwnerName
            );
            setGroundInfo(data.data.groundBookingRequests[0].ground);
          }
        } else {
          console.log("No ground booking requests found or invalid format");
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching booking status:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBookingStatus();
    } else {
      console.log("No token available");
      setLoading(false);
      setError("Authentication token missing");
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "rejected":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#E8F5E9";
      case "pending":
        return "#FFF3E0";
      case "rejected":
        return "#FFEBEE";
      default:
        return "#F5F5F5";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderBookingItem = ({ item }: { item: BookingRequest }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingTitleContainer}>
          <Text style={styles.bookingPurpose}>{item.purpose}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBgColor(item.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <User size={16} color="#666" />
            <Text style={styles.detailLabel}>Customer</Text>
          </View>
          <Text style={styles.detailValue}>{item.user.fullName}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <Mail size={16} color="#666" />
            <Text style={styles.detailLabel}>Email</Text>
          </View>
          <Text style={styles.detailValue}>{item.user.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <Calendar size={16} color="#666" />
            <Text style={styles.detailLabel}>Date</Text>
          </View>
          <Text style={styles.detailValue}>{formatDate(item.startTime)}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelContainer}>
            <Timer size={16} color="#666" />
            <Text style={styles.detailLabel}>Time</Text>
          </View>
          <Text style={styles.detailValue}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>
      </View>

      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message:</Text>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.fullName || "User"}</Text>
              <Text style={styles.userEmail}>{user?.email || ""}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/profile")}
              activeOpacity={0.7}
            >
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post a Ground CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/ground_owner/PostGround" as any)}
            activeOpacity={0.9}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaIconContainer}>
                <PlusCircle size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.ctaTextContainer}>
                <Text style={styles.ctaTitle}>Post a Ground</Text>
                <Text style={styles.ctaSubtitle}>
                  List your ground and start receiving bookings
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        {summary && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, styles.totalCard]}>
                <View style={styles.summaryIconContainer}>
                  <BarChart3 size={24} color="#4CAF50" />
                </View>
                <Text style={styles.summaryNumber}>
                  {summary.totalGroundRequests}
                </Text>
                <Text style={styles.summaryLabel}>Total Requests</Text>
              </View>

              <View style={[styles.summaryCard, styles.approvedCard]}>
                <View style={styles.summaryIconContainer}>
                  <CheckCircle size={24} color="#4CAF50" />
                </View>
                <Text style={styles.summaryNumber}>
                  {summary.groundApprovedRequests}
                </Text>
                <Text style={styles.summaryLabel}>Approved</Text>
              </View>

              <View style={[styles.summaryCard, styles.pendingCard]}>
                <View style={styles.summaryIconContainer}>
                  <Clock size={24} color="#FF9800" />
                </View>
                <Text style={styles.summaryNumber}>
                  {summary.groundPendingRequests}
                </Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>

              <View style={[styles.summaryCard, styles.rejectedCard]}>
                <View style={styles.summaryIconContainer}>
                  <XCircle size={24} color="#F44336" />
                </View>
                <Text style={styles.summaryNumber}>
                  {summary.groundRejectedRequests}
                </Text>
                <Text style={styles.summaryLabel}>Rejected</Text>
              </View>
            </View>
          </View>
        )}

        {/* Ground Info */}
        {groundInfo && (
          <View style={styles.groundSection}>
            <Text style={styles.sectionTitle}>Ground Information</Text>
            <View style={styles.groundCard}>
              <Text style={styles.groundName}>
                {groundInfo.groundOwnerName}
              </Text>

              <View style={styles.groundDetailsGrid}>
                <View style={styles.groundDetailItem}>
                  <Text style={styles.groundDetailLabel}>Owner</Text>
                  <Text style={styles.groundDetailValue}>
                    {groundInfo.ownerName}
                  </Text>
                </View>
                <View style={styles.groundDetailItem}>
                  <Text style={styles.groundDetailLabel}>Type</Text>
                  <Text style={styles.groundDetailValue}>
                    {groundInfo.groundType}
                  </Text>
                </View>
                <View style={styles.groundDetailItem}>
                  <Text style={styles.groundDetailLabel}>Location</Text>
                  <Text style={styles.groundDetailValue}>
                    {groundInfo.primaryLocation}
                  </Text>
                </View>
                <View style={styles.groundDetailItem}>
                  <Text style={styles.groundDetailLabel}>Facilities</Text>
                  <Text style={styles.groundDetailValue}>
                    {groundInfo.facilityAvailable}
                  </Text>
                </View>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.groundDescription}>
                  {groundInfo.groundDescription}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                {[
                  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop",
                  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop",
                ].map((url, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: url }}
                    style={styles.groundImage}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Bookings List */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>
            Booking Requests ({bookings.length})
          </Text>
          {bookings.length > 0 ? (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item.id}
              renderItem={renderBookingItem}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <ClipboardList size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>No booking requests yet</Text>
              <Text style={styles.emptyStateSubtext}>
                New requests will appear here
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

export default GroundOwnerDashboard;

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4CAF50",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  // Header
  header: {
    backgroundColor: "#4CAF50",
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  profileButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    minHeight: 36,
    justifyContent: "center",
  },
  profileButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
  },

  // Summary Section
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  approvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  rejectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#666",
  },

  // Ground Section
  groundSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  groundCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  groundName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  groundDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  groundDetailItem: {
    width: "50%",
    marginBottom: 12,
  },
  groundDetailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groundDetailValue: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groundDescription: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  imageScroll: {
    marginTop: 8,
  },
  groundImage: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#F5F5F5",
  },

  // Bookings Section
  bookingsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  bookingCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  bookingTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingPurpose: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  messageContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  messageLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },

  // Empty State
  emptyState: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
  },

  bottomSpacer: {
    height: 80,
  },
});
