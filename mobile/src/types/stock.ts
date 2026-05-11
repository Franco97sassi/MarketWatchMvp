export interface StockSearchItem {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  change_percent: string;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface StockHistoryItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}