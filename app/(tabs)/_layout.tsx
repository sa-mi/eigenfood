import { Stack } from "expo-router";
import Header from "../../components/Header";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => {
          // Determine if this screen needs a back button
          const showBackButton = props.route.name !== "index";
          // Get a proper title for the screen
          const getTitle = () => {
            switch (props.route.name) {
              case "index":
                return "EigenFood";
              case "farmer":
                return "Farmer Dashboard";
              case "consumer":
                return "Find Healthy Food";
              default:
                return props.route.name;
            }
          };

          return <Header showBackButton={showBackButton} title={getTitle()} />;
        },
      }}
    />
  );
}
