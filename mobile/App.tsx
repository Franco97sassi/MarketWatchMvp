import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import StockDetailScreen from "./src/screens/StockDetailScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";

export type RootStackParamList = {
  Home: undefined;
  StockDetail: {
    symbol: string;
  };
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "MarketWatch MVP",
          }}
        />

        <Stack.Screen
          name="StockDetail"
          component={StockDetailScreen}
          options={{
            title: "Detalle",
          }}
        />

        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: "Favoritos",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}