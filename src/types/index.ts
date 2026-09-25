export type NavTab = "inicio" | "trueques" | "subastas" | "perfil";

export type ViewMode = "phone" | "fullscreen" | "canvas" | "playstore";

export interface User {
  id: number;
  name: string;
  email: string;
  rating: number;
  reviews: number;
  trades: number;
  publications: number;
}

export interface Product {
  sellerId?: number;
  id: number;
  name: string;
  price: number;
  condition: string;
  category: string;
  acceptsBarter: boolean;
  img: string;
  description: string;
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    sales: number;
  };
  specs?: [string, string][];
  createdAt?: string;
}

export interface TradeProposal {
  senderId?: number;
  sellerId?: number;
  id: number;
  wantedProductId: number;
  wantedProductName: string;
  offeredItem: string;
  offeredValue: number;
  message: string;
  senderName: string;
  sellerName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt?: string;
}

export interface AuctionItem {
  sellerId?: number;
  endsAt?: string;
  id: number;
  name: string;
  startingPrice: number;
  img: string;
  description: string;
  seller: string;
  createdAt?: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  user: string;
  amount: number;
  time: string;
  avatar: string;
  createdAt: string;
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}
