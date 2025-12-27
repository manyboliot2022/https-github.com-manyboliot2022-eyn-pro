
export interface Product {
  id: string;
  name: string;
  category: string;
  familyId?: string;
  description?: string;
  volume?: string;
  imageUrl?: string;
  barcode: string;
  costPrice: number; // Utilisé comme PMP
  sellPrice: number;
  stock: number;
  supplierId?: string;
  lastUpdated?: string;
}

export interface Family {
  id: string;
  name: string;
  icon?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'ADMIN' | 'VENDEUR';
  password?: string;
  isActive: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  balance: number;
}

export type PaymentMethod = 'OM' | 'MTN' | 'CASH_GNF' | 'USD' | 'EUR' | 'CFA';

export interface Transaction {
  id: string;
  date: string;
  userId: string;
  type: 'IN' | 'OUT';
  amount: number;
  method: PaymentMethod;
  description: string;
  category: string;
  clientId?: string;
  items?: { name: string, quantity: number, price: number }[];
}

export interface OrderItem {
  id: string;
  productId?: string; // Référence à un produit existant
  name: string;
  buyPrice: number;
  oldBuyPrice?: number;
  quantity: number;
  received?: boolean;
}

export interface Order {
  id: string;
  date: string;
  userId: string;
  items: OrderItem[];
  gpTotal: number;
  chargesTotal: number;
  totalArticles: number;
  totalCost: number;
  supplierId?: string;
  origin?: string;
  expectedDeliveryDate?: string;
  reference?: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
}

export const AppMode = {
  CALCULATOR: 'CALCULATOR',
  MANAGER: 'MANAGER',
  POS: 'POS',
  ADMIN: 'ADMIN'
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];

export interface CompanySettings {
  name: string;
  tagline: string;
  phoneGn: string;
  phoneSn: string;
  whatsapp: string;
  socials: string;
  mapAddress: string;
  logoUrl: string;
}

export const DEFAULT_BRAND_INFO: CompanySettings = {
  name: "EYN PRO",
  tagline: "Tout ce dont vous avez besoin",
  phoneGn: "+224 625 24 53 50",
  phoneSn: "+221 77 588 99 48",
  whatsapp: "224625245350",
  socials: "Everytinguned",
  mapAddress: "Conakry, Guinée",
  logoUrl: "https://cdn-icons-png.flaticon.com/512/3050/3050212.png"
};

export const PRE_DETECTED_PRODUCTS = [
  { name: 'Nivea Soft 200ml', category: 'Crème' },
  { name: 'Savon Dudu Osun', category: 'Savon' },
  { name: 'Lait Clarifiant 500ml', category: 'Lotion' },
  { name: 'Garnier BB Cream', category: 'Maquillage' },
  { name: 'Vaseline Petroleum Jelly', category: 'Soin' }
];

export const INITIAL_FAMILIES: Family[] = [
  { id: 'fam1', name: 'Soins Visage' },
  { id: 'fam2', name: 'Corps & Bain' },
  { id: 'fam3', name: 'Parfumerie' },
  { id: 'fam4', name: 'Maquillage' },
  { id: 'fam5', name: 'Capillaire' }
];
