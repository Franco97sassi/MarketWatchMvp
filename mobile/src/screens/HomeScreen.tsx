import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { RootStackParamList } from "../../App";
import { stockApi } from "../api/stockApi";
import { StockSearchItem } from "../types/stock";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
const POPULAR_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA"];

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState<StockSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const searchStocks = async (term = query) => {
    const normalized = term.trim();
    if (!normalized || loading) return;
    setQuery(normalized);
    Keyboard.dismiss();
    try {
      setLoading(true);
      setError("");
      setHasSearched(true);
      setStocks(await stockApi.search(normalized));
    } catch {
      setError("No pudimos conectar con el mercado. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={stocks}
        keyExtractor={(item) => `${item.symbol}-${item.region}`}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>MARKETWATCH</Text>
                <Text style={styles.title}>Invertí con claridad.</Text>
                <Text style={styles.subtitle}>Datos del mercado para decisiones más inteligentes.</Text>
              </View>
              <Pressable
                accessibilityLabel="Abrir mi watchlist"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.navigate("Favorites")}
                style={({ pressed }) => [styles.watchlistButton, pressed && styles.pressed]}
              >
                <Ionicons name="bookmark-outline" size={22} color="#171A2B" />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#777B8F" />
              <TextInput
                accessibilityLabel="Buscar acciones"
                autoCapitalize="characters"
                autoCorrect={false}
                onChangeText={setQuery}
                onSubmitEditing={() => searchStocks()}
                placeholder="Buscar empresa o ticker"
                placeholderTextColor="#8D90A0"
                returnKeyType="search"
                style={styles.input}
                value={query}
              />
              {query.length > 0 && !loading ? (
                <Pressable accessibilityLabel="Limpiar búsqueda" hitSlop={8} onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#B1B3BF" />
                </Pressable>
              ) : null}
              {loading ? <ActivityIndicator color="#7C5CFC" /> : null}
            </View>

            <Text style={styles.sectionLabel}>TENDENCIAS</Text>
            <View style={styles.chips}>
              {POPULAR_SYMBOLS.map((symbol) => (
                <Pressable key={symbol} onPress={() => searchStocks(symbol)} style={styles.chip}>
                  <Text style={styles.chipText}>{symbol}</Text>
                  <Ionicons name="arrow-up" size={13} color="#2A9D70" />
                </Pressable>
              ))}
            </View>

            {hasSearched ? <Text style={styles.resultTitle}>Resultados</Text> : null}
            {error ? (
              <View style={styles.feedbackCard}>
                <Ionicons name="cloud-offline-outline" size={28} color="#F05D5E" />
                <Text style={styles.feedbackTitle}>Algo salió mal</Text>
                <Text style={styles.feedbackText}>{error}</Text>
                <Pressable onPress={() => searchStocks()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : null}
            {hasSearched && !loading && !error && stocks.length === 0 ? (
              <View style={styles.feedbackCard}>
                <Ionicons name="search-outline" size={28} color="#7C5CFC" />
                <Text style={styles.feedbackTitle}>Sin coincidencias</Text>
                <Text style={styles.feedbackText}>Probá con otro nombre o símbolo bursátil.</Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityHint="Abre la cotización y el gráfico histórico"
            accessibilityRole="button"
            onPress={() => navigation.navigate("StockDetail", { symbol: item.symbol })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.logo}><Text style={styles.logoText}>{item.symbol.slice(0, 1)}</Text></View>
            <View style={styles.company}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.region} · {item.currency}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B1B3BF" />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8FC" },
  content: { padding: 22, paddingBottom: 48 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 24 },
  eyebrow: { color: "#7C5CFC", fontSize: 12, fontWeight: "800", letterSpacing: 1.8, marginBottom: 10 },
  title: { color: "#171A2B", fontSize: 34, fontWeight: "800", letterSpacing: -1 },
  subtitle: { color: "#777B8F", fontSize: 16, lineHeight: 23, marginTop: 8, maxWidth: 290 },
  watchlistButton: { width: 46, height: 46, borderRadius: 15, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E9EAF2" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFF", borderRadius: 18, borderWidth: 1, borderColor: "#E6E7EF", paddingHorizontal: 16, height: 58, marginTop: 32 },
  input: { flex: 1, color: "#171A2B", fontSize: 16 },
  sectionLabel: { color: "#9295A4", fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginTop: 24, marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  chip: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "#ECF8F3", paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12 },
  chipText: { color: "#225F4B", fontWeight: "700", fontSize: 13 },
  resultTitle: { color: "#171A2B", fontSize: 20, fontWeight: "800", marginTop: 30, marginBottom: 12 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 18, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: "#EBECF2" },
  logo: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#EFECFF", alignItems: "center", justifyContent: "center", marginRight: 13 },
  logoText: { color: "#6948E8", fontSize: 18, fontWeight: "800" },
  company: { flex: 1 },
  symbol: { color: "#171A2B", fontSize: 16, fontWeight: "800" },
  name: { color: "#4F5264", fontSize: 14, marginTop: 2 },
  meta: { color: "#9699A8", fontSize: 12, marginTop: 4 },
  feedbackCard: { alignItems: "center", backgroundColor: "#FFF", borderRadius: 20, padding: 24, marginTop: 8, borderWidth: 1, borderColor: "#EBECF2" },
  feedbackTitle: { color: "#171A2B", fontSize: 17, fontWeight: "800", marginTop: 10 },
  feedbackText: { color: "#777B8F", textAlign: "center", lineHeight: 21, marginTop: 5 },
  retryButton: { backgroundColor: "#171A2B", borderRadius: 12, marginTop: 16, paddingHorizontal: 18, paddingVertical: 10 },
  retryText: { color: "#FFF", fontWeight: "700" },
  pressed: { opacity: 0.65 },
});
