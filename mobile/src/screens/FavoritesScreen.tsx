import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isAxiosError } from "axios";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { RootStackParamList } from "../../App";
import { stockApi } from "../api/stockApi";
import { cardShadow, colors } from "../constants/design";

type Props = NativeStackScreenProps<RootStackParamList, "Favorites">;

function errorDetail(error: unknown, fallback: string) {
  if (isAxiosError<{ detail?: string }>(error)) return error.response?.data?.detail ?? fallback;
  return fallback;
}

export default function FavoritesScreen({ navigation }: Props) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingSymbol, setDeletingSymbol] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setFavorites(await stockApi.getFavorites());
    } catch (requestError: unknown) {
      setError(errorDetail(requestError, "No pudimos cargar tu watchlist. Revisá la conexión."));
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFavorite = async (symbol: string) => {
    if (deletingSymbol) return;
    try {
      setDeletingSymbol(symbol);
      setError("");
      setFavorites(await stockApi.removeFavorite(symbol));
    } catch (requestError: unknown) {
      setError(errorDetail(requestError, `No pudimos eliminar ${symbol}. Intentá nuevamente.`));
    } finally {
      setDeletingSymbol(null);
    }
  };

  useFocusEffect(useCallback(() => { void loadFavorites(); }, [loadFavorites]));

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.loadingIcon}><Ionicons name="bookmark" size={24} color={colors.primary} /></View>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Cargando tu watchlist...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={favorites}
        keyExtractor={(item) => item}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>TU SELECCIÓN</Text>
            <Text style={styles.title}>Mis favoritos</Text>
            <Text style={styles.subtitle}>Acceso rápido a las empresas que seguís.</Text>
            {error ? (
              <View accessibilityRole="alert" style={styles.errorCard}>
                <Ionicons name="cloud-offline-outline" size={25} color={colors.danger} />
                <View style={styles.errorCopy}>
                  <Text style={styles.errorTitle}>Algo salió mal</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
                <Pressable accessibilityLabel="Reintentar cargar favoritos" onPress={loadFavorites} style={styles.retryButton}>
                  <Ionicons name="refresh" size={20} color={colors.primaryDark} />
                </Pressable>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><Ionicons name="bookmark-outline" size={30} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>Tu watchlist está vacía</Text>
            <Text style={styles.emptyText}>Buscá una acción y guardala para encontrarla rápidamente.</Text>
            <Pressable onPress={() => navigation.navigate("Home")} style={({ pressed }) => [styles.exploreButton, pressed && styles.pressed]}>
              <Text style={styles.exploreText}>Explorar acciones</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const deleting = deletingSymbol === item;
          return (
            <Pressable
              accessibilityHint="Abre la cotización y el historial"
              accessibilityRole="button"
              onPress={() => navigation.navigate("StockDetail", { symbol: item })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.logo}><Text style={styles.logoText}>{item.slice(0, 1)}</Text></View>
              <View style={styles.company}>
                <Text style={styles.symbol}>{item}</Text>
                <Text style={styles.companyHint}>Ver cotización</Text>
              </View>
              <Pressable
                accessibilityLabel={`Eliminar ${item} de favoritos`}
                accessibilityRole="button"
                disabled={Boolean(deletingSymbol)}
                hitSlop={8}
                onPress={(event) => { event.stopPropagation(); void removeFavorite(item); }}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                {deleting ? <ActivityIndicator color={colors.danger} size="small" /> : <Ionicons name="trash-outline" size={20} color={colors.danger} />}
              </Pressable>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 22, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  loadingIcon: { alignItems: "center", justifyContent: "center", width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primarySoft, marginBottom: 14 },
  loadingText: { color: colors.textMuted, marginTop: 10 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.6, marginTop: 18 },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", letterSpacing: -0.7, marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 24 },
  errorCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.dangerSoft, borderRadius: 16, padding: 14, marginBottom: 16 },
  errorCopy: { flex: 1, marginHorizontal: 12 },
  errorTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  errorText: { color: colors.danger, fontSize: 12, lineHeight: 17, marginTop: 2 },
  retryButton: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.surface },
  emptyCard: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 22, borderColor: colors.border, borderWidth: 1, padding: 28, ...cardShadow },
  emptyIcon: { alignItems: "center", justifyContent: "center", width: 62, height: 62, borderRadius: 20, backgroundColor: colors.primarySoft },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 16 },
  emptyText: { color: colors.textMuted, lineHeight: 21, marginTop: 7, textAlign: "center" },
  exploreButton: { backgroundColor: colors.primary, borderRadius: 13, marginTop: 20, paddingHorizontal: 20, paddingVertical: 12 },
  exploreText: { color: colors.surface, fontWeight: "800" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 11, ...cardShadow },
  logo: { alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 15, backgroundColor: colors.primarySoft },
  logoText: { color: colors.primaryDark, fontSize: 19, fontWeight: "800" },
  company: { flex: 1, marginLeft: 13 },
  symbol: { color: colors.text, fontSize: 17, fontWeight: "800" },
  companyHint: { color: colors.textSubtle, fontSize: 12, marginTop: 3 },
  deleteButton: { alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 13, backgroundColor: colors.dangerSoft },
  pressed: { opacity: 0.62 },
});
