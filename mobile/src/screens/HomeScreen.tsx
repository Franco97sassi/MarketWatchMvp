import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../App";
import { stockApi } from "../api/stockApi";
import { StockSearchItem } from "../types/stock";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState<StockSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchStocks = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError("");

      const result = await stockApi.search(query);
      setStocks(result);
    } catch {
      setError("No se pudo buscar la acción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Buscar acciones</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ej: IBM, AAPL, MSFT"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="characters"
        />

        <Pressable style={styles.button} onPress={searchStocks}>
          <Text style={styles.buttonText}>Buscar</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.favoritesButton}
        onPress={() => navigation.navigate("Favorites")}
      >
        <Text style={styles.favoritesButtonText}>Ver favoritos</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" />}

      {error !== "" && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={stocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate("StockDetail", {
                symbol: item.symbol,
              })
            }
          >
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.region} · {item.currency}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  favoritesButton: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  favoritesButtonText: {
    textAlign: "center",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  symbol: {
    fontSize: 20,
    fontWeight: "700",
  },
  name: {
    fontSize: 15,
    marginTop: 4,
  },
  meta: {
    marginTop: 4,
    color: "#6b7280",
  },
  error: {
    color: "red",
    marginVertical: 12,
  },
});