import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../config/firebase';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { colors } from '../theme/colors';

export default function AuthScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('PHONE'); // PHONE or CODE

  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        formattedNumber,
        60 // Timeout
      );
      
      setVerificationId(verificationId);
      setStep('CODE');
      Alert.alert('Verification code sent to your phone');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(auth, credential);
      navigation.replace('Chats');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SayIt</Text>
      
      {step === 'PHONE' ? (
        <>
          <Text style={styles.subtitle}>Enter your phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number (with country code)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoFocus
          />
          <TouchableOpacity
            style={styles.button}
            onPress={sendVerificationCode}
            disabled={!phoneNumber}
          >
            <Text style={styles.buttonText}>Send Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter verification code</Text>
          <TextInput
            style={styles.input}
            placeholder="Verification code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            autoFocus
          />
          <TouchableOpacity
            style={styles.button}
            onPress={verifyCode}
            disabled={!verificationCode}
          >
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
