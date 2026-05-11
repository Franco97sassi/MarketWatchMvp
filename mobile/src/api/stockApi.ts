import axios from "axios";
import {
  StockHistoryItem,
  StockQuote,
  StockSearchItem,
} from "../types/stock";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
export const stockApi = {
  search: async (query: string): Promise<StockSearchItem[]> => {
    const response = await axios.get(`${API_BASE_URL}/stocks/search`, {
      params: { query },
    });

    return response.data;
  },

  getQuote: async (symbol: string): Promise<StockQuote> => {
    const response = await axios.get(`${API_BASE_URL}/stocks/${symbol}/quote`);
    return response.data;
  },

  getHistory: async (symbol: string): Promise<StockHistoryItem[]> => {
    const response = await axios.get(`${API_BASE_URL}/stocks/${symbol}/history`);
    return response.data;
  },

  getFavorites: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE_URL}/stocks/favorites/list`);
    return response.data;
  },

  addFavorite: async (symbol: string): Promise<string[]> => {
    const response = await axios.post(`${API_BASE_URL}/stocks/favorites`, {
      symbol,
    });

    return response.data.favorites;
  },

  removeFavorite: async (symbol: string): Promise<string[]> => {
    const response = await axios.delete(
      `${API_BASE_URL}/stocks/favorites/${symbol}`
    );

    return response.data.favorites;
  },
};