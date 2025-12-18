import { reviewBookingRequest } from "@/api/booking";
import { useAuth } from "@/context/AuthContext";
import { useGroundOwnerStore } from "@/store/groundOwnerStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BookingRequestsScreen: React.FC = () => {
  const { token } = useAuth();
  
  // Use ground owner store with caching
  const {
    bookingRequests,
    bookingRequestsLoading,
    bookingRequestsError,
    fetchBookingRequests,
    updateBookingRequestStatus,
  } = useGroundOwnerStore();
  
  const [selectedGround, setSelectedGround] = useState<any>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch booking requests with smart caching
  useEffect(() => {
    if (token) {
      fetchBookingRequests(token); // Smart fetch - only if not cached
    }
  }, [token]);

  // Auto-select first ground when data changes
  useEffect(() => {
    if (!selectedGround && bookingRequests.length > 0) {
      console.log("📍 Auto-selecting first ground:", bookingRequests[0].ground.groundOwnerName);
      setSelectedGround(bookingRequests[0]);
    }
  }, [bookingRequests]);

  // Pull to refresh handler
  const onRefresh = async () => {
    if (!token) return;
    
    setRefreshing(true);
    await fetchBookingRequests(token, true); // Force refresh
    setRefreshing(false);
  };

  const handleReview = async (
    bookingId: string,
    status: "approved" | "rejected"
  ) => {
    Alert.alert(
      `${status.charAt(0).toUpperCase() + status.slice(1)} Booking`,
      `Are you sure you want to ${status} this booking?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoadingId(bookingId);
              await reviewBookingRequest(bookingId, status, token);
              Alert.alert("Success", `Request ${status} successfully!`);

              // Update local cache instantly
              updateBookingRequestStatus(bookingId, status);

              // Update selected ground local state
              if (selectedGround) {
                setSelectedGround({
                  ...selectedGround,
                  bookings: selectedGround.bookings.map((b: any) =>
                    b.id === bookingId ? { ...b, status } : b
                  ),
                });
              }

              // Update selected booking if it's the one being reviewed
              if (selectedBooking?.id === bookingId) {
                setSelectedBooking({ ...selectedBooking, status });
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to update request");
            } finally {
              setLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const openBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Show loading only when data is being fetched from backend (not from cache)
  if (bookingRequestsLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <StatusBar backgroundColor="#15803d" barStyle="light-content" />
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="text-gray-500 mt-4">Loading booking requests...</Text>
      </SafeAreaView>
    );
  }

  if (bookingRequestsError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
        <StatusBar backgroundColor="#15803d" barStyle="light-content" />
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-gray-800 text-lg font-semibold mt-4 text-center">Error Loading Requests</Text>
        <Text className="text-gray-600 mt-2 text-center">{bookingRequestsError}</Text>
        <TouchableOpacity
          onPress={() => token && fetchBookingRequests(token, true)}
          className="bg-green-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!selectedGround) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
        <StatusBar backgroundColor="#15803d" barStyle="light-content" />
        <Ionicons name="file-tray" size={64} color="#d1d5db" />
        <Text className="text-gray-800 text-xl font-semibold mt-4">No Booking Requests</Text>
        <Text className="text-gray-600 mt-2 text-center">
          You don't have any booking requests yet.
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="bg-green-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#15803d" barStyle="light-content" />

      {/* Header */}
      <View className="p-4 bg-green-600">
        <Text className="text-xl text-white font-bold">
          {selectedGround.ground.groundOwnerName}
        </Text>
        <Text className="text-white">
          {selectedGround.ground.primaryLocation}
        </Text>
      </View>

      {/* Booking List */}
      <ScrollView
        className="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#16a34a"]}
            tintColor="#16a34a"
          />
        }
      >
        {selectedGround.bookings.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-800 text-lg font-semibold mt-4">No Requests Yet</Text>
            <Text className="text-gray-600 mt-2 text-center px-6">
              This ground doesn't have any booking requests at the moment.
            </Text>
          </View>
        ) : (
          selectedGround.bookings.map((booking: any) => (
          <View
            key={booking.id}
            className="bg-white border-l-4 border-green-600 p-4 rounded-xl shadow-lg mb-4"
          >
            <Text className="text-lg font-semibold text-gray-900">
              {booking.user.fullName}
            </Text>
            <Text className="text-gray-600">{booking.user.email}</Text>
            <Text className="mt-2 text-gray-700">
              <Text className="font-bold">Purpose:</Text> {booking.purpose}
            </Text>
            <Text
              className={`mt-1 text-sm font-bold ${
                booking.status === "approved"
                  ? "text-green-600"
                  : booking.status === "rejected"
                    ? "text-red-600"
                    : "text-orange-600"
              }`}
            >
              Status: {booking.status.toUpperCase()}
            </Text>

            {/* Actions */}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={() => openBookingDetails(booking)}
                className="flex-1 mr-2 bg-blue-500 rounded-lg py-2 items-center"
              >
                <Text className="text-white font-bold">View Details</Text>
              </TouchableOpacity>

              {booking.status === "pending" && (
                <>
                  <TouchableOpacity
                    onPress={() => handleReview(booking.id, "approved")}
                    className="flex-1 mx-1 bg-green-600 rounded-lg py-2 items-center"
                  >
                    {loadingId === booking.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold">Approve</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReview(booking.id, "rejected")}
                    className="flex-1 ml-2 bg-red-600 rounded-lg py-2 items-center"
                  >
                    {loadingId === booking.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold">Reject</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          ))
        )}
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
              <Text className="text-2xl font-bold text-gray-900">
                Booking Details
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView className="p-5 max-h-96">
              {selectedBooking && (
                <>
                  {/* User Info */}
                  <View className="mb-4">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="person" size={20} color="#15803d" />
                      <Text className="text-xl font-bold text-gray-900 ml-2">
                        {selectedBooking.user.fullName}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="mail" size={18} color="#6b7280" />
                      <Text className="text-gray-700 ml-2">
                        {selectedBooking.user.email}
                      </Text>
                    </View>
                  </View>

                  {/* Booking Info */}
                  <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <View className="flex-row items-start mb-3">
                      <Ionicons
                        name="document-text"
                        size={20}
                        color="#15803d"
                      />
                      <View className="flex-1 ml-2">
                        <Text className="font-bold text-gray-900 mb-1">
                          Purpose:
                        </Text>
                        <Text className="text-gray-700">
                          {selectedBooking.purpose}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-start mb-3">
                      <Ionicons
                        name="chatbox-ellipses"
                        size={20}
                        color="#15803d"
                      />
                      <View className="flex-1 ml-2">
                        <Text className="font-bold text-gray-900 mb-1">
                          Message:
                        </Text>
                        <Text className="text-gray-700">
                          {selectedBooking.message}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <Ionicons name="time" size={20} color="#15803d" />
                      <View className="flex-1 ml-2">
                        <Text className="font-bold text-gray-900 mb-1">
                          Start Time:
                        </Text>
                        <Text className="text-gray-700">
                          {new Date(selectedBooking.startTime).toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={20} color="#15803d" />
                      <View className="flex-1 ml-2">
                        <Text className="font-bold text-gray-900 mb-1">
                          End Time:
                        </Text>
                        <Text className="text-gray-700">
                          {new Date(selectedBooking.endTime).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View className="flex-row items-center justify-center mb-4">
                    <Ionicons
                      name={
                        selectedBooking.status === "approved"
                          ? "checkmark-circle"
                          : selectedBooking.status === "rejected"
                            ? "close-circle"
                            : "time"
                      }
                      size={24}
                      color={
                        selectedBooking.status === "approved"
                          ? "#16a34a"
                          : selectedBooking.status === "rejected"
                            ? "#dc2626"
                            : "#ea580c"
                      }
                    />
                    <Text
                      className={`ml-2 text-lg font-bold ${
                        selectedBooking.status === "approved"
                          ? "text-green-600"
                          : selectedBooking.status === "rejected"
                            ? "text-red-600"
                            : "text-orange-600"
                      }`}
                    >
                      Status: {selectedBooking.status.toUpperCase()}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  {selectedBooking.status === "pending" && (
                    <View className="flex-row justify-between gap-3">
                      <TouchableOpacity
                        disabled={loadingId === selectedBooking.id}
                        onPress={() =>
                          handleReview(selectedBooking.id, "approved")
                        }
                        className="flex-1 bg-green-600 rounded-full py-4 items-center"
                      >
                        {loadingId === selectedBooking.id ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <View className="flex-row items-center">
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#fff"
                            />
                            <Text className="text-white text-lg font-bold ml-2">
                              Approve
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        disabled={loadingId === selectedBooking.id}
                        onPress={() =>
                          handleReview(selectedBooking.id, "rejected")
                        }
                        className="flex-1 bg-red-600 rounded-full py-4 items-center"
                      >
                        {loadingId === selectedBooking.id ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <View className="flex-row items-center">
                            <Ionicons
                              name="close-circle"
                              size={20}
                              color="#fff"
                            />
                            <Text className="text-white text-lg font-bold ml-2">
                              Reject
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BookingRequestsScreen;
