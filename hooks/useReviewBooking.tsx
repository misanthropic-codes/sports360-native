// hooks/useReviewBooking.ts
import { reviewBookingRequest } from "@/api/booking";
import { useAuth } from "@/context/AuthContext";
import { useBookingStore } from "@/store/bookingStore";
import { useState } from "react";
import { Alert } from "react-native";

export const useReviewBooking = () => {
  const { token } = useAuth();
  const selectedGround = useBookingStore((state) => state.selectedGround);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReview = async (
    bookingId: string,
    status: "approved" | "rejected"
  ) => {
    if (!selectedGround) return;

    try {
      setLoadingId(bookingId);
      await reviewBookingRequest(
        selectedGround.ground.id,
        bookingId,
        status,
        token
      );

      // ✅ Update Zustand so UI reflects immediately
      useBookingStore.setState((state) => {
        if (!state.selectedGround) return {};
        return {
          selectedGround: {
            ...state.selectedGround,
            bookings: state.selectedGround.bookings.map((b: any) =>
              b.id === bookingId ? { ...b, status } : b
            ),
            ground: state.selectedGround.ground, // ensure ground is present
          },
        };
      });

      Alert.alert("Success", `Request ${status} successfully!`);
    } catch (error) {
      Alert.alert("Error", "Failed to update request");
    } finally {
      setLoadingId(null);
    }
  };

  return { handleReview, loadingId };
};
