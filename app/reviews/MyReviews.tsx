import type { Review } from "@/api/reviewApi";
import { deleteReview, getMyReviews } from "@/api/reviewApi";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Edit2, Star, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyReviews() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains) ? user.domains[0] : user?.domains || "cricket";

  const fetchReviews = async () => {
    if (!token) return;

    try {
      const data = await getMyReviews(1, 50, token);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleDelete = (reviewId: string) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReview(reviewId, token || "");
              setReviews(reviews.filter((r) => r.id !== reviewId));
              Alert.alert("Success", "Review deleted successfully");
            } catch (error) {
              console.error("Failed to delete review:", error);
              Alert.alert("Error", "Failed to delete review");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white flex-1">My Reviews</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <View
              key={review.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
            >
              {/* Rating and Type */}
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color="#F59E0B"
                      fill={star <= review.rating ? "#F59E0B" : "transparent"}
                    />
                  ))}
                  <Text className="ml-2 text-gray-600 text-sm font-medium">
                    ({review.rating}/5)
                  </Text>
                </View>

                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-700 text-xs font-medium capitalize">
                    {review.reviewType}
                  </Text>
                </View>
              </View>

              {/* Ground Name */}
              {review.groundName && (
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  {review.groundName}
                </Text>
              )}

              {/* Comment */}
              {review.comment && (
                <Text className="text-gray-600 text-sm mb-3">{review.comment}</Text>
              )}

              {/* Date */}
              {review.createdAt && (
                <Text className="text-gray-400 text-xs mb-3">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              )}

              {/* Actions */}
              <View className="flex-row space-x-3 pt-3 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/reviews/EditReview" as any,
                      params: { reviewId: review.id },
                    })
                  }
                  className="flex-1 bg-blue-50 py-2 px-4 rounded-lg flex-row items-center justify-center"
                >
                  <Edit2 size={16} color="#3B82F6" />
                  <Text className="text-blue-600 font-semibold text-sm ml-2">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(review.id)}
                  className="flex-1 bg-red-50 py-2 px-4 rounded-lg flex-row items-center justify-center"
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text className="text-red-600 font-semibold text-sm ml-2">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Star size={48} color="#CBD5E1" />
            <Text className="text-gray-400 mt-4 text-center">No reviews yet</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Book a ground and share your experience
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
}
