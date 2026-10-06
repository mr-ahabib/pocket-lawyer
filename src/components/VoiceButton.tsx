import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { colors } from '@/theme';

/** Bangla voice input. Streams interim text into the input; final text replaces it. */
export function VoiceButton({ onText, disabled, light }: { onText: (text: string, final: boolean) => void; disabled?: boolean; light?: boolean }) {
  const [listening, setListening] = useState(false);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results?.[0]?.transcript ?? '';
    if (t) onText(t, !!e.isFinal);
  });
  useSpeechRecognitionEvent('error', (e) => {
    setListening(false);
    if (e.error === 'not-allowed') Alert.alert('মাইক্রোফোনের অনুমতি নেই', 'সেটিংস থেকে মাইক্রোফোনের অনুমতি দিন।');
    else if (e.error !== 'aborted' && e.error !== 'no-speech') Alert.alert('ভয়েস ইনপুট পাওয়া যায়নি', 'এই ফোনে বাংলা ভয়েস টাইপিং সমর্থিত নাও হতে পারে।');
  });

  const toggle = async () => {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) return;
    ExpoSpeechRecognitionModule.start({ lang: 'bn-BD', interimResults: true, continuous: false });
  };

  return (
    <Pressable onPress={toggle} disabled={disabled} hitSlop={8} style={[s.btn, listening && s.on]}>
      <Feather name={listening ? 'mic-off' : 'mic'} size={19} color={listening ? '#fff' : light ? colors.ink2 : colors.ink3} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.danger },
});
