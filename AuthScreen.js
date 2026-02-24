import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './supabaseClient';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (type) => {
    setLoading(true);
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) Alert.alert('خطأ في العملية', error.message);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>REKTA</Text>
      <Text style={styles.subtitle}>الذكاء الاصطناعي في خدمتك</Text>
      <TextInput style={styles.input} placeholder="البريد الإلكتروني" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="كلمة المرور" secureTextEntry onChangeText={setPassword} />
      <TouchableOpacity style={styles.mainBtn} onPress={() => handleAuth('login')}>
        <Text style={styles.btnText}>{loading ? 'جاري التحقق...' : 'دخول'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleAuth('signup')}>
        <Text style={styles.link}>ليس لديك حساب؟ سجل الآن</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f8f9fa' },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#1a73e8', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 40 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, textAlign: 'right', borderWidth: 1, borderColor: '#eee' },
  mainBtn: { backgroundColor: '#1a73e8', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { textAlign: 'center', marginTop: 20, color: '#1a73e8' }
});
