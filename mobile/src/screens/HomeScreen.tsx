import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { RootStackParamList } from "../../App";
import { stockApi } from "../api/stockApi";
import { colors } from "../constants/design";
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
    setQuery(normalized); Keyboard.dismiss();
    try {
      setLoading(true); setError(""); setHasSearched(true);
      setStocks(await stockApi.search(normalized));
    } catch { setError("No pudimos conectar con el mercado. Verificá que la API esté encendida."); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={stocks}
        keyExtractor={(item) => `${item.symbol}-${item.region}`}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<>
          <View style={styles.topbar}>
            <View style={styles.brand}><View style={styles.brandMark}><Ionicons name="stats-chart" size={18} color={colors.ink} /></View><Text style={styles.brandText}>NEXUS<Text style={styles.brandAccent}>MARKET</Text></Text></View>
            <Pressable accessibilityLabel="Abrir mi watchlist" onPress={() => navigation.navigate("Favorites")} style={styles.iconButton}><Ionicons name="bookmark-outline" size={21} color={colors.text} /></Pressable>
          </View>

          <View style={styles.hero}>
            <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>MERCADO ABIERTO</Text></View>
            <Text style={styles.title}>El mercado,{"\n"}<Text style={styles.titleAccent}>en tus manos.</Text></Text>
            <Text style={styles.subtitle}>Encontrá empresas, analizá movimientos y construí tu propia watchlist.</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={21} color={colors.textMuted} />
              <TextInput accessibilityLabel="Buscar acciones" autoCapitalize="characters" autoCorrect={false} onChangeText={setQuery} onSubmitEditing={() => searchStocks()} placeholder="Buscar por empresa o ticker" placeholderTextColor={colors.textSubtle} returnKeyType="search" style={styles.input} value={query} />
              {query && !loading ? <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery("")}><Ionicons name="close-circle" size={20} color={colors.textSubtle} /></Pressable> : null}
              {loading ? <ActivityIndicator color={colors.primary} /> : null}
            </View>
          </View>

          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Acciones populares</Text><Text style={styles.sectionHint}>EXPLORAR</Text></View>
          <View style={styles.popularGrid}>{POPULAR_SYMBOLS.map((symbol, index) => (
            <Pressable key={symbol} onPress={() => searchStocks(symbol)} style={styles.marketCard}>
              <View style={[styles.stockIcon, index % 2 === 1 && styles.stockIconAlt]}><Text style={styles.stockIconText}>{symbol[0]}</Text></View>
              <Text style={styles.marketSymbol}>{symbol}</Text><Text style={styles.marketName}>{["Apple", "Microsoft", "NVIDIA", "Tesla"][index]}</Text>
              <View style={styles.viewQuote}><Text style={styles.viewQuoteText}>Ver cotización</Text><Ionicons name="arrow-forward" size={13} color={colors.success} /></View>
            </Pressable>
          ))}</View>

          {hasSearched ? <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Resultados</Text><Text style={styles.resultCount}>{stocks.length} activos</Text></View> : null}
          {error ? <Feedback icon="cloud-offline-outline" title="Sin conexión" text={error} onRetry={() => searchStocks()} /> : null}
          {hasSearched && !loading && !error && stocks.length === 0 ? <Feedback icon="search-outline" title="Sin coincidencias" text="Probá con otro nombre o símbolo bursátil." /> : null}
        </>}
        renderItem={({ item }) => <Pressable onPress={() => navigation.navigate("StockDetail", { symbol: item.symbol })} style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}>
          <View style={styles.resultLogo}><Text style={styles.resultLogoText}>{item.symbol[0]}</Text></View>
          <View style={styles.company}><Text style={styles.symbol}>{item.symbol}</Text><Text numberOfLines={1} style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.region} · {item.currency}</Text></View>
          <View style={styles.chevron}><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></View>
        </Pressable>}
      />
    </SafeAreaView>
  );
}

function Feedback({ icon, title, text, onRetry }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onRetry?: () => void }) {
  return <View style={styles.feedback}><Ionicons name={icon} size={28} color={colors.primary} /><Text style={styles.feedbackTitle}>{title}</Text><Text style={styles.feedbackText}>{text}</Text>{onRetry ? <Pressable onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: 20, paddingBottom: 48 },
  topbar: { height: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, brand: { flexDirection: "row", alignItems: "center", gap: 9 }, brandMark: { width: 35, height: 35, borderRadius: 11, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, brandText: { color: colors.text, fontWeight: "900", fontSize: 17, letterSpacing: .5 }, brandAccent: { color: colors.primary }, iconButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 26, padding: 22 }, livePill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: colors.successSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 }, liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }, liveText: { color: colors.success, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, title: { color: colors.text, fontSize: 36, lineHeight: 40, fontWeight: "900", letterSpacing: -1.3, marginTop: 18 }, titleAccent: { color: colors.primary }, subtitle: { color: colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 11 },
  searchBox: { height: 56, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.background, borderRadius: 15, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginTop: 22 }, input: { flex: 1, color: colors.text, fontSize: 15 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 27, marginBottom: 13 }, sectionTitle: { color: colors.text, fontSize: 19, fontWeight: "800" }, sectionHint: { color: colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, resultCount: { color: colors.textMuted, fontSize: 12 }, popularGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, marketCard: { width: "48.5%", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14 }, stockIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, stockIconAlt: { backgroundColor: colors.blueSoft }, stockIconText: { color: colors.text, fontSize: 16, fontWeight: "900" }, marketSymbol: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 12 }, marketName: { color: colors.textMuted, fontSize: 12, marginTop: 2 }, viewQuote: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 13 }, viewQuoteText: { color: colors.success, fontSize: 11, fontWeight: "800" },
  resultCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 17, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }, resultLogo: { width: 45, height: 45, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginRight: 12 }, resultLogoText: { color: colors.primary, fontSize: 18, fontWeight: "900" }, company: { flex: 1 }, symbol: { color: colors.text, fontSize: 15, fontWeight: "900" }, name: { color: colors.textMuted, fontSize: 13, marginTop: 2 }, meta: { color: colors.textSubtle, fontSize: 11, marginTop: 3 }, chevron: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  feedback: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, padding: 22, borderWidth: 1, borderColor: colors.border }, feedbackTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 8 }, feedbackText: { color: colors.textMuted, textAlign: "center", lineHeight: 20, marginTop: 5 }, retry: { backgroundColor: colors.primary, borderRadius: 11, marginTop: 14, paddingHorizontal: 17, paddingVertical: 9 }, retryText: { color: colors.ink, fontWeight: "800" }, pressed: { opacity: .65 },
});
