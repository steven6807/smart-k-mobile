import { create } from 'zustand';
import { TenantUser } from '../lib/types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: TenantUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (unitNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (unitNumber: string, password: string) => {
    set({ loading: true });

    // 비밀번호 규칙: 호실번호 4자리 (301 → 0301)
    const expectedPw = unitNumber.padStart(4, '0');
    if (password !== expectedPw) {
      set({ loading: false });
      return false;
    }

    try {
      // Supabase에서 해당 호실의 활성 계약 조회
      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, floor')
        .eq('unit_number', unitNumber)
        .limit(1);

      if (!units || units.length === 0) {
        set({ loading: false });
        return false;
      }

      const unit = units[0];

      // 해당 호실의 활성 임대차 조회
      const { data: leases } = await supabase
        .from('leases')
        .select('id, tenant_id')
        .eq('unit_id', unit.id)
        .eq('status', 'active')
        .limit(1);

      if (!leases || leases.length === 0) {
        set({ loading: false });
        return false;
      }

      // 임차인 정보 조회
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, first_name, last_name, nationality, phone, email')
        .eq('id', leases[0].tenant_id)
        .limit(1);

      if (!tenants || tenants.length === 0) {
        set({ loading: false });
        return false;
      }

      const tenant = tenants[0];
      const user: TenantUser = {
        id: tenant.id,
        name: `${tenant.last_name} ${tenant.first_name}`,
        unit_number: unit.unit_number,
        unit_id: unit.id,
        floor: unit.floor,
        nationality: tenant.nationality || 'Other',
        phone: tenant.phone || '',
        email: tenant.email || '',
      };

      set({ user, isAuthenticated: true, loading: false });
      return true;

    } catch (e) {
      console.error('Login error:', e);
      set({ loading: false });
      return false;
    }
  },

  logout: () => set({ user: null, isAuthenticated: false }),
}));
