// 입주민 앱에서 사용하는 타입 (관리자 앱 types.ts의 서브셋)

export interface TenantUser {
  id: string;
  name: string;
  unit_number: string;
  unit_id: string;
  floor: number;
  nationality: string;
  phone: string;
  email: string;
}

export interface PaymentItem {
  id: string;
  month: string;
  rent: number;
  management_fee: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paid_date?: string;
  method?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
}

export interface ParkingItem {
  id: string;
  visitor_name: string;
  vehicle_number: string;
  purpose: string;
  status: string;
  entry_time?: string;
}
