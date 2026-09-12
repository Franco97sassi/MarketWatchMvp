import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { RootStackParamList } from "../../App";
import { stockApi } from "../api/stockApi";
import { colors } from "../constants/design";
import { StockSearchItem } from "../types/stock";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
const MARKET_ITEMS = [
  { symbol: "AAPL", name: "Apple", price: "$234,41", move: "+1,32%", up: true, path: "M0 34 C18 30 21 16 39 20 S62 12 76 17 S99 4 120 8" },
  { symbol: "NVDA", name: "NVIDIA", price: "$141,97", move: "+2,84%", up: true, path: "M0 35 C16 39 23 23 37 26 S55 15 70 19 S92 8 120 5" },
  { symbol: "TSLA", name: "Tesla", price: "$352,56", move: "−0,76%", up: false, path: "M0 8 C18 11 21 26 40 20 S65 28 77 24 S99 38 120 34" },
  { symbol: "MSFT", name: "Microsoft", price: "$425,27", move: "+0,64%", up: true, path: "M0 29 C18 24 30 30 43 21 S66 25 79 16 S104 17 120 7" },
];

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

  return <SafeAreaView style={styles.safeArea}>
    <FlatList
      contentContainerStyle={styles.content}
      data={stocks}
      keyExtractor={(item) => `${item.symbol}-${item.region}`}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<>
        <View style={styles.topbar}>
          <View><Text style={styles.kicker}>NEXUS</Text><Text style={styles.greeting}>Tu mercado</Text></View>
          <View style={styles.topActions}>
            <Pressable accessibilityLabel="Buscar" onPress={() => {}} style={styles.circleButton}><Ionicons name="search" size={20} color={colors.text} /></Pressable>
            <Pressable accessibilityLabel="Abrir mi watchlist" onPress={() => navigation.navigate("Favorites")} style={styles.profileButton}><Text style={styles.profileText}>NM</Text><View style={styles.onlineDot} /></Pressable>
          </View>
        </View>

        <View style={styles.marketHero}>
          <View style={styles.marketHeading}><View><Text style={styles.marketLabel}>S&P 500</Text><Text style={styles.indexValue}>5.996,66</Text></View><View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>EN VIVO</Text></View></View>
          <View style={styles.heroChart}><Sparkline path="M0 66 C25 63 31 52 51 55 S77 38 98 43 S130 24 151 33 S183 16 208 20 S244 3 280 9" up large /></View>
          <View style={styles.heroFooter}><View style={styles.performance}><Ionicons name="arrow-up" size={14} color={colors.success} /><Text style={styles.performanceText}>0,38% hoy</Text></View><Text style={styles.updated}>Actualizado ahora</Text></View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput accessibilityLabel="Buscar acciones" autoCapitalize="characters" autoCorrect={false} onChangeText={setQuery} onSubmitEditing={() => searchStocks()} placeholder="Buscar acciones, ETFs..." placeholderTextColor={colors.textSubtle} returnKeyType="search" style={styles.input} value={query} />
          {query && !loading ? <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery("")}><Ionicons name="close-circle" size={20} color={colors.textSubtle} /></Pressable> : null}
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
        </View>

        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Movimientos del mercado</Text><Text style={styles.sectionAction}>Ver todos</Text></View>
        <View style={styles.marketList}>{MARKET_ITEMS.map((item) => <Pressable key={item.symbol} onPress={() => navigation.navigate("StockDetail", { symbol: item.symbol })} style={({ pressed }) => [styles.stockRow, pressed && styles.pressed]}>
          <View style={styles.stockLogo}><Text style={styles.stockLogoText}>{item.symbol[0]}</Text></View>
          <View style={styles.stockIdentity}><Text style={styles.stockSymbol}>{item.symbol}</Text><Text style={styles.stockName}>{item.name}</Text></View>
          <View style={styles.miniChart}><Sparkline path={item.path} up={item.up} /></View>
          <View style={styles.stockPrice}><Text style={styles.priceText}>{item.price}</Text><Text style={[styles.moveText, !item.up && styles.moveDown]}>{item.move}</Text></View>
        </Pressable>)}</View>

        {hasSearched ? <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Resultados</Text><Text style={styles.resultCount}>{stocks.length} activos</Text></View> : null}
        {error ? <Feedback icon="cloud-offline-outline" title="Sin conexión" text={error} onRetry={() => searchStocks()} /> : null}
        {hasSearched && !loading && !error && stocks.length === 0 ? <Feedback icon="search-outline" title="Sin coincidencias" text="Probá con otro nombre o símbolo bursátil." /> : null}
      </>}
      renderItem={({ item }) => <Pressable onPress={() => navigation.navigate("StockDetail", { symbol: item.symbol })} style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}>
        <View style={styles.resultLogo}><Text style={styles.resultLogoText}>{item.symbol[0]}</Text></View><View style={styles.company}><Text style={styles.symbol}>{item.symbol}</Text><Text numberOfLines={1} style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.region} · {item.currency}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>}
      ListFooterComponent={<View style={styles.disclaimer}><Ionicons name="time-outline" size={13} color={colors.textSubtle} /><Text style={styles.disclaimerText}>Datos de mercado con posible demora</Text></View>}
    />
  </SafeAreaView>;
}

function Sparkline({ path, up, large = false }: { path: string; up: boolean; large?: boolean }) {
  const color = up ? colors.success : colors.danger;
  return <Svg width="100%" height="100%" viewBox={large ? "0 0 280 72" : "0 0 120 42"} preserveAspectRatio="none"><Defs><LinearGradient id={`fill-${up}-${large}`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={color} stopOpacity="0.23" /><Stop offset="1" stopColor={color} stopOpacity="0" /></LinearGradient></Defs><Path d={`${path} L${large ? "280 72 L0 72" : "120 42 L0 42"} Z`} fill={`url(#fill-${up}-${large})`} /><Path d={path} fill="none" stroke={color} strokeWidth={large ? 2.5 : 2} strokeLinecap="round" /></Svg>;
}

function Feedback({ icon, title, text, onRetry }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onRetry?: () => void }) {
  return <View style={styles.feedback}><Ionicons name={icon} size={28} color={colors.primary} /><Text style={styles.feedbackTitle}>{title}</Text><Text style={styles.feedbackText}>{text}</Text>{onRetry ? <Pressable onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Reintentar</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 20, paddingBottom: 32 },
  topbar: { height: 82, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, kicker: { color: colors.primary, fontWeight: "900", fontSize: 10, letterSpacing: 2.2 }, greeting: { color: colors.text, fontWeight: "800", fontSize: 22, letterSpacing: -.5, marginTop: 3 }, topActions: { flexDirection: "row", alignItems: "center", gap: 10 }, circleButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }, profileButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }, profileText: { color: colors.ink, fontWeight: "900", fontSize: 12 }, onlineDot: { position: "absolute", right: 0, bottom: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background },
  marketHero: { minHeight: 214, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 18, overflow: "hidden" }, marketHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, marketLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700" }, indexValue: { color: colors.text, fontSize: 30, fontWeight: "800", letterSpacing: -1, marginTop: 3 }, liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }, liveText: { color: colors.success, fontSize: 9, fontWeight: "900", letterSpacing: .8 }, heroChart: { height: 74, marginHorizontal: -2, marginTop: 8 }, heroFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }, performance: { flexDirection: "row", alignItems: "center", gap: 3 }, performanceText: { color: colors.success, fontWeight: "800", fontSize: 13 }, updated: { color: colors.textSubtle, fontSize: 10 },
  searchBox: { height: 54, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.surfaceRaised, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15, marginTop: 16 }, input: { flex: 1, color: colors.text, fontSize: 14 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 27, marginBottom: 12 }, sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", letterSpacing: -.3 }, sectionAction: { color: colors.primary, fontSize: 12, fontWeight: "700" }, resultCount: { color: colors.textMuted, fontSize: 12 }, marketList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14 }, stockRow: { minHeight: 73, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, stockLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, stockLogoText: { color: colors.text, fontSize: 15, fontWeight: "900" }, stockIdentity: { width: 75, marginLeft: 10 }, stockSymbol: { color: colors.text, fontSize: 14, fontWeight: "800" }, stockName: { color: colors.textSubtle, fontSize: 11, marginTop: 2 }, miniChart: { flex: 1, height: 42, marginHorizontal: 10 }, stockPrice: { alignItems: "flex-end", width: 70 }, priceText: { color: colors.text, fontSize: 13, fontWeight: "700" }, moveText: { color: colors.success, fontSize: 11, fontWeight: "700", marginTop: 4 }, moveDown: { color: colors.danger },
  resultCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 17, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border }, resultLogo: { width: 45, height: 45, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginRight: 12 }, resultLogoText: { color: colors.primary, fontSize: 18, fontWeight: "900" }, company: { flex: 1 }, symbol: { color: colors.text, fontSize: 15, fontWeight: "900" }, name: { color: colors.textMuted, fontSize: 13, marginTop: 2 }, meta: { color: colors.textSubtle, fontSize: 11, marginTop: 3 },
  feedback: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, padding: 22, borderWidth: 1, borderColor: colors.border }, feedbackTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 8 }, feedbackText: { color: colors.textMuted, textAlign: "center", lineHeight: 20, marginTop: 5 }, retry: { backgroundColor: colors.primary, borderRadius: 20, marginTop: 14, paddingHorizontal: 17, paddingVertical: 9 }, retryText: { color: colors.ink, fontWeight: "800" }, disclaimer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 18 }, disclaimerText: { color: colors.textSubtle, fontSize: 10 }, pressed: { opacity: .62 },
});
