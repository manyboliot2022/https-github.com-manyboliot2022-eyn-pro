
export interface Product {
  id: string;
  name: string;
  category: string;
  familyId?: string;
  barcode: string;
  costPrice: number; // Prix d'achat unitaire initial
  realCost: number; // Coût de revient calculé (Achat + GP + Charges)
  sellPrice: number;
  stock: number;
  imageUrl?: string;
}

export interface Family {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  // Added optional category field for supplier management
  category?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  balance: number;
  // Added optional address field for client management
  address?: string;
}

// UserProfile defines the structure of the authenticated user
export interface UserProfile {
  id: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
}

// AuthState tracks the authentication status in the main App component
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  buyPrice: number;
  quantity: number;
}

// Transaction defines the structure for both sales (IN) and expenses (OUT)
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

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  gpTotal: number;
  chargesTotal: number;
  totalArticles: number;
  totalCost: number;
}

// CompanySettings for branding and identity
export interface CompanySettings {
  name: string;
  phone: string;
  address: string;
  logo?: string;
  whatsappEnabled: boolean;
}

// Default brand information used in settings and finance views
export const DEFAULT_BRAND_INFO: CompanySettings = {
  name: 'EYN PRO',
  phone: '',
  address: '',
  whatsappEnabled: true
};

export const AppMode = {
  CALCULATOR: 'ARRIVAGE',
  MANAGER: 'STOCK',
  POS: 'VENTE',
  ADMIN: 'ADMIN'
} as const;

export type AppMode = typeof AppMode[keyof typeof AppMode];

export const PRE_DETECTED_PRODUCTS = [
  { name: 'Vaseline Intensive Care', category: 'Corps' },
  { name: 'Vaseline Healing Jelly', category: 'Corps' },
  { name: 'Vaseline Aloe Vera', category: 'Corps' },
  { name: 'Nivea Cream Blue Tin', category: 'Visage' },
  { name: 'Nivea Soft', category: 'Visage' },
  { name: 'Cerave Hydrating Cleanser', category: 'Nettoyant' },
  { name: 'Cerave Moisturizing Cream', category: 'Crème' },
  { name: 'Ponds Gold Radiance', category: 'Soin Luxe' },
  { name: 'Savon Dudu Osun', category: 'Savon' },
  { name: 'Garnier Vitamin C Serum', category: 'Sérum' },
  { name: 'Fair & White Lait', category: 'Lotion' },
  { name: 'Bio Oil 60ml', category: 'Huile' },
  { name: 'Dove Beauty Bar', category: 'Savon' },
  { name: 'Palmers Cocoa Butter', category: 'Corps' }
];
