import { TenantUser, PaymentItem, NoticeItem, MaintenanceItem, ParkingItem } from './types';
import { supabase } from './supabase';

// Default user (fallback)
export const currentUser: TenantUser = {
  id: 't1', name: '김민준', unit_number: '301', unit_id: 'u3',
  floor: 3, nationality: 'Korean', phone: '+82-10-1000-5000', email: 'minjun.kim@email.com',
};

// Fallback data
export const payments: PaymentItem[] = [
  { id: 'p1', month: '2026-04', rent: 35000, management_fee: 4000, total: 39000, status: 'pending' },
  { id: 'p2', month: '2026-03', rent: 35000, management_fee: 4000, total: 39000, status: 'paid', paid_date: '2026-03-01', method: 'gcash' },
  { id: 'p3', month: '2026-02', rent: 35000, management_fee: 4000, total: 39000, status: 'paid', paid_date: '2026-02-01', method: 'bank_transfer' },
];

export const notices: NoticeItem[] = [];
export const myRequests: MaintenanceItem[] = [];
export const myParking: ParkingItem[] = [];

export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

// === Supabase data fetchers ===
export async function fetchNotices(): Promise<NoticeItem[]> {
  const { data } = await supabase.from('notices').select('id, title, content, category, is_pinned, created_at').order('created_at', { ascending: false });
  return (data || []) as NoticeItem[];
}

export async function fetchPaymentsForUnit(unitId: string): Promise<PaymentItem[]> {
  // Get lease for this unit
  const { data: leaseData } = await supabase.from('leases').select('id, monthly_rent, management_fee').eq('unit_id', unitId).eq('status', 'active').limit(1);
  if (!leaseData || leaseData.length === 0) return payments; // fallback

  const lease = leaseData[0];
  const { data: payData } = await supabase.from('payments').select('*').eq('lease_id', lease.id).order('due_date', { ascending: false });

  return (payData || []).map((p: any) => ({
    id: p.id,
    month: p.due_date?.substring(0, 7) || '',
    rent: lease.monthly_rent,
    management_fee: lease.management_fee,
    total: p.amount_due,
    status: p.status,
    paid_date: p.paid_date,
    method: p.payment_method,
  }));
}

export async function fetchMaintenanceForUnit(unitId: string): Promise<MaintenanceItem[]> {
  const { data } = await supabase.from('maintenance_requests').select('id, title, description, category, status, created_at').eq('unit_id', unitId).order('created_at', { ascending: false });
  return (data || []) as MaintenanceItem[];
}

export async function fetchParkingForUnit(unitId: string): Promise<ParkingItem[]> {
  const { data } = await supabase.from('parking_records').select('id, visitor_name, vehicle_number, purpose, status, entry_time').eq('unit_id', unitId).order('created_at', { ascending: false });
  return (data || []) as ParkingItem[];
}

export async function uploadPhoto(uri: string, requestId: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${requestId}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('maintenance-photos').upload(fileName, blob, { contentType: `image/${ext}` });
    if (error) { console.log('Upload error:', error); return null; }
    const { data } = supabase.storage.from('maintenance-photos').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) { console.log('Photo upload failed:', e); return null; }
}

export async function submitMaintenanceRequest(unitId: string, title: string, description: string, category: string, photoUrls?: string[]) {
  const today = new Date().toISOString().split('T')[0];
  const id = `m_mob_${Date.now()}`;
  const descWithPhotos = photoUrls && photoUrls.length > 0
    ? `${description}\n\n[첨부 사진 ${photoUrls.length}장]\n${photoUrls.join('\n')}`
    : description;
  await supabase.from('maintenance_requests').insert({
    id, unit_id: unitId, requested_by: 'tenant', request_channel: 'app',
    category, title, description: descWithPhotos, priority: 'normal', status: 'open', created_at: today, updated_at: today,
  });
  return id;
}

export async function submitParkingRecord(unitId: string, visitorName: string, vehicleNumber: string, purpose: string) {
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('parking_records').insert({
    id: `pk_mob_${Date.now()}`, unit_id: unitId, visitor_name: visitorName, vehicle_number: vehicleNumber,
    vehicle_type: 'car', purpose, registered_by: 'tenant', status: 'registered', created_at: today,
  });
}
