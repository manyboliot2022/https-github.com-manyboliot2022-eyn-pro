
export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'ADMIN' | 'VENDEUR';
  password?: string;
}

export interface Family {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
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
  type: 'IN' | 'OUT';
  amount: number;
  method: PaymentMethod;
  description: string;
  category: string;
  clientId?: string;
  supplierId?: string;
  isReservation?: boolean;
}

export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  buyPrice: number;
  quantity: number;
}

export interface RefundRequest {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  amount: number;
  items: { id: string, name: string, quantity: number }[];
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
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

export const AppMode = {
  CALCULATOR: 'CALCULATOR',
  MANAGER: 'MANAGER',
  POS: 'POS',
  FINANCE: 'FINANCE',
  SETTINGS: 'SETTINGS'
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
  name: "Everything You Need",
  tagline: "Qualité & Beauté à votre portée",
  phoneGn: "+224 625 24 53 50",
  phoneSn: "+221 77 588 99 48",
  whatsapp: "224625245350",
  socials: "Everytinguned",
  mapAddress: "Conakry, Guinée",
  logoUrl: "https://cdn-icons-png.flaticon.com/512/3050/3050212.png"
};

export const PRE_DETECTED_PRODUCTS = [
  // Crèmes & Hydratants
  { name: 'Vaseline Intensive Care', category: 'Crèmes & Hydratants' },
  { name: 'Vaseline Healing Jelly', category: 'Crèmes & Hydratants' },
  { name: 'Vaseline Aloe Vera', category: 'Crèmes & Hydratants' },
  { name: 'Nivea Cream (Bleue)', category: 'Crèmes & Hydratants' },
  { name: 'Nivea Soft', category: 'Crèmes & Hydratants' },
  { name: 'Cerave Moisturizing Lotion', category: 'Crèmes & Hydratants' },
  { name: 'Cerave Moisturizing Cream', category: 'Crèmes & Hydratants' },
  { name: 'Ponds Gold Radiance', category: 'Crèmes & Hydratants' },
  { name: 'Ponds Cold Cream', category: 'Crèmes & Hydratants' },
  { name: 'Jergens Original Scent', category: 'Crèmes & Hydratants' },
  { name: 'Jergens Ultra Healing', category: 'Crèmes & Hydratants' },
  { name: 'Cetaphil Moisturizing Cream', category: 'Crèmes & Hydratants' },
  { name: 'Aveeno Daily Moisturizing', category: 'Crèmes & Hydratants' },
  { name: 'Eucerin Roughness Relief', category: 'Crèmes & Hydratants' },
  { name: 'Palmer\'s Cocoa Butter', category: 'Crèmes & Hydratants' },
  
  // Soins Cheveux
  { name: 'Défrisant Dark and Lovely', category: 'Soins Cheveux' },
  { name: 'Défrisant ORS Olive Oil', category: 'Soins Cheveux' },
  { name: 'Gel Coiffant Eco Styler', category: 'Soins Cheveux' },
  { name: 'Gel Coiffant Gummy', category: 'Soins Cheveux' },
  { name: 'Sérum Cheveux Anti-Frisottis', category: 'Soins Cheveux' },
  { name: 'Huile d\'Argan Pure', category: 'Soins Cheveux' },
  { name: 'Huile de Coco Vierge', category: 'Soins Cheveux' },
  { name: 'Cantu Shea Butter Leave-in', category: 'Soins Cheveux' },
  { name: 'Shea Moisture Curl Enhancing', category: 'Soins Cheveux' },
  { name: 'Mielle Rosemary Mint Oil', category: 'Soins Cheveux' },
  
  // Nettoyants
  { name: 'Savon Noir Dudu Osun', category: 'Nettoyants' },
  { name: 'Gel Nettoyant Cerave Foaming', category: 'Nettoyants' },
  { name: 'Nettoyant Facial Neutrogena', category: 'Nettoyants' },
  { name: 'Savon Gommant Fair & White', category: 'Nettoyants' },
  { name: 'Lotion Tonique Simple', category: 'Nettoyants' },
  { name: 'Eau Micellaire Garnier', category: 'Nettoyants' },
  
  // Sérums & Essences
  { name: 'Sérum Vitamine C (The Ordinary)', category: 'Sérums & Essences' },
  { name: 'Sérum Niacinamide', category: 'Sérums & Essences' },
  { name: 'Sérum Acide Hyaluronique', category: 'Sérums & Essences' },
  { name: 'Sérum Anti-Rides Rétinol', category: 'Sérums & Essences' },
  { name: 'Essence Hydratante Escargot', category: 'Sérums & Essences' },
  { name: 'Bio-Oil Skincare Oil', category: 'Sérums & Essences' },
  
  // Eclaircissants & Spécifiques
  { name: 'Lait Carowhite', category: 'Eclaircissants' },
  { name: 'Crème Pure Skin', category: 'Eclaircissants' },
  { name: 'Lait Paw Paw', category: 'Eclaircissants' },
  { name: 'Crème G&G Teint Uniforme', category: 'Eclaircissants' },
  { name: 'Lait Clear Essence', category: 'Eclaircissants' }
];
