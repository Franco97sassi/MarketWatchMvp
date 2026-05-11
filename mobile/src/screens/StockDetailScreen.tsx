import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../App";
import { stockApi } from "../api/stockApi";
import { StockHistoryItem, StockQuote } from "../types/stock";

type Props = NativeStackScreenProps<RootStackParamList, "StockDetail">;

export default function StockDetailScreen({ route }: Props) {
  const { symbol } = route.params;

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const quoteResult = await stockApi.getQuote(symbol);
      const historyResult = await stockApi.getHistory(symbol);

      setQuote(quoteResult);
      setHistory(historyResult);
    } catch (error: any) {
      console.log("ERROR DETALLE:");
      console.log(error);

      if (error.response) {
        console.log(error.response.data);
        setErrorMessage(
          error.response.data?.detail || "No se pudieron cargar los datos."
        );
      } else {
        setErrorMessage("No se pudieron cargar los datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async () => {
    try {
      await stockApi.addFavorite(symbol);
      setFavoriteMessage("Agregado a favoritos");
    } catch {
      setFavoriteMessage("No se pudo agregar a favoritos");
    }
  };

  useEffect(() => {
    loadData();
  }, [symbol]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </SafeAreaView>
    );
  }

  if (errorMessage !== "" || !quote) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorTitle}>No se pudo cargar el detalle</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>

        <Pressable style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const prices = history.map((item) => item.close);
  const labels = history.map((item) => item.date.slice(5));
  const isPositive = quote.change >= 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.symbol}>{quote.symbol}</Text>

      <Text style={styles.price}>USD {quote.price.toFixed(2)}</Text>

      <Text style={isPositive ? styles.positive : styles.negative}>
        {quote.change.toFixed(2)} ({quote.change_percent})
      </Text>

      <Pressable style={styles.favoriteButton} onPress={addFavorite}>
        <Text style={styles.favoriteButtonText}>Agregar a favoritos</Text>
      </Pressable>

      {favoriteMessage !== "" && (
        <Text style={styles.favoriteMessage}>{favoriteMessage}</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen diario</Text>

        <View style={styles.row}>
          <Text>Apertura</Text>
          <Text>{quote.open}</Text>
        </View>

        <View style={styles.row}>
          <Text>Máximo</Text>
          <Text>{quote.high}</Text>
        </View>

        <View style={styles.row}>
          <Text>Mínimo</Text>
          <Text>{quote.low}</Text>
        </View>

        <View style={styles.row}>
          <Text>Volumen</Text>
          <Text>{quote.volume}</Text>
        </View>
      </View>

      {prices.length > 1 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.cardTitle}>Historial últimos 30 días</Text>

          <LineChart
            data={{
              labels: labels.filter((_, index) => index % 5 === 0),
              datasets: [
                {
                  data: prices.length > 1 ? prices : [0, 0],
                },
              ],
            }}
            width={Dimensions.get("window").width - 32}
            height={240}
            yAxisLabel="$"
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2,
              color: () => "#111827",
              labelColor: () => "#6b7280",
              propsForDots: {
                r: "3",
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text>No hay historial suficiente para mostrar el gráfico.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  symbol: {
    fontSize: 32,
    fontWeight: "800",
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8,
  },
  positive: {
    color: "green",
    fontSize: 18,
    marginTop: 4,
  },
  negative: {
    color: "red",
    fontSize: 18,
    marginTop: 4,
  },
  favoriteButton: {
    marginTop: 20,
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
  },
  favoriteButtonText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
  favoriteMessage: {
    marginTop: 8,
    color: "green",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  chartContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  chart: {
    borderRadius: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorMessage: {
    color: "red",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
  },
  retryButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },
});