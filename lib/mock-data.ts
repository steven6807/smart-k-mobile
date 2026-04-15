import { TenantUser, PaymentItem, NoticeItem, MaintenanceItem, ParkingItem } from './types';

export const currentUser: TenantUser = {
  id: 't1', name: '김민준', unit_number: '301', unit_id: 'u3',
  floor: 3, nationality: 'Korean', phone: '+82-10-1000-5000', email: 'minjun.kim@email.com',
};

export const payments: PaymentItem[] = [
  { id: 'p1', month: '2026-04', rent: 35000, management_fee: 4000, total: 39000, status: 'pending' },
  { id: 'p2', month: '2026-03', rent: 35000, management_fee: 4000, total: 39000, status: 'paid', paid_date: '2026-03-01', method: 'gcash' },
  { id: 'p3', month: '2026-02', rent: 35000, management_fee: 4000, total: 39000, status: 'paid', paid_date: '2026-02-01', method: 'bank_transfer' },
  { id: 'p4', month: '2026-01', rent: 35000, management_fee: 4000, total: 39000, status: 'paid', paid_date: '2026-01-03', method: 'gcash' },
  { id: 'p5', month: '2025-12', rent: 35000, management_fee: 4000, total: 39000, status: 'paid', paid_date: '2025-12-01', method: 'cash' },
];

export const notices: NoticeItem[] = [
  { id: 'n1', title: '4월 정기 방역 안내', content: '4월 20일(토) 오전 10시~12시 전체 방역이 실시됩니다.', category: 'maintenance', is_pinned: true, created_at: '2026-04-10' },
  { id: 'n2', title: '엘리베이터 정기 점검', content: '4월 18일(수) 오후 2시~4시 1호기 엘리베이터 점검으로 운행이 중단됩니다.', category: 'maintenance', is_pinned: false, created_at: '2026-04-08' },
  { id: 'n3', title: '주차장 이용 규정 변경', content: '5월 1일부터 방문 차량 사전 등록제가 시행됩니다.', category: 'general', is_pinned: false, created_at: '2026-04-05' },
];

export const myRequests: MaintenanceItem[] = [
  { id: 'm1', title: '화장실 수도꼭지 누수', description: '세면대 수도꼭지에서 물이 계속 떨어짐', category: 'plumbing', status: 'open', created_at: '2026-04-05' },
];

export const myParking: ParkingItem[] = [
  { id: 'pk1', visitor_name: '김철수', vehicle_number: '12가 3456', purpose: '가족 방문', status: 'entered', entry_time: '2026-04-14T10:00' },
];

export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}
