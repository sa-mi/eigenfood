import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import RestaurantItem from "./RestaurantItem";

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
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoadComplete = useRef(false);
  const prevFiltersRef = useRef(null);
  const [inputLocation, setInputLocation] = useState(location);

  // Load data once on initial component mount
  useEffect(() => {
    if (!initialLoadComplete.current) {
      fetchRestaurants();
      initialLoadComplete.current = true;
    }
  }, []);

  // Update input location when location prop changes
  useEffect(() => {
    setInputLocation(location);
  }, [location]);

  // Only fetch again if non-location filters change
  useEffect(() => {
    if (initialLoadComplete.current) {
      const prevFilters = prevFiltersRef.current;

      // Check if filters (except location) changed
      const filtersChanged =
        prevFilters === null ||
        prevFilters.radius !== filters.radius ||
        prevFilters.cuisine !== filters.cuisine ||
        prevFilters.priceRange[0] !== filters.priceRange[0] ||
        prevFilters.priceRange[1] !== filters.priceRange[1] ||
        prevFilters.calories.min !== filters.calories.min ||
        prevFilters.calories.max !== filters.calories.max;

      if (filtersChanged) {
        console.log("Filters changed, fetching new data");
        fetchRestaurants();
      }
    }

    // Update the previous filters reference
    prevFiltersRef.current = {
      ...filters,
    };
  }, [filters]);

  // New handler for search button
  const handleSearch = () => {
    console.log("Search button pressed with location:", inputLocation);
    fetchRestaurants();
  };

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      // Use inputLocation instead of debouncedLocation
      const payload = {
        location: inputLocation || "University Credit Union Center, Davis, CA",
        maxDistance: filters.radius,
        cuisine: filters.cuisine === "All Cuisines" ? "" : filters.cuisine,
        cals: filters.calories.max,
        budget: filters.priceRange[1],
      };

      // Log payload in specified order
      console.log("Sending API request with payload:", {
        location: payload.location,
        maxDistance: payload.maxDistance,
        cuisine: payload.cuisine,
        cals: payload.cals,
        budget: payload.budget,
      });

      // Send POST request to API endpoint
      const response = await fetch("http://localhost:8000/recs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response:", data);

      // Process the data - group dishes by restaurant
      const restaurantMap = new Map();

      data.forEach((item) => {
        if (!restaurantMap.has(item.name)) {
          restaurantMap.set(item.name, {
            id: `restaurant-${restaurantMap.size + 1}`,
            name: item.name,
            description:
              "Health-focused restaurant with nutritionally balanced options.",
            distance: (Math.random() * 3 + 0.5).toFixed(1) + " mi",
            rating: (Math.random() * 0.7 + 4.2).toFixed(1),
            priceRange: "$".repeat(Math.floor(Math.random() * 2) + 1),
            cuisineType:
              filters.cuisine === "All Cuisines" ? "Healthy" : filters.cuisine,
            healthyOptions: [],
          });
        }

        // Add dish to restaurant's healthyOptions
        restaurantMap.get(item.name).healthyOptions.push({
          name: item.dish,
          price: parseFloat(item.price),
          calories: parseInt(item.calories),
          description: item.dish,
        });
      });

      // Convert map to array
      const processedRestaurants = Array.from(restaurantMap.values());
      setRestaurants(processedRestaurants);
      setError(null);
    } catch (err) {
      console.error("Error fetching restaurant data:", err);
      setError("Failed to load restaurant data. Please try again.");

      // TEMPORARY - Use sample data for development/testing
      processSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process sample data when API fails (development only)
  const processSampleData = () => {
    const sampleData = [
      {
        name: "New Gold Medal Restaurant",
        calories: "600",
        price: "12",
        dish: "Steamed Chicken and Vegetables",
      },
      {
        name: "New Gold Medal Restaurant",
        calories: "550",
        price: "10",
        dish: "Tofu and Vegetable Stir-fry (brown rice)",
      },
      {
        name: "New Gold Medal Restaurant",
        calories: "450",
        price: "7",
        dish: "Chicken Noodle Soup (whole wheat noodles)",
      },
      {
        name: "Rob Ben's Restaurant & Lounge",
        calories: "650",
        price: "25",
        dish: "Grilled Salmon with Roasted Vegetables",
      },
      {
        name: "Rob Ben's Restaurant & Lounge",
        calories: "550",
        price: "20",
        dish: "Lentil Soup with Whole Wheat Bread",
      },
      {
        name: "Rob Ben's Restaurant & Lounge",
        calories: "400",
        price: "18",
        dish: "Chicken Salad Lettuce Wraps",
      },
      {
        name: "Aburaya",
        calories: "600",
        price: "12",
        dish: "Grilled Salmon with Brown Rice and Vegetables",
      },
      {
        name: "Aburaya",
        calories: "550",
        price: "10",
        dish: "Tofu and Vegetable Stir-fry with Quinoa",
      },
      {
        name: "Aburaya",
        calories: "450",
        price: "8",
        dish: "Edamame and Seaweed Salad",
      },
    ];

    const restaurantMap = new Map();

    sampleData.forEach((item) => {
      if (!restaurantMap.has(item.name)) {
        restaurantMap.set(item.name, {
          id: `restaurant-${restaurantMap.size + 1}`,
          name: item.name,
          description:
            "Health-focused restaurant with nutritionally balanced options.",
          distance: (Math.random() * 3 + 0.5).toFixed(1) + " mi",
          rating: (Math.random() * 0.7 + 4.2).toFixed(1),
          priceRange: "$".repeat(Math.floor(Math.random() * 2) + 1),
          cuisineType:
            filters.cuisine === "All Cuisines" ? "Healthy" : filters.cuisine,
          healthyOptions: [],
        });
      }

      restaurantMap.get(item.name).healthyOptions.push({
        name: item.dish,
        price: parseFloat(item.price),
        calories: parseInt(item.calories),
        description: item.dish,
      });
    });

    setRestaurants(Array.from(restaurantMap.values()));
  };

  return (
    <View style={styles.container}>
      {/* Add address bar with search button */}
      <View style={styles.addressContainer}>
        <TextInput
          style={styles.addressInput}
          placeholder="Enter your address"
          value={inputLocation}
          onChangeText={setInputLocation}
        />
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            /* Location button functionality */
          }}
        >
          <MaterialIcons name="my-location" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>
        Healthy Restaurants {location ? `near ${location}` : ""}
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding healthy options...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : restaurants.length > 0 ? (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RestaurantItem restaurant={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="restaurant" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>No restaurants found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  addressInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  locationButton: {
    marginLeft: 8,
    height: 40,
    width: 40,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButton: {
    marginLeft: 8,
    height: 40,
    width: 40,
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
});
