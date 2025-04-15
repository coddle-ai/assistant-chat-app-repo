import { Stack } from "expo-router";
import DailyLogsScreen from "../../screens/DailyLogsScreen";

export default function DailyLogsRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Daily Logs",
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "600",
          },
        }}
      />
      <DailyLogsScreen />
    </>
  );
}
