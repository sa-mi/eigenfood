import React from "react";
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
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("screen");

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
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.subtitle}>Healthier choices, anywhere</Text>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.selectionSection}>
            <Text style={styles.promptText}>I am a...</Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleUserTypeSelection("farmer")}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={require("../../assets/images/farmer.png")}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.optionTitle}>Farmer</Text>
                <Text style={styles.optionDescription}>
                  List your produce and connect with health-conscious consumers
                </Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Get Started</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleUserTypeSelection("consumer")}
              >
                <View style={styles.cardImageContainer}>
                  <Image
                    source={require("../../assets/images/female.png")}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.optionTitle}>Consumer</Text>
                <Text style={styles.optionDescription}>
                  Find healthy food options and local produce near you
                </Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Get Started</Text>
                </View>
              </TouchableOpacity>
            </View>
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
  },
  heroSection: {
    height: height * 0.45,
    width: width,
    overflow: "hidden",
  },
  heroBackground: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(46, 125, 50, 0.7)",
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
  },
  selectionSection: {
    padding: 24,
    backgroundColor: "#E8F5E9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  promptText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 24,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 20,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  cardImageContainer: {
    backgroundColor: "rgba(200, 230, 201, 0.4)",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardImage: {
    width: 60,
    height: 60,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  cardButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
