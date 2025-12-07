import { createReview } from "@/api/reviewApi";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Star } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateReview() {
  const { token } = useAuth();
  const router = useRouter();
  const { bookingId, groundId } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewType, setReviewType] = useState<"ground" | "service">("ground");

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Validation Error", "Please select a rating");
      return;
    }

    if (!bookingId || !groundId) {
      Alert.alert("Error", "Missing booking or ground information");
      return;
    }

    setLoading(true);
    try {
      await createReview(
        {
          bookingId: bookingId as string,
          groundId: groundId as string,
          rating,
          comment: comment.trim() || undefined,
          reviewType,
        },
        token || ""
      );

      Alert.alert("Success", "Review submitted successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Failed to create review:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white flex-1">Write a Review</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Rating */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            How was your experience?
          </Text>

          <View className="flex-row justify-center items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="p-2"
              >
                <Star
                  size={40}
                  color="#F59E0B"
                  fill={star <= rating ? "#F59E0B" : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text className="text-center mt-4 text-gray-600 font-medium">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </Text>
          )}
        </View>

        {/* Review Type */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Review Type</Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => setReviewType("ground")}
              className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                reviewType === "ground"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-blue-200"
              }`}
            >
              <Text
                className={`font-semibold text-center ${
                  reviewType === "ground" ? "text-white" : "text-gray-700"
                }`}
              >
                Ground
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setReviewType("service")}
              className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                reviewType === "service"
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-blue-200"
              }`}
            >
              <Text
                className={`font-semibold text-center ${
                  reviewType === "service" ? "text-white" : "text-gray-700"
                }`}
              >
                Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comment */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Tell us more (Optional)
          </Text>

          <TextInput
            className="bg-white border-2 border-blue-200 rounded-xl p-4 text-gray-800"
            placeholder="Share your experience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            style={{ textAlignVertical: "top", minHeight: 120 }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || rating === 0}
          className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
            loading || rating === 0 ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Submit Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
