import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface RestaurantItemProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    distance: string;
    rating: number;
    priceRange: string;
    cuisineType: string;
    healthyOptions: {
      name: string;
      price: number;
      calories: number;
      description: string;
    }[];
  };
}

export default function RestaurantItem({ restaurant }: RestaurantItemProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const navigateToRestaurant = () => {
    router.push(
      `/consumer/takeout/restaurant/${restaurant.id}?name=${restaurant.name}`
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.mainContent} onPress={toggleExpand}>
        <View style={styles.headerSection}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{restaurant.cuisineType}</Text>
          <Text style={styles.infoText}>•</Text>
          <Text style={styles.infoText}>{restaurant.priceRange}</Text>
          <Text style={styles.infoText}>•</Text>
          <Text style={styles.infoText}>{restaurant.distance}</Text>
        </View>

        <Text
          style={styles.description}
          numberOfLines={expanded ? undefined : 2}
        >
          {restaurant.description}
        </Text>

        <View style={styles.expandButtonRow}>
          <MaterialIcons
            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color="#4CAF50"
          />
          <Text style={styles.expandButtonText}>
            {expanded ? "Hide healthy options" : "Show healthy options"}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.healthyOptionsTitle}>Healthy Bites</Text>

          {restaurant.healthyOptions.map((option, index) => (
            <View key={index} style={styles.healthyOptionItem}>
              <View style={styles.healthyOptionHeader}>
                <Text style={styles.healthyOptionName}>{option.name}</Text>
                <View style={styles.healthyOptionMetrics}>
                  <Text style={styles.priceText}>
                    ${option.price.toFixed(2)}
                  </Text>
                  <View style={styles.caloriesContainer}>
                    <MaterialIcons
                      name="local-fire-department"
                      size={14}
                      color="#FF5722"
                    />
                    <Text style={styles.caloriesText}>
                      {option.calories} cal
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.healthyOptionDescription}>
                {option.description}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.viewMenuButton}
            onPress={navigateToRestaurant}
          >
            <Text style={styles.viewMenuButtonText}>View Full Menu</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainContent: {
    padding: 16,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F8F4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#2E7D32",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginRight: 6,
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  expandButtonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 4,
  },
  expandedContent: {
    padding: 16,
    backgroundColor: "#F9FDF9",
    borderTopWidth: 1,
    borderTopColor: "#E0F2E0",
  },
  healthyOptionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
  },
  healthyOptionItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2E0",
  },
  healthyOptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  healthyOptionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  healthyOptionMetrics: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    marginRight: 10,
  },
  caloriesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  caloriesText: {
    fontSize: 12,
    color: "#E64A19",
    marginLeft: 2,
    fontWeight: "500",
  },
  healthyOptionDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  viewMenuButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  viewMenuButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
