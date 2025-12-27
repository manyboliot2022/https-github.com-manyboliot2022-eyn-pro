
export interface Product {
  id: string;
  reference: string; // Code Interne (ex: VSL-001)
  name: string;
  description: string;
  category: string; // Nom de la Famille
  familyId?: string;
  barcode: string; // Code EAN / UPC
  costPrice: number; // Prix d'achat brut
  realCost: number; // Prix de revient calculé
  sellPrice: number;
  stock: number;
}

export interface Family {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  name: string;
  reference?: string;
  barcode?: string;
  buyPrice: number;
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  supplierId: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED';
  items: OrderItem[];
  gpTotal: number;
  chargesTotal: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  balance: number;
  address?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  userId: string;
  type: 'IN' | 'OUT';
  amount: number;
  method: string;
  description: string;
  category: string;
  items?: { name: string; quantity: number; price: number }[];
}

export const AppMode = {
  CALCULATOR: 'ARRIVAGE',
  MANAGER: 'STOCK',
  POS: 'VENTE',
  ADMIN: 'ADMIN'
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];

export const PRE_DETECTED_LIBRARY = [
  { name: 'Vaseline Intensive Care', category: 'Crèmes' },
  { name: 'Vaseline Healing Jelly', category: 'Crèmes' },
  { name: 'Vaseline Aloe Vera', category: 'Crèmes' },
  { name: 'Nivea Cream (Bleu)', category: 'Crèmes' },
  { name: 'Nivea Soft', category: 'Crèmes' },
  { name: 'Cerave Lotion', category: 'Hydratants' },
  { name: 'Cerave Cream', category: 'Hydratants' }
];
