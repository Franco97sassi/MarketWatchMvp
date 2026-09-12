import { NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React from "react";

import FavoritesScreen from "./src/screens/FavoritesScreen";
import HomeScreen from "./src/screens/HomeScreen";
import StockDetailScreen from "./src/screens/StockDetailScreen";

export type RootStackParamList = {
  Home: undefined;
  StockDetail: { symbol: string };
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const theme: Theme = {
  dark: false,
  colors: {
    primary: "#C8FF38",
    background: "#080A0B",
    card: "#111416",
    text: "#F5F7F3",
    border: "#24292A",
    notification: "#FF5B68",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium: { fontFamily: "System", fontWeight: "500" },
    bold: { fontFamily: "System", fontWeight: "700" },
    heavy: { fontFamily: "System", fontWeight: "800" },
  },
};

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { fontWeight: "800", fontSize: 16 },
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StockDetail" component={StockDetailScreen} options={({ route }) => ({ title: route.params.symbol })} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Mi watchlist" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
