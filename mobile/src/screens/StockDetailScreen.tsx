import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { RootStackParamList } from "../../App";
import { stockApi } from "../api/stockApi";
import { cardShadow, colors } from "../constants/design";
import { StockHistoryItem, StockQuote } from "../types/stock";

type Props = NativeStackScreenProps<RootStackParamList, "StockDetail">;
const money = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export default function StockDetailScreen({ route }: Props) {
  const { symbol } = route.params;
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [favoriteError, setFavoriteError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const [quoteResult, historyResult] = await Promise.all([stockApi.getQuote(symbol), stockApi.getHistory(symbol)]);
      setQuote(quoteResult);
      setHistory(historyResult);
    } catch (error: unknown) {
      setErrorMessage(isAxiosError<{ detail?: string }>(error) ? error.response?.data?.detail ?? "No se pudieron cargar los datos." : "No se pudieron cargar los datos.");
    } finally { setLoading(false); }
  }, [symbol]);

  const addFavorite = async () => {
    if (saving) return;
    try {
      setSaving(true);
      setFavoriteMessage("");
      await stockApi.addFavorite(symbol);
      setFavoriteError(false);
      setFavoriteMessage("Guardado en tu watchlist");
    } catch {
      setFavoriteError(true);
      setFavoriteMessage("No se pudo guardar. Intentá nuevamente.");
    } finally { setSaving(false); }
  };

  useEffect(() => { void loadData(); }, [loadData]);

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.loadingText}>Actualizando mercado...</Text></SafeAreaView>;
  if (errorMessage || !quote) return (
    <SafeAreaView style={styles.center}>
      <View style={styles.errorIcon}><Ionicons name="cloud-offline-outline" size={32} color={colors.danger} /></View>
      <Text style={styles.errorTitle}>No se pudo cargar el detalle</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
      <Pressable accessibilityRole="button" onPress={loadData} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}><Ionicons name="refresh" size={18} color={colors.surface} /><Text style={styles.retryButtonText}>Reintentar</Text></Pressable>
    </SafeAreaView>
  );

  const prices = history.map((item) => item.close);
  const labels = history.map((item) => item.date.slice(5));
  const isPositive = quote.change >= 0;
  const changeColor = isPositive ? colors.success : colors.danger;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Text style={styles.eyebrow}>COTIZACIÓN EN USD</Text>
      <View style={styles.quoteHeader}>
        <View style={styles.tickerLogo}><Text style={styles.tickerLogoText}>{quote.symbol.slice(0, 1)}</Text></View>
        <View><Text style={styles.symbol}>{quote.symbol}</Text><Text style={styles.marketLabel}>Mercado estadounidense</Text></View>
      </View>
      <Text style={styles.price}>$ {money.format(quote.price)}</Text>
      <View style={[styles.changeBadge, { backgroundColor: isPositive ? colors.successSoft : colors.dangerSoft }]}>
        <Ionicons name={isPositive ? "trending-up" : "trending-down"} size={17} color={changeColor} />
        <Text style={[styles.changeText, { color: changeColor }]}>{isPositive ? "+" : ""}{money.format(quote.change)} ({quote.change_percent})</Text>
      </View>

      <Pressable accessibilityRole="button" disabled={saving} onPress={addFavorite} style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed, saving && styles.disabled]}>
        {saving ? <ActivityIndicator color={colors.surface} /> : <Ionicons name="bookmark-outline" size={20} color={colors.surface} />}
        <Text style={styles.favoriteButtonText}>{saving ? "Guardando..." : "Agregar a favoritos"}</Text>
      </Pressable>
      {favoriteMessage ? <Text accessibilityRole="alert" style={[styles.favoriteMessage, favoriteError && styles.favoriteError]}>{favoriteMessage}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen diario</Text>
        <View style={styles.grid}>
          <Metric label="Apertura" value={`$ ${money.format(quote.open)}`} />
          <Metric label="Máximo" value={`$ ${money.format(quote.high)}`} />
          <Metric label="Mínimo" value={`$ ${money.format(quote.low)}`} />
          <Metric label="Volumen" value={integer.format(quote.volume)} />
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Últimas 30 sesiones</Text>
        <Text style={styles.cardSubtitle}>Evolución del precio de cierre</Text>
        {prices.length > 1 ? <LineChart
          data={{ labels: labels.filter((_, index) => index % 5 === 0), datasets: [{ data: prices }] }}
          width={Dimensions.get("window").width - 76}
          height={220}
          yAxisLabel="$"
          chartConfig={{ backgroundGradientFrom: colors.surface, backgroundGradientTo: colors.surface, decimalPlaces: 0, color: (opacity = 1) => `rgba(124, 92, 252, ${opacity})`, labelColor: () => colors.textMuted, propsForDots: { r: "3", strokeWidth: "2", stroke: colors.surface }, propsForBackgroundLines: { stroke: colors.border } }}
          bezier
          style={styles.chart}
        /> : <Text style={styles.noHistory}>No hay historial suficiente para mostrar el gráfico.</Text>}
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: colors.background },
  loadingText: { color: colors.textMuted, marginTop: 12 },
  errorIcon: { width: 66, height: 66, borderRadius: 22, backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  errorTitle: { color: colors.text, fontSize: 21, fontWeight: "800", textAlign: "center" },
  errorMessage: { color: colors.textMuted, lineHeight: 21, marginTop: 8, textAlign: "center" },
  retryButton: { flexDirection: "row", gap: 8, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 13, marginTop: 20 },
  retryButtonText: { color: colors.surface, fontWeight: "800" },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginTop: 8 },
  quoteHeader: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  tickerLogo: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft, marginRight: 13 },
  tickerLogoText: { color: colors.primaryDark, fontSize: 20, fontWeight: "800" },
  symbol: { color: colors.text, fontSize: 24, fontWeight: "800" },
  marketLabel: { color: colors.textSubtle, fontSize: 12, marginTop: 2 },
  price: { color: colors.text, fontSize: 38, fontWeight: "800", letterSpacing: -1.1, marginTop: 24 },
  changeBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginTop: 7 },
  changeText: { fontSize: 14, fontWeight: "800" },
  favoriteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: colors.primary, borderRadius: 15, padding: 15, marginTop: 24 },
  favoriteButtonText: { color: colors.surface, fontWeight: "800" },
  favoriteMessage: { color: colors.success, fontSize: 13, fontWeight: "700", textAlign: "center", marginTop: 9 },
  favoriteError: { color: colors.danger },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 24, ...cardShadow },
  chartCard: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 15, overflow: "hidden", ...cardShadow },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  cardSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 3, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 9 },
  metric: { width: "50%", paddingVertical: 10 },
  metricLabel: { color: colors.textSubtle, fontSize: 12 },
  metricValue: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 4 },
  chart: { borderRadius: 16, marginLeft: -10 },
  noHistory: { color: colors.textMuted, lineHeight: 21, paddingVertical: 18 },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.72 },
});
