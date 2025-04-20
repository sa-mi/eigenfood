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
        Alert.alert("Permission Denied", "Allow location access to find stores near you");
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
        const formattedAddress = `${address.street || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`;
        setInputLocation(formattedAddress);
        
        // Fetch grocery data with the new location
        await fetchGroceryData(location.coords.latitude, location.coords.longitude);
      } else {
        throw new Error("Could not determine your address");
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Location Error", error.message || "Could not get your current location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const fetchGroceryData = async (lat = null, lng = null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get coordinates from location string or use provided coordinates
      const coordinates = lat && lng 
        ? { lat, lng } 
        : getCoordinatesFromLocation(inputLocation);
      
      // Calculate max_price_level from price range (0-100 scale to 1-4 scale)
      // If priceRange[1] is 25, max_price_level is 1; 50->2; 75->3; 100->4
      const maxPriceLevel = Math.min(Math.ceil(filters.priceRange[1] / 25), 4);
      
      // Prepare the request payload
      const payload = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: filters.radius * 1609, // Convert miles to meters
        max_price_level: maxPriceLevel,
        cuisine: filters.cuisine === "All Cuisines" ? "healthy" : filters.cuisine, 
        budget: filters.priceRange[1]
      };

      console.log("Sending grocery API request with payload:", payload);

      // Make the API request
      const response = await fetch("http://localhost:8000/groceries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // For GET requests, we need to append the params to the URL
        // In a real implementation, consider using a library like axios or a URL builder
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Grocery API response:", data);

      // Set the store and parse recipes from the response
      setStore(data.store);
      
      // Try to parse the recipes string as JSON
      try {
        // The API returns recipes as a string, so we need to parse it
        const parsedRecipes = JSON.parse(data.recipes);
        setRecipes(Array.isArray(parsedRecipes) ? parsedRecipes : [parsedRecipes]);
      } catch (parseError) {
        console.error("Error parsing recipes:", parseError);
        
        // If it's not valid JSON, just use the string directly
        setRecipes([{ 
          name: "Recipes", 
          description: "Recipes provided by the API are not in the expected format.", 
          rawContent: data.recipes
        }]);
      }
    } catch (err) {
      console.error("Error fetching grocery data:", err);
      setError(err.message || "An error occurred while fetching grocery stores");
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
                  <Text key={idx} style={styles.ingredient}>• {ingredient}</Text>
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
          <Text style={styles.totalCost}>Estimated cost: ${item.totalCost}</Text>
        )}
      </View>
    );
  };

  const handleStoreSelect = (store) => {
    // Navigate to store detail page
    router.push(`/consumer/grocery/store/${store.id}`);
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
            <ActivityIndicator size="small" color="#4CAF50" style={styles.locationLoader} />
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
        <View style={styles.contentContainer}>
          <TouchableOpacity 
            style={styles.storeInfoContainer} 
            onPress={() => handleStoreSelect(store)}
          >
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeAddress}>{store.address}</Text>
            <Text style={styles.storePriceLevel}>
              Price Level: {Array(store.price_level).fill("$").join("")}
            </Text>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color="#4CAF50" 
              style={styles.chevronIcon} 
            />
          </TouchableOpacity>
          
          <Text style={styles.recipesHeader}>Recommended Recipes</Text>
          
          <FlatList
            data={recipes}
            keyExtractor={(item, index) => `recipe-${index}`}
            renderItem={renderRecipeItem}
            contentContainerStyle={styles.recipesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="store" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>No grocery stores found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters or location</Text>
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
  contentContainer: {
    flex: 1,
    padding: 16,
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
