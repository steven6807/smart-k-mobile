import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const login = useAuthStore(s => s.login);
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const ok = login(unitNumber, password);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      setError('호실 번호 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Ionicons name="business" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Smart-K</Text>
        <Text style={styles.subtitle}>Aperito Tower 입주민 앱</Text>

        {/* Form */}
        <View style={styles.form}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>호실 번호</Text>
          <TextInput
            style={styles.input}
            value={unitNumber}
            onChangeText={setUnitNumber}
            placeholder="예: 301"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            secureTextEntry
          />

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? '로그인 중...' : '로그인'}</Text>
          </TouchableOpacity>

          {/* Demo */}
          <View style={styles.demo}>
            <Text style={styles.demoTitle}>테스트 계정:</Text>
            <TouchableOpacity onPress={() => { setUnitNumber('301'); setPassword('1234'); }} style={styles.demoBtn}>
              <Text style={styles.demoText}>301호 김민준 (301 / 1234)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>SPACE 888 INC. © 2026</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f5ff' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e3a5f' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 32 },
  form: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 5 },
  error: { backgroundColor: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 12, overflow: 'hidden' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#f8fafc' },
  btn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  demo: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  demoTitle: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  demoBtn: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10 },
  demoText: { fontSize: 13, color: '#475569' },
  footer: { fontSize: 12, color: '#94a3b8', marginTop: 24 },
});
