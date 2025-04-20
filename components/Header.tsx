import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("screen");

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  transparent?: boolean;
}

export default function Header({
  showBackButton = false,
  title = "EigenFood",
  transparent = false,
}: HeaderProps) {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View
        style={[
          styles.container,
          transparent ? styles.containerTransparent : styles.containerSolid,
        ]}
      >
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Image
              source={require("../assets/images/diet1.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    borderBottomWidth: 1,
  },
  containerSolid: {
    backgroundColor: "#E8F5E9",
    borderBottomColor: "#C8E6C9",
  },
  containerTransparent: {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  backText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  logo: {
    width: 28,
    height: 28,
    marginLeft: 8,
  },
});
