import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

// Color palette for restaurant backgrounds
const colors = [
  "#69D2E7",
  "#A7DBD8",
  "#E0E4CC",
  "#F38630",
  "#FA6900",
  "#FE4365",
  "#FC9D9A",
  "#F9CDAD",
  "#C8C8A9",
  "#83AF9B",
];

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the JSON data that was passed from the search screen
  const restaurants = params.resultsData
    ? JSON.parse(params.resultsData as string)
    : [];
  console.log("Restaurants data:", restaurants);

  const handleRestaurantPress = (restaurant: any, index: any) => {
    console.log(`Selected restaurant: ${restaurant}`);
    // Navigate to the restaurant detail form with just the name
    router.push({
      pathname: "/consumer/takeout/restaurant/[id]",
      params: {
        id: index.toString(),
        name: restaurant,
      },
    });
  };

  const renderRestaurantCard = ({ item, index }: { item: any; index: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleRestaurantPress(item, index)}
    >
      <View
        style={[
          styles.colorBanner,
          { backgroundColor: colors[index % colors.length] },
        ]}
      />
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{item}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <MaterialIcons
            name="restaurant"
            size={24}
            color="#2E7D32"
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>
            {params.cuisine} Restaurants Near You
          </Text>
        </View>

        <View style={styles.resultsInfoContainer}>
          <View style={styles.resultsBadge}>
            <Text style={styles.resultsCount}>{restaurants.length}</Text>
          </View>
          <View style={styles.filterDetails}>
            <Text style={styles.filterLabel}>We found</Text>
            <Text style={styles.filterValue}>
              {params.cuisine} restaurants near you
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={restaurants}
        renderItem={renderRestaurantCard}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
  },
  resultsInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  resultsBadge: {
    backgroundColor: "#2E7D32",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resultsCount: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  filterDetails: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666666",
  },
  filterValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  colorBanner: {
    width: "100%",
    height: 80,
  },
  cardContent: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
});
