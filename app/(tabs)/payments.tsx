import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth-store';
import { payments as fallbackPayments, formatPHP, fetchPaymentsForUnit } from '../../lib/mock-data';
import { PaymentItem } from '../../lib/types';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: '완료', color: '#16a34a', bg: '#f0fdf4' },
  pending: { label: '대기', color: '#d97706', bg: '#fef3c7' },
  overdue: { label: '연체', color: '#dc2626', bg: '#fef2f2' },
};

export default function PaymentsScreen() {
  const user = useAuthStore(s => s.user);
  const [paymentsList, setPayments] = useState<PaymentItem[]>(fallbackPayments);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchPaymentsForUnit(user.unit_id);
      if (data.length > 0) setPayments(data);
    } catch (e) { console.log('Failed to fetch payments:', e); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const totalPaid = paymentsList.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);
  const pending = paymentsList.find(p => p.status === 'pending');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>총 납부액</Text>
          <Text style={styles.summaryValue}>{formatPHP(totalPaid)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>미납금</Text>
          <Text style={[styles.summaryValue, pending ? { color: '#dc2626' } : {}]}>
            {pending ? formatPHP(pending.total) : '₱0'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>납부 내역</Text>
      {paymentsList.length === 0 ? (
        <View style={{ alignItems: 'center', padding: 40 }}>
          <Text style={{ color: '#94a3b8' }}>납부 내역이 없습니다. 아래로 당겨서 새로고침.</Text>
        </View>
      ) : (
        paymentsList.map(p => {
          const cfg = statusConfig[p.status] || statusConfig.pending;
          return (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                <View>
                  <Text style={styles.cardMonth}>{p.month}</Text>
                  <Text style={styles.cardDetail}>
                    임대료 {formatPHP(p.rent)} + 관리비 {formatPHP(p.management_fee)}
                  </Text>
                  {p.paid_date && <Text style={styles.cardDate}>납부일: {p.paid_date} · {p.method}</Text>}
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>{formatPHP(p.total)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}

      {pending && (
        <TouchableOpacity style={styles.payBtn}>
          <Ionicons name="card" size={18} color="#fff" />
          <Text style={styles.payBtnText}>{pending.month} 관리비 납부하기 ({formatPHP(pending.total)})</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  summary: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  summaryLabel: { fontSize: 12, color: '#64748b' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 16 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  cardMonth: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  cardDetail: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  cardDate: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  cardRight: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563eb', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 14 },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
