import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth-store';
import { payments, notices, myRequests, formatPHP } from '../../lib/mock-data';

export default function HomeScreen() {
  const user = useAuthStore(s => s.user);
  const pendingPayment = payments.find(p => p.status === 'pending');
  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const latestNotice = notices[0];
  const openRequests = myRequests.filter(r => r.status === 'open' || r.status === 'in_progress').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <View>
          <Text style={styles.welcomeHi}>안녕하세요 👋</Text>
          <Text style={styles.welcomeName}>{user?.name || '입주민'}님</Text>
          <Text style={styles.welcomeUnit}>{user?.unit_number}호 · {user?.floor}F · Aperito Tower</Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Ionicons name="person-circle" size={48} color="#fff" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickRow}>
        <QuickBtn icon="card" label="납부하기" color="#2563eb" />
        <QuickBtn icon="construct" label="민원접수" color="#f59e0b" />
        <QuickBtn icon="car" label="주차등록" color="#22c55e" />
        <QuickBtn icon="megaphone" label="공지사항" color="#8b5cf6" />
      </View>

      {/* Payment Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>이번 달 관리비</Text>
        {pendingPayment ? (
          <View style={styles.payCard}>
            <View>
              <Text style={styles.payMonth}>{pendingPayment.month}</Text>
              <Text style={styles.payAmount}>{formatPHP(pendingPayment.total)}</Text>
              <Text style={styles.payDetail}>임대료 {formatPHP(pendingPayment.rent)} + 관리비 {formatPHP(pendingPayment.management_fee)}</Text>
            </View>
            <TouchableOpacity style={styles.payBtn}>
              <Text style={styles.payBtnText}>납부하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.payCard, { backgroundColor: '#f0fdf4' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            <Text style={{ marginLeft: 8, color: '#166534', fontWeight: '600' }}>이번 달 납부 완료!</Text>
          </View>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#eff6ff' }]}>
          <Ionicons name="card-outline" size={20} color="#2563eb" />
          <Text style={styles.statNum}>{overdueCount}</Text>
          <Text style={styles.statLabel}>미납</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="construct-outline" size={20} color="#d97706" />
          <Text style={styles.statNum}>{openRequests}</Text>
          <Text style={styles.statLabel}>진행중 민원</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#f0fdf4' }]}>
          <Ionicons name="megaphone-outline" size={20} color="#16a34a" />
          <Text style={styles.statNum}>{notices.length}</Text>
          <Text style={styles.statLabel}>공지</Text>
        </View>
      </View>

      {/* Latest Notice */}
      {latestNotice && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최신 공지</Text>
          <View style={styles.noticeCard}>
            {latestNotice.is_pinned && <Ionicons name="pin" size={14} color="#2563eb" style={{ marginBottom: 4 }} />}
            <Text style={styles.noticeTitle}>{latestNotice.title}</Text>
            <Text style={styles.noticeBody} numberOfLines={2}>{latestNotice.content}</Text>
            <Text style={styles.noticeDate}>{latestNotice.created_at}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function QuickBtn({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <TouchableOpacity style={styles.quickBtn}>
      <View style={[styles.quickIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  welcomeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2563eb', margin: 16, padding: 20, borderRadius: 20 },
  welcomeHi: { fontSize: 14, color: '#93c5fd' },
  welcomeName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  welcomeUnit: { fontSize: 12, color: '#bfdbfe', marginTop: 4 },
  welcomeIcon: { opacity: 0.8 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginTop: 4 },
  quickBtn: { alignItems: 'center', flex: 1 },
  quickIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickLabel: { fontSize: 11, fontWeight: '600', color: '#475569' },
  section: { marginHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  payCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  payMonth: { fontSize: 13, color: '#64748b' },
  payAmount: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginTop: 2 },
  payDetail: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  payBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  payBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 24, gap: 10 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  noticeCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  noticeBody: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  noticeDate: { fontSize: 11, color: '#94a3b8', marginTop: 8 },
});
