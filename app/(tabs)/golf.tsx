import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/auth-store';
import { supabase } from '../../lib/supabase';

interface Reservation {
  id: string;
  unit_number: string;
  tenant_name: string;
  reservation_date: string;
  time_slot: string;
  duration_minutes: number;
  bay_number: number;
  status: string;
}

// 운영 시간: 06:00 ~ 22:00, 1시간 단위
const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

const BAYS = [1, 2, 3]; // 타석 3개

function getToday() { return new Date().toISOString().split('T')[0]; }
function getDateStr(offset: number) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}
function formatDateKR(dateStr: string) {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

export default function GolfScreen() {
  const user = useAuthStore(s => s.user);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(false);

  // 7일치 날짜
  const dates = Array.from({ length: 7 }, (_, i) => getDateStr(i));

  const loadData = useCallback(async () => {
    try {
      // 선택 날짜의 모든 예약
      const { data: dayRes } = await supabase
        .from('golf_reservations')
        .select('*')
        .eq('reservation_date', selectedDate)
        .neq('status', 'cancelled');

      // 내 예약 (향후 7일)
      const { data: myRes } = await supabase
        .from('golf_reservations')
        .select('*')
        .eq('unit_number', user?.unit_number || '')
        .gte('reservation_date', getToday())
        .neq('status', 'cancelled')
        .order('reservation_date', { ascending: true });

      setReservations((dayRes || []) as Reservation[]);
      setMyReservations((myRes || []) as Reservation[]);
    } catch (e) { console.log('Failed:', e); }
  }, [selectedDate, user]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  function isSlotBooked(timeSlot: string, bay: number) {
    return reservations.some(r => r.time_slot === timeSlot && r.bay_number === bay);
  }

  function isMySlot(timeSlot: string, bay: number) {
    return reservations.some(r => r.time_slot === timeSlot && r.bay_number === bay && r.unit_number === user?.unit_number);
  }

  function isPast(timeSlot: string) {
    if (selectedDate > getToday()) return false;
    if (selectedDate < getToday()) return true;
    const now = new Date();
    const [h] = timeSlot.split(':').map(Number);
    return now.getHours() >= h;
  }

  async function handleBook(timeSlot: string, bay: number) {
    if (!user) return;
    Alert.alert(
      '예약 확인',
      `${formatDateKR(selectedDate)} ${timeSlot}\n타석 ${bay}번\n1시간\n\n예약하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '예약', onPress: async () => {
          setBooking(true);
          try {
            await supabase.from('golf_reservations').insert({
              id: `golf_${Date.now()}`,
              unit_id: user.unit_id,
              unit_number: user.unit_number,
              tenant_name: user.name,
              reservation_date: selectedDate,
              time_slot: timeSlot,
              duration_minutes: 60,
              bay_number: bay,
              status: 'confirmed',
            });
            Alert.alert('예약 완료! 🏌️', `${formatDateKR(selectedDate)} ${timeSlot}\n타석 ${bay}번`);
            await loadData();
          } catch (e) {
            Alert.alert('오류', '예약에 실패했습니다.');
          }
          setBooking(false);
        }},
      ]
    );
  }

  async function handleCancel(id: string) {
    Alert.alert('예약 취소', '이 예약을 취소하시겠습니까?', [
      { text: '아니오', style: 'cancel' },
      { text: '취소하기', style: 'destructive', onPress: async () => {
        await supabase.from('golf_reservations').update({ status: 'cancelled' }).eq('id', id);
        Alert.alert('취소 완료', '예약이 취소되었습니다.');
        await loadData();
      }},
    ]);
  }

  const availableCount = TIME_SLOTS.reduce((sum, ts) => {
    if (isPast(ts)) return sum;
    return sum + BAYS.filter(b => !isSlotBooked(ts, b)).length;
  }, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="golf" size={28} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>골프연습장</Text>
          <Text style={styles.headerSub}>타석 {BAYS.length}개 · 06:00~22:00 · 1시간 단위</Text>
        </View>
      </View>

      {/* Date Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {dates.map(d => {
          const isSelected = d === selectedDate;
          const isToday = d === getToday();
          return (
            <TouchableOpacity key={d} onPress={() => setSelectedDate(d)}
              style={[styles.dateBtn, isSelected && styles.dateBtnActive]}>
              <Text style={[styles.dateText, isSelected && styles.dateTextActive]}>
                {formatDateKR(d)}
              </Text>
              {isToday && <Text style={[styles.todayBadge, isSelected && { color: '#fff' }]}>오늘</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Availability Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {formatDateKR(selectedDate)} · 예약 가능: <Text style={{ fontWeight: '800', color: availableCount > 0 ? '#16a34a' : '#dc2626' }}>{availableCount}타임</Text>
        </Text>
      </View>

      {/* Time Slot Grid */}
      <View style={styles.grid}>
        {/* Header */}
        <View style={styles.gridRow}>
          <View style={[styles.gridCell, styles.gridHeader, { flex: 1.2 }]}>
            <Text style={styles.gridHeaderText}>시간</Text>
          </View>
          {BAYS.map(b => (
            <View key={b} style={[styles.gridCell, styles.gridHeader]}>
              <Text style={styles.gridHeaderText}>타석{b}</Text>
            </View>
          ))}
        </View>

        {/* Slots */}
        {TIME_SLOTS.map(ts => {
          const past = isPast(ts);
          return (
            <View key={ts} style={styles.gridRow}>
              <View style={[styles.gridCell, { flex: 1.2, backgroundColor: '#f8fafc' }]}>
                <Text style={[styles.timeText, past && { color: '#cbd5e1' }]}>{ts}</Text>
              </View>
              {BAYS.map(b => {
                const booked = isSlotBooked(ts, b);
                const mine = isMySlot(ts, b);
                return (
                  <TouchableOpacity key={b}
                    style={[styles.gridCell,
                      past ? styles.slotPast :
                      mine ? styles.slotMine :
                      booked ? styles.slotBooked :
                      styles.slotOpen
                    ]}
                    disabled={past || booked || booking}
                    onPress={() => handleBook(ts, b)}
                  >
                    <Text style={[styles.slotText,
                      past ? { color: '#cbd5e1' } :
                      mine ? { color: '#fff' } :
                      booked ? { color: '#dc2626' } :
                      { color: '#16a34a' }
                    ]}>
                      {past ? '-' : mine ? '내예약' : booked ? '예약됨' : '가능'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#dcfce7' }]} /><Text style={styles.legendText}>예약 가능</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#fee2e2' }]} /><Text style={styles.legendText}>예약됨</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} /><Text style={styles.legendText}>내 예약</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#f1f5f9' }]} /><Text style={styles.legendText}>지난 시간</Text></View>
      </View>

      {/* My Reservations */}
      <Text style={styles.sectionTitle}>내 예약 ({myReservations.length}건)</Text>
      {myReservations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="golf-outline" size={32} color="#cbd5e1" />
          <Text style={styles.emptyText}>예약이 없습니다</Text>
          <Text style={styles.emptySub}>위에서 원하는 시간을 터치하여 예약하세요</Text>
        </View>
      ) : (
        myReservations.map(r => (
          <View key={r.id} style={styles.myCard}>
            <View style={styles.myCardLeft}>
              <Ionicons name="golf" size={20} color="#2563eb" />
              <View>
                <Text style={styles.myCardDate}>{formatDateKR(r.reservation_date)} {r.time_slot}</Text>
                <Text style={styles.myCardDetail}>타석 {r.bay_number}번 · {r.duration_minutes}분</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleCancel(r.id)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#16a34a', margin: 16, padding: 20, borderRadius: 20 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#bbf7d0', marginTop: 2 },
  dateRow: { marginBottom: 12 },
  dateBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  dateBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  dateText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  dateTextActive: { color: '#fff' },
  todayBadge: { fontSize: 10, fontWeight: '700', color: '#2563eb', marginTop: 2 },
  summary: { marginHorizontal: 16, marginBottom: 12 },
  summaryText: { fontSize: 14, color: '#475569' },
  grid: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  gridRow: { flexDirection: 'row' },
  gridCell: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#f1f5f9' },
  gridHeader: { backgroundColor: '#f1f5f9', paddingVertical: 8 },
  gridHeaderText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  timeText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  slotOpen: { backgroundColor: '#f0fdf4' },
  slotBooked: { backgroundColor: '#fef2f2' },
  slotMine: { backgroundColor: '#2563eb' },
  slotPast: { backgroundColor: '#f8fafc' },
  slotText: { fontSize: 11, fontWeight: '700' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 3, borderWidth: 1, borderColor: '#e2e8f0' },
  legendText: { fontSize: 11, color: '#64748b' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  emptyCard: { alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 32 },
  emptyText: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
  emptySub: { fontSize: 12, color: '#cbd5e1', marginTop: 4 },
  myCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  myCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  myCardDate: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  myCardDetail: { fontSize: 12, color: '#64748b', marginTop: 1 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  cancelText: { fontSize: 12, fontWeight: '600', color: '#dc2626' },
});
