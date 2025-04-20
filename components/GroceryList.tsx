import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

interface GroceryListProps {
  location: string;
  filters: {
    radius: number;
    cuisine: string;
    priceRange: number[];
    calories: { min: number; max: number };
  };
}

// Mock data for address suggestions
const mockAddresses = [
  "123 Main St, Davis, CA",
  "456 University Ave, Davis, CA",
  "789 Anderson Rd, Davis, CA",
  "101 Russell Blvd, Davis, CA",
  "202 Central Park, Davis, CA",
];

// Mock coordinates for development - in production you'd use geocoding
const getCoordinatesFromLocation = (location: string) => {
  // In production, use Google Geocoding API or similar
  return { lat: 38.5382, lng: -121.7617 }; // UC Davis coordinates as default
};

interface ListItem {
  type: string;
  data: any;
  index?: number; // Optional property
}

export default function GroceryList({ location, filters }: GroceryListProps) {
  const router = useRouter();
  const [store, setStore] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputLocation, setInputLocation] = useState(location);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const initialLoadComplete = useRef(false);

  // Load data once on initial component mount
  useEffect(() => {
    if (!initialLoadComplete.current) {
      fetchGroceryData();
      initialLoadComplete.current = true;
    }
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputLocation.length > 2) {
      const filteredAddresses = mockAddresses.filter((address) =>
        address.toLowerCase().includes(inputLocation.toLowerCase())
      );
      setAddressSuggestions(filteredAddresses);
      setShowSuggestions(filteredAddresses.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputLocation]);

  // Update input location when location prop changes
  useEffect(() => {
    setInputLocation(location);
  }, [location]);

  const handleSearch = () => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    fetchGroceryData();
  };

  const handleLocationSelect = (address) => {
    setInputLocation(address);
    setShowSuggestions(false);
    fetchGroceryData();
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setShowSuggestions(false);
    Keyboard.dismiss();

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location access to find stores near you"
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Get address from coordinates using reverse geocoding
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = `${address.street || ""}, ${
          address.city || ""
        }, ${address.region || ""} ${address.postalCode || ""}`;
        setInputLocation(formattedAddress);

        // Fetch grocery data with the new location
        await fetchGroceryData(
          location.coords.latitude,
          location.coords.longitude
        );
      } else {
        throw new Error("Could not determine your address");
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert(
        "Location Error",
        error.message || "Could not get your current location"
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const fetchGroceryData = async (lat = null, lng = null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get coordinates from location string or use provided coordinates
      const coordinates =
        lat && lng ? { lat, lng } : getCoordinatesFromLocation(inputLocation);

      // Prepare the request payload
      const payload = {
        location: String(coordinates.lat) + "," + String(coordinates.lng),
        max_price: Math.min(Math.floor(filters.priceRange[1] / 25) + 1, 4), // Convert dollar range to 0-4 price level
      };

      console.log("Sending grocery API request with payload:", payload);
      const url =
        "http://localhost:8000/stores/" +
        decodeURIComponent(payload.location) +
        "/" +
        payload.max_price +
        "/";
      console.log(url);
      // Make the API request
      const response = await fetch(
        "http://localhost:8000/stores/" +
          payload.location +
          "/" +
          payload.max_price +
          "/"
      );

      if (!response.ok) {
        throw new Error(`API returned status code ${response.status}`);
      }

      const data = await response.json();
      setStore(data.store);

      // Parse recipes from the response
      try {
        // First try to parse as JSON
        let parsedRecipes;
        if (typeof data.recipes === "string") {
          // Remove any markdown formatting that might be in the response
          const cleanedString = data.recipes
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          parsedRecipes = JSON.parse(cleanedString);
          setRecipes(
            Array.isArray(parsedRecipes) ? parsedRecipes : [parsedRecipes]
          );
        } else {
          // If it's already an object, use it directly
          setRecipes(
            Array.isArray(data.recipes) ? data.recipes : [data.recipes]
          );
        }
      } catch (e) {
        // If parsing fails, create a recipe object with raw content
        console.log("Parsing recipes failed, using raw text");
        setRecipes([
          {
            name: "Recipe Suggestions",
            description: "Based on your search criteria",
            rawContent: data.recipes,
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching grocery data:", err);
      setError(`Failed to find grocery stores: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecipeItem = ({ item }) => {
    // Handle both structured and raw text recipes
    if (item.rawContent) {
      return (
        <View style={styles.recipeItem}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeDescription}>{item.description}</Text>
          <Text>{item.rawContent}</Text>
        </View>
      );
    }

    return (
      <View style={styles.recipeItem}>
        <Text style={styles.recipeName}>{item.name}</Text>

        {item.description && (
          <Text style={styles.recipeDescription}>{item.description}</Text>
        )}

        {item.ingredients && (
          <>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsContainer}>
              {Array.isArray(item.ingredients) ? (
                item.ingredients.map((ingredient, idx) => (
                  <Text key={idx} style={styles.ingredient}>
                    • {ingredient}
                  </Text>
                ))
              ) : (
                <Text style={styles.ingredient}>{item.ingredients}</Text>
              )}
            </View>
          </>
        )}

        {item.instructions && (
          <>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructions}>{item.instructions}</Text>
            </View>
          </>
        )}

        {item.totalCost && (
          <Text style={styles.totalCost}>
            Estimated cost: ${item.totalCost}
          </Text>
        )}
      </View>
    );
  };

  const handleStoreSelect = (store) => {
    // Navigate to store detail page
    router.push(`/consumer/grocery/store/${store.id}`);
  };

  // Create a merged data array for the FlatList to render both store and recipes
  const createListData = () => {
    if (!store) return [];

    // Start with the store
    const listData = [
      {
        type: "storeHeader",
        data: { title: "Grocery Store" },
      },
      {
        type: "store",
        data: store,
      },
    ];

    // Add recipes section if we have recipes
    if (recipes.length > 0) {
      listData.push({
        type: "recipesHeader",
        data: { title: "Recommended Recipes" },
      });

      // Add each recipe
      recipes.forEach((recipe, index) => {
        listData.push({
          type: "recipe",
          data: recipe,
          index,
        } as ListItem);
      });
    }

    return listData;
  };

  // Render different item types based on type property
  const renderListItem = ({ item }) => {
    switch (item.type) {
      case "storeHeader":
        return <Text style={styles.sectionHeader}>{item.data.title}</Text>;

      case "store":
        return (
          <TouchableOpacity
            style={styles.storeInfoContainer}
            onPress={() => handleStoreSelect(item.data)}
          >
            <Text style={styles.storeName}>{item.data.name}</Text>
            <Text style={styles.storeAddress}>{item.data.address}</Text>
            <Text style={styles.storePriceLevel}>
              Price Level:{" "}
              {Array(item.data.price_level || 0)
                .fill("$")
                .join("")}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color="#4CAF50"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        );

      case "recipesHeader":
        return <Text style={styles.recipesHeader}>{item.data.title}</Text>;

      case "recipe":
        return renderRecipeItem({ item: item.data });

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Location search bar */}
      <View style={styles.addressContainer}>
        <View style={styles.searchBarWrapper}>
          <TextInput
            style={styles.addressInput}
            placeholder="Enter your address"
            value={inputLocation}
            onChangeText={setInputLocation}
            onFocus={() => inputLocation.length > 2 && setShowSuggestions(true)}
          />
          {isLoadingLocation ? (
            <ActivityIndicator
              size="small"
              color="#4CAF50"
              style={styles.locationLoader}
            />
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetCurrentLocation}
              disabled={isLoadingLocation || isLoading}
            >
              <MaterialIcons name="my-location" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isLoadingLocation || isLoading}
          >
            <MaterialIcons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Location suggestions dropdown */}
        {showSuggestions && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={addressSuggestions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleLocationSelect(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
            />
          </View>
        )}
      </View>

      <Text style={styles.listTitle}>
        Grocery Stores {inputLocation ? `near ${inputLocation}` : ""}
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding grocery stores...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : store ? (
        <FlatList
          data={createListData()}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="store" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>No grocery stores found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your filters or location
          </Text>
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
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    zIndex: 10, // Ensure suggestions appear above other content
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
  locationLoader: {
    marginLeft: 8,
    height: 40,
    width: 40,
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
  suggestionsContainer: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    maxHeight: 200,
    overflow: "hidden",
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    margin: 16,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  storeInfoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    width: "90%",
  },
  chevronIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
  },
  storeAddress: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    width: "100%",
  },
  storePriceLevel: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  recipesHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 16,
  },
  recipesList: {
    paddingBottom: 16,
  },
  recipeItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 8,
    marginTop: 12,
  },
  ingredientsContainer: {
    marginBottom: 16,
  },
  ingredient: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  instructionsContainer: {
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  totalCost: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 8,
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
