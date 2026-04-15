import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { notices, myParking } from '../../lib/mock-data';

export default function MoreScreen() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  function handleLogout() {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile */}
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color="#2563eb" />
        </View>
        <View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.unit}>{user?.unit_number}호 · {user?.floor}F · {user?.nationality}</Text>
          <Text style={styles.contact}>{user?.phone}</Text>
        </View>
      </View>

      {/* Notices */}
      <Text style={styles.sectionTitle}>공지사항</Text>
      {notices.map(n => (
        <View key={n.id} style={styles.card}>
          <View style={styles.cardRow}>
            {n.is_pinned && <Ionicons name="pin" size={12} color="#2563eb" />}
            <Text style={styles.cardTitle}>{n.title}</Text>
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>{n.content}</Text>
          <Text style={styles.cardDate}>{n.created_at}</Text>
        </View>
      ))}

      {/* Parking */}
      <Text style={styles.sectionTitle}>내 방문 차량</Text>
      {myParking.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>등록된 방문 차량이 없습니다</Text>
        </View>
      ) : (
        myParking.map(p => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardRow}>
              <Ionicons name="car" size={16} color="#22c55e" />
              <Text style={styles.cardTitle}>{p.vehicle_number}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{p.status === 'entered' ? '입차중' : p.status}</Text>
              </View>
            </View>
            <Text style={styles.cardBody}>{p.visitor_name} · {p.purpose}</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.parkBtn}>
        <Ionicons name="add-circle" size={18} color="#fff" />
        <Text style={styles.parkBtnText}>방문 차량 등록</Text>
      </TouchableOpacity>

      {/* Menu Items */}
      <Text style={styles.sectionTitle}>설정</Text>
      <MenuItem icon="language" label="언어 설정" detail="한국어" />
      <MenuItem icon="notifications" label="알림 설정" detail="ON" />
      <MenuItem icon="document-text" label="계약 정보" detail={`${user?.unit_number}호`} />
      <MenuItem icon="help-circle" label="고객센터" detail="카카오톡" />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out" size={18} color="#dc2626" />
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, label, detail }: { icon: string; label: string; detail: string }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon as any} size={20} color="#64748b" />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        <Text style={styles.menuDetail}>{detail}</Text>
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  unit: { fontSize: 13, color: '#64748b', marginTop: 2 },
  contact: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', flex: 1 },
  cardBody: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  cardDate: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
  statusBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#16a34a' },
  emptyCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 13 },
  parkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#22c55e', marginHorizontal: 16, marginTop: 8, padding: 12, borderRadius: 12 },
  parkBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 2, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuLabel: { fontSize: 14, color: '#334155' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuDetail: { fontSize: 13, color: '#94a3b8' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: 16, marginTop: 24, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
  logoutText: { color: '#dc2626', fontSize: 14, fontWeight: '600' },
});
