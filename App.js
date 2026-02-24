import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { supabase } from './supabaseClient';
import { processAIResponse } from './AIEngine';
import AuthScreen from './AuthScreen';

export default function App() {
  const [session, setSession] = useState(null);
  const [showCam, setShowCam] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [messages, setMessages] = useState([{role: 'ai', text: 'أهلاً بك! أنا ريكتا. كيف نكتسح السوشيال ميديا اليوم؟'}]);
  const [input, setInput] = useState('');
  const cameraRef = useRef(null);

  // مراقبة جلسة تسجيل الدخول وطلب تصاريح الهاتف
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    Camera.requestCameraPermissionsAsync();
    MediaLibrary.requestPermissionsAsync();
  }, []);

  // إرسال الرسالة للذكاء الاصطناعي
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    const currentInput = input;
    setInput('');
    const aiReply = await processAIResponse(currentInput);
    setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
  };

  // تسجيل الفيديو وحفظه في الاستوديو
  const saveVideo = async () => {
    if (cameraRef.current) {
      try {
        const video = await cameraRef.current.recordAsync();
        await MediaLibrary.createAssetAsync(video.uri);
        Alert.alert("نجاح!", "تم حفظ الفيديو في الاستوديو بنجاح.");
        setShowCam(false);
      } catch (err) {
        Alert.alert("خطأ", "فشل في حفظ الفيديو.");
      }
    }
  };

  // محاكي ربط المنصات الاجتماعية
  const connectSocial = (name) => {
    Alert.alert(`ربط ${name}`, `سيتم تفعيل النشر التلقائي لـ 5 فيديوهات كرتونية يومياً على حسابك في ${name}.`, [{text: "موافق"}]);
  };

  // إذا لم يكن المستخدم مسجلاً، اظهر له صفحة الدخول
  if (!session) return <AuthScreen />;

  return (
    <View style={styles.container}>
      {/* نافذة دليل الاستخدام */}
      <Modal visible={showGuide} transparent animationType="fade">
        <View style={styles.modalBack}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>دليل Rekta 🚀</Text>
            <Text style={styles.modalText}>
              1. شات AI: اطلب أفكاراً وسيناريوهات.{"\n"}
              2. الكاميرا: صور واحفظ محلياً.{"\n"}
              3. الربط: اربط حساباتك لنشر 5 فيديوهات يومياً أوتوماتيكياً.
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowGuide(false)}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>فهمت، لنبدأ!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}><Text style={styles.headerTxt}>REKTA SOCIAL AI</Text></View>

      {!showCam ? (
        <View style={{flex: 1}}>
          <ScrollView style={styles.chatArea} contentContainerStyle={{paddingBottom: 20}}>
            {messages.map((m, i) => (
              <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userB : styles.aiB]}>
                <Text style={m.role === 'user' ? styles.uTxt : styles.aTxt}>{m.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.socialRow}>
            <TouchableOpacity onPress={() => connectSocial('Meta')} style={styles.sBtn}><Text>🔗 Meta</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => connectSocial('TikTok')} style={styles.sBtn}><Text>🔗 TikTok</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCam(true)} style={[styles.sBtn, {backgroundColor: '#34a853'}]}><Text style={{color: '#fff'}}>📸 تصوير</Text></TouchableOpacity>
          </View>

          <View style={styles.inputArea}>
            <TextInput style={styles.field} value={input} onChangeText={setInput} placeholder="اكتب فكرتك هنا..." placeholderTextColor="#999" />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}><Text style={{color: '#fff', fontSize: 20}}>🚀</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <Camera style={{flex: 1}} ref={cameraRef}>
          <View style={styles.camOverlay}>
            <TouchableOpacity style={styles.recordBtn} onPress={saveVideo}><Text style={{fontWeight: 'bold'}}>🔴 سجل واحفظ</Text></TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowCam(false)}><Text style={{color: '#fff'}}>إلغاء</Text></TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { paddingVertical: 40, backgroundColor: '#1a73e8', alignItems: 'center', elevation: 4 },
  headerTxt: { color: '#fff', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 },
  chatArea: { flex: 1, padding: 15 },
  bubble: { padding: 15, borderRadius: 20, marginBottom: 12, maxWidth: '80%', elevation: 1 },
  userB: { alignSelf: 'flex-end', backgroundColor: '#1a73e8', borderBottomRightRadius: 2 },
  aiB: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  uTxt: { color: '#fff', fontSize: 16 }, aTxt: { color: '#333', fontSize: 16 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  sBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, backgroundColor: '#f0f2f5', alignItems: 'center' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', alignItems: 'center' },
  field: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 25, paddingHorizontal: 20, height: 50, marginRight: 10, textAlign: 'right' },
  sendBtn: { backgroundColor: '#1a73e8', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modalBack: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 30, borderRadius: 25, width: '85%', elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1a73e8' },
  modalText: { fontSize: 16, lineHeight: 26, textAlign: 'right', color: '#444' },
  closeBtn: { backgroundColor: '#1a73e8', padding: 15, borderRadius: 12, marginTop: 25, alignItems: 'center' },
  camOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 },
  recordBtn: { backgroundColor: '#fff', paddingVertical: 20, paddingHorizontal: 40, borderRadius: 40, marginBottom: 20, elevation: 5 },
  backBtn: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10 }
});
