export type BusinessType = 'delivery' | 'reservation' | 'hotel' | 'tickets' | 'scheduling' | 'ecommerce';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled' | 'rejected' | 'returned' | 'partially_returned';

export type PlanTier = 'starter' | 'pro' | 'enterprise';

export type OrderSource = 'online' | 'counter' | 'marketplace_ifood' | 'marketplace_booking' | 'marketplace_rappi';

export type UserRole = 'admin' | 'manager' | 'cashier' | 'kitchen' | 'staff';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  notes?: string;
}

export interface PlanDef {
  id: PlanTier;
  name: string;
  price: number;
  maxBusinessTypes: number;
  features: string[];
  color: string;
}

export interface Message {
  id: string;
  sender: 'customer' | 'business';
  content: string;
  timestamp: Date;
}

export interface IntegrationConfig {
  id: string;
  provider: 'ifood' | 'booking' | 'rappi' | 'ubereats' | 'eventbrite' | 'google_reserve';
  name: string;
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: Date;
}

export interface PrinterConfig {
  autoPrintOnAccept: boolean;
  paperWidth: '58mm' | '80mm';
  fontSize: 'small' | 'normal' | 'large';
  copies: number;
  customHeader: string;
  customFooter: string;
  showCustomerAddress: boolean;
}

export interface ServiceConfig {
  autoAccept: boolean;
  businessTypes: BusinessType[];
  primaryType: BusinessType;
  workingHours: { start: string; end: string };
  currency: string;
  notificationsEnabled: boolean;
  plan: PlanTier;
  integrations: IntegrationConfig[];
  printer: PrinterConfig;
  theme: 'light' | 'dark';
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  type: BusinessType;

  duration?: number;
  capacity?: number;
  stock?: number; // Importante para controle de estoque
  sku?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  details?: string;
}

export interface StatusChange {
  status: OrderStatus;
  timestamp: Date;
  user: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerContact: string;
  customerAvatar?: string;
  type: BusinessType;
  source: OrderSource;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'online' | 'split';
  paymentDetails?: {
    receivedAmount?: number;
    change?: number;
    installments?: number;
    payments?: Array<{
      method: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'online';
      amount: number;
      installments?: number;
    }>;
  };

  schedulingDate?: Date;
  guests?: number;
  checkIn?: Date;
  checkOut?: Date;
  roomNumber?: string;
  seatNumber?: string;

  chatHistory: Message[];
  statusHistory: StatusChange[];
}

export type CashTransactionType = 'opening' | 'sale' | 'supply' | 'bleed' | 'closing';

export interface CashTransaction {
  id: string;
  type: CashTransactionType;
  amount: number;
  description: string;
  timestamp: Date;
  user: string;
}

export interface CashRegisterState {
  isOpen: boolean;
  openedAt?: Date;
  closedAt?: Date;
  startAmount: number;
  currentBalance: number;
  transactions: CashTransaction[];
}
