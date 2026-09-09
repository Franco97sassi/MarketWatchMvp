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
    primary: "#21E6A7",
    background: "#07111F",
    card: "#0D1B2B",
    text: "#F4F8FC",
    border: "#1A2B3E",
    notification: "#F05D5E",
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
          headerTitleStyle: { fontWeight: "700" },
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
