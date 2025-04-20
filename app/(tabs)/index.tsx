import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
  TextInput,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import RestaurantList from "../../components/RestaurantList";

const { width, height } = Dimensions.get("screen");

// Mock data for address suggestions
const mockAddresses = [
  "123 Main St, San Francisco, CA",
  "456 Market St, San Francisco, CA",
  "789 Mission St, San Francisco, CA",
  "101 Broadway, New York, NY",
  "202 Central Park West, New York, NY",
];

// Cuisine options
const cuisineOptions = [
  "All Cuisines",
  "American",
  "Chinese",
  "Italian",
  "Mexican",
  "Japanese",
  "Indian",
  "Mediterranean",
  "Thai",
  "Vegetarian",
  "Vegan",
  "Organic",
];

// Keep the GroceryList component since we haven't replaced it yet
const GroceryList = ({ location, filters }) => {
  // Mock data for grocery stores
  const stores = [
    {
      id: "1",
      name: "Whole Foods Market",
      type: "Organic",
      price: "$$$",
      rating: 4.6,
      distance: 1.1,
    },
    {
      id: "2",
      name: "Trader Joe's",
      type: "General",
      price: "$$",
      rating: 4.8,
      distance: 1.5,
    },
    {
      id: "3",
      name: "Sprouts",
      type: "Health Foods",
      price: "$$",
      rating: 4.4,
      distance: 2.2,
    },
    {
      id: "4",
      name: "Farmer's Market",
      type: "Fresh Produce",
      price: "$",
      rating: 4.9,
      distance: 2.8,
    },
    {
      id: "5",
      name: "Local Co-op",
      type: "Community",
      price: "$$",
      rating: 4.3,
      distance: 3.4,
    },
  ];

  return (
    <View style={styles.listView}>
      <Text style={styles.listTitle}>Grocery Stores Near You</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/consumer/grocery/store/${item.id}`)}
          >
            <View style={styles.listItemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemInfo}>
                  {item.type} • {item.price}
                </Text>
                <Text style={styles.itemInfo}>
                  ⭐ {item.rating} • {item.distance} mi
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default function Index() {
  const router = useRouter();
  const [filterVisible, setFilterVisible] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [location, setLocation] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [radius, setRadius] = useState(5);
  const [cuisine, setCuisine] = useState("All Cuisines");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [maxCalories, setMaxCalories] = useState(1000);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Filter suggestions based on input
  useEffect(() => {
    if (location.length > 2) {
      const filteredAddresses = mockAddresses.filter((address) =>
        address.toLowerCase().includes(location.toLowerCase())
      );
      setAddressSuggestions(filteredAddresses);
      setShowSuggestions(filteredAddresses.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [location]);

  const handleLocationSelect = (address) => {
    setLocation(address);
    setShowSuggestions(false);
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Permission to access location was denied");
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      // Just set to "Current Location" as requested
      setLocation("Current Location");
    } catch (error) {
      console.error("Error getting location:", error);
      alert(
        "Could not get your location. Please try again or enter it manually."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleFilterBar = () => {
    setFilterVisible(!filterVisible);
  };

  const handleSearch = () => {
    console.log("Searching with filters:", {
      location,
      radius,
      cuisine,
      priceRange,
      calories: { min: 200, max: maxCalories },
    });
    router.push("/consumer");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Banner with Logo and Motto */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={require("../../assets/images/background.jpg")}
            style={styles.heroBackground}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <View style={styles.headerContainer}>
                <Text style={styles.appTitle}>EigenFood</Text>
                <Image
                  source={require("../../assets/images/diet1.png")}
                  style={styles.headerImage}
                />
              </View>
              <Text style={styles.subtitle}>
                Discover nutritious options nearby
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* Filter and Switcher Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Filter Button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={toggleFilterBar}
          >
            <MaterialIcons name="tune" size={18} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 5 }}>Filter Options</Text>
          </TouchableOpacity>

          {/* Toggle Switcher */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showRestaurants ? styles.toggleActive : null,
              ]}
              onPress={() => setShowRestaurants(true)}
            >
              <MaterialIcons
                name="restaurant"
                size={18}
                color={showRestaurants ? "#fff" : "#4CAF50"}
              />
              <Text
                style={[
                  styles.toggleText,
                  showRestaurants ? styles.toggleTextActive : null,
                ]}
              >
                Restaurants
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showRestaurants ? styles.toggleActive : null,
              ]}
              onPress={() => setShowRestaurants(false)}
            >
              <MaterialIcons
                name="shopping-cart"
                size={18}
                color={!showRestaurants ? "#fff" : "#4CAF50"}
              />
              <Text
                style={[
                  styles.toggleText,
                  !showRestaurants ? styles.toggleTextActive : null,
                ]}
              >
                Grocery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.filterBarContainer,
            filterVisible ? null : styles.filterBarHidden,
          ]}
        >
          <View style={styles.filterSection}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Search Radius</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={25}
                step={1}
                value={radius}
                onValueChange={setRadius}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#2E7D32"
              />
              <Text>{radius} miles</Text>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Cuisine Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={cuisine}
                  onValueChange={(value) => setCuisine(value)}
                  style={styles.picker}
                >
                  {cuisineOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={priceRange[1]}
                onValueChange={(value) => setPriceRange([0, value])}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#2E7D32"
              />
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>
                Max Calories: {maxCalories} cal
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={200}
                maximumValue={2000}
                step={50}
                value={maxCalories}
                onValueChange={setMaxCalories}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#2E7D32"
              />
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={toggleFilterBar}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listContainer}>
          {showRestaurants ? (
            <RestaurantList
              location={location}
              filters={{
                radius,
                cuisine,
                priceRange,
                calories: { min: 200, max: maxCalories },
              }}
            />
          ) : (
            <GroceryList
              location={location}
              filters={{
                radius,
                cuisine,
                priceRange,
                calories: { min: 200, max: maxCalories },
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  heroSection: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  heroBackground: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headerImage: {
    width: 50,
    height: 50,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    opacity: 0.9,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  filterToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 15,
  },
  filterToggleText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  filterBarContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 100,
  },
  filterBarHidden: {
    height: 0,
    overflow: "hidden",
    padding: 0,
  },
  filterSection: {
    paddingTop: 5,
    paddingBottom: 5,
  },
  filterItem: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  locationInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  locationButton: {
    height: 40,
    width: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
  },
  toggleBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toggleBar: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 28,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#888",
  },
  toggleActive: {
    backgroundColor: "#4CAF50",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    overflow: "hidden",
  },
  picker: {
    height: 40,
    width: "100%",
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: "column",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    overflow: "hidden",
  },
  listView: {
    padding: 15,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
    marginTop: 5,
  },
  listItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  itemInfo: {
    fontSize: 14,
    color: "#666",
  },
  rangeLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  caloriesContainer: {
    marginVertical: 5,
  },
});
