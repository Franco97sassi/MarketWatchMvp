import { create } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  StockHistoryItem,
  StockQuote,
  StockSearchItem,
} from "../types/stock";

const developmentHost = Constants.expoConfig?.hostUri?.split(":")[0];
const defaultHost = Platform.OS === "web" ? "127.0.0.1" : developmentHost ?? "10.0.2.2";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${defaultHost}:8000`;

const client = create({
  baseURL: API_BASE_URL,
  timeout: 12_000,
  headers: { Accept: "application/json" },
});

export const stockApi = {
  search: async (query: string): Promise<StockSearchItem[]> => {
    const response = await client.get("/stocks/search", {
      params: { query },
    });

    return response.data;
  },

  getQuote: async (symbol: string): Promise<StockQuote> => {
    const response = await client.get(`/stocks/${encodeURIComponent(symbol)}/quote`);
    return response.data;
  },

  getHistory: async (symbol: string): Promise<StockHistoryItem[]> => {
    const response = await client.get(`/stocks/${encodeURIComponent(symbol)}/history`);
    return response.data;
  },

  getFavorites: async (): Promise<string[]> => {
    const response = await client.get("/stocks/favorites/list");
    return response.data;
  },

  addFavorite: async (symbol: string): Promise<string[]> => {
    const response = await client.post("/stocks/favorites", {
      symbol,
    });

    return response.data.favorites;
  },

  removeFavorite: async (symbol: string): Promise<string[]> => {
    const response = await client.delete(`/stocks/favorites/${encodeURIComponent(symbol)}`);

    return response.data.favorites;
  },
};
