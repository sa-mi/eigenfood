import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import RestaurantItem from "./RestaurantItem";

// Mock data for restaurant list
const mockRestaurants = [
  {
    id: "1",
    name: "Green Garden Bistro",
    description:
      "Farm-to-table restaurant with fresh organic ingredients and seasonal menu. Perfect for health-conscious diners looking for delicious, nutrient-rich meals.",
    distance: "0.8 mi",
    rating: 4.7,
    priceRange: "$$",
    cuisineType: "American",
    healthyOptions: [
      {
        name: "Quinoa Power Bowl",
        price: 14.5,
        calories: 580,
        description:
          "Fresh quinoa with grilled vegetables, avocado, chickpeas, and lemon tahini dressing.",
      },
      {
        name: "Grilled Salmon Salad",
        price: 16.95,
        calories: 430,
        description:
          "Wild-caught salmon on mixed greens with cherry tomatoes, cucumbers, and citrus vinaigrette.",
      },
    ],
  },
  {
    id: "2",
    name: "Vitality Kitchen",
    description:
      "Health-focused restaurant specializing in nutritionally balanced meals. Great selection of low-calorie, high-protein dishes with precise nutritional information.",
    distance: "1.2 mi",
    rating: 4.5,
    priceRange: "$$",
    cuisineType: "Mediterranean",
    healthyOptions: [
      {
        name: "Mediterranean Plate",
        price: 13.95,
        calories: 510,
        description:
          "Hummus, tabbouleh, falafel, olives, and whole grain pita with tzatziki sauce.",
      },
      {
        name: "Protein Powerhouse Wrap",
        price: 12.5,
        calories: 490,
        description:
          "Grilled chicken, quinoa, spinach, and feta in a whole wheat wrap with yogurt sauce.",
      },
    ],
  },
  {
    id: "3",
    name: "Fresh Fuel Cafe",
    description:
      "Quick-service restaurant focused on nutritious meals for active lifestyles. Menu features protein-rich options, smoothies, and performance-enhancing ingredients.",
    distance: "1.5 mi",
    rating: 4.3,
    priceRange: "$",
    cuisineType: "Vegetarian",
    healthyOptions: [
      {
        name: "Protein Boost Bowl",
        price: 11.99,
        calories: 620,
        description:
          "Brown rice, black beans, grilled tofu, roasted vegetables, and avocado with cilantro-lime dressing.",
      },
      {
        name: "Green Machine Smoothie Bowl",
        price: 9.5,
        calories: 390,
        description:
          "Spinach, banana, mango, chia seeds, almond milk base topped with granola and berries.",
      },
    ],
  },
];

interface RestaurantListProps {
  location: string;
  filters: {
    radius: number;
    cuisine: string;
    priceRange: number[];
    calories: { min: number; max: number };
  };
}

export default function RestaurantList({
  location,
  filters,
}: RestaurantListProps) {
  // In a real app, you would filter the restaurants based on the provided filters
  // For now, we'll just use the mock data

  return (
    <View style={styles.container}>
      <Text style={styles.listTitle}>
        Healthy Restaurants {location ? `near ${location}` : ""}
      </Text>

      <FlatList
        data={mockRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantItem restaurant={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    margin: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
});
