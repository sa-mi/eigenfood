import { Stack } from "expo-router";
import Header from "../components/Header";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => {
          // Determine if this screen needs a back button
          console.log(props.route.name);
          const showBackButton = props.route.name !== "(tabs)/index";

          // Always use EigenFood as the title
          return <Header showBackButton={showBackButton} title="EigenFood" />;
        },
      }}
    />
  );
}
