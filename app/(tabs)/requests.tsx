import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores/auth-store';
import { fetchMaintenanceForUnit, submitMaintenanceRequest, uploadPhoto } from '../../lib/mock-data';
import { MaintenanceItem } from '../../lib/types';

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: '접수', color: '#2563eb', bg: '#eff6ff' },
  in_progress: { label: '진행중', color: '#d97706', bg: '#fef3c7' },
  done: { label: '완료', color: '#16a34a', bg: '#f0fdf4' },
};
const categoryIcons: Record<string, string> = { plumbing: 'water', electrical: 'flash', ac: 'snow', etc: 'build' };

export default function RequestsScreen() {
  const user = useAuthStore(s => s.user);
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<MaintenanceItem[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('plumbing');
  const [photos, setPhotos] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchMaintenanceForUnit(user.unit_id);
      setRequests(data);
    } catch (e) { console.log('Failed to fetch requests:', e); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3,
    });
    if (!result.canceled && result.assets) {
      setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 3));
    }
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!title || !user) return;
    setSubmitting(true);
    try {
      // Upload photos first
      const requestId = `m_mob_${Date.now()}`;
      const photoUrls: string[] = [];
      for (const uri of photos) {
        const url = await uploadPhoto(uri, requestId);
        if (url) photoUrls.push(url);
      }
      await submitMaintenanceRequest(user.unit_id, title, desc, category, photoUrls);
      setTitle(''); setDesc(''); setPhotos([]); setShowForm(false);
      Alert.alert('접수 완료', `민원이 접수되었습니다.${photoUrls.length > 0 ? ` (사진 ${photoUrls.length}장 첨부)` : ''}`);
      await loadData();
    } catch (e) {
      Alert.alert('오류', '민원 접수에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <TouchableOpacity style={styles.newBtn} onPress={() => setShowForm(!showForm)}>
        <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
        <Text style={styles.newBtnText}>{showForm ? '취소' : '새 민원 접수'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>제목</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="수리 요청 제목" />

          <Text style={styles.formLabel}>분류</Text>
          <View style={styles.catRow}>
            {(['plumbing', 'electrical', 'ac', 'etc'] as const).map(c => (
              <TouchableOpacity key={c} onPress={() => setCategory(c)}
                style={[styles.catBtn, category === c && styles.catBtnActive]}>
                <Ionicons name={categoryIcons[c] as any} size={16} color={category === c ? '#fff' : '#64748b'} />
                <Text style={[styles.catText, category === c && { color: '#fff' }]}>
                  {{ plumbing: '배관', electrical: '전기', ac: '에어컨', etc: '기타' }[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>설명</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={desc} onChangeText={setDesc} placeholder="상세 설명..." multiline />

          <Text style={styles.formLabel}>사진 첨부 (최대 3장)</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {photos.map((uri, idx) => (
              <View key={idx} style={{ position: 'relative' }}>
                <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                <TouchableOpacity onPress={() => removePhoto(idx)} style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 3 && (
              <TouchableOpacity onPress={pickPhoto} style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <Ionicons name="camera" size={24} color="#94a3b8" />
                <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>사진 추가</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.submitText}>{submitting ? (photos.length > 0 ? '사진 업로드 중...' : '접수 중...') : `접수하기${photos.length > 0 ? ` (사진 ${photos.length}장)` : ''}`}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>내 민원 ({requests.length}건)</Text>
      {requests.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-circle" size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>접수된 민원이 없습니다</Text>
          <Text style={styles.emptySubtext}>아래로 당겨서 새로고침</Text>
        </View>
      ) : (
        requests.map(r => {
          const cfg = statusLabels[r.status] || statusLabels.open;
          return (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={categoryIcons[r.category] as any || 'build'} size={18} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{r.title}</Text>
                  <Text style={styles.cardDate}>{r.created_at}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              {r.description ? <Text style={styles.cardDesc}>{r.description}</Text> : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f59e0b', margin: 16, padding: 14, borderRadius: 14 },
  newBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  form: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 8 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#f8fafc' },
  catRow: { flexDirection: 'row', gap: 8 },
  catBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9' },
  catBtnActive: { backgroundColor: '#2563eb' },
  catText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  submitBtn: { backgroundColor: '#f59e0b', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginHorizontal: 16, marginTop: 16, marginBottom: 12 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
  emptySubtext: { fontSize: 12, color: '#cbd5e1', marginTop: 4 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  cardDate: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 18 },
});
