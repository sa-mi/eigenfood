import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const handleUserTypeSelection = (userType: "farmer" | "consumer") => {
    console.log(`Selected user type: ${userType}`);
    router.push(userType === "farmer" ? "/farmer" : "/consumer");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.appTitle}>EigenFood</Text>
            <Image
              source={require("../../assets/images/diet1.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Healthier choices, anywhere</Text>

          <View style={styles.selectionContainer}>
            <Text style={styles.promptText}>I am a...</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleUserTypeSelection("farmer")}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.optionText}>Farmer</Text>
                <Image
                  source={require("../../assets/images/farmer.png")}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleUserTypeSelection("consumer")}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.optionText}>Consumer</Text>
                <Image
                  source={require("../../assets/images/female.png")}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
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
    alignItems: "center",
    padding: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#558B2F",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  dietOptionsContainer: {
    width: "100%",
    marginBottom: 30,
  },
  dietCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dietCard: {
    width: "30%",
    alignItems: "center",
  },
  dietImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dietImagePlaceholder: {
    fontSize: 30,
  },
  dietTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  selectionContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  promptText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 30,
  },
  optionButton: {
    width: "80%",
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  healthyFoodShowcase: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  healthyFoodImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#C8E6C9",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  healthyFoodImagePlaceholder: {
    fontSize: 40,
  },
  healthyFoodText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  headerImage: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
});
