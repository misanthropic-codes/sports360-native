import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useGroundStore } from "@/store/groundTStore";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const availableGrounds = useGroundStore((state) => state.availableGrounds);
  const setSelectedGround = useGroundStore((state) => state.setSelectedGround);
  const router = useRouter();

  const handleSelectGround = (ground: any) => {
    setSelectedGround(ground);
    router.push("/ground_owner/GroundDetail");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Available Grounds</Text>

      <FlatList
        data={availableGrounds}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectGround(item)}
          >
            <Image
              source={{ uri: item.imageUrls.split(",")[0] }}
              style={styles.image}
            />
            <View style={styles.cardContent}>
              <Text style={styles.groundName}>{item.groundOwnerName}</Text>
              <Text style={styles.location}>{item.primaryLocation}</Text>
              <Text style={styles.type}>{item.groundType}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 10,
    alignSelf: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "center",
  },
  groundName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#15803d",
  },
  location: {
    fontSize: 14,
    color: "#4b5563",
  },
  type: {
    fontSize: 14,
    color: "#15803d",
    fontWeight: "bold",
  },
});
