import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { db, auth, storage } from '../config/firebase';
import {
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    status: '',
    avatar: null,
    phoneNumber: '',
    lastSeen: true,
    readReceipts: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setProfile({ ...userDoc.data() });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  const uploadAvatar = async (uri) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile({ avatar: downloadURL });
      
      setProfile(prev => ({ ...prev, avatar: downloadURL }));
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, updates);
      setProfile(prev => ({ ...prev, ...updates }));
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Auth');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Image
                style={styles.avatar}
                source={{
                  uri: profile.avatar || 'https://via.placeholder.com/150',
                }}
              />
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            onBlur={() => updateProfile({ name: profile.name })}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Status</Text>
          <TextInput
            style={styles.input}
            value={profile.status}
            onChangeText={(text) => setProfile(prev => ({ ...prev, status: text }))}
            onBlur={() => updateProfile({ status: profile.status })}
            placeholder="Set your status"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <Text style={styles.phoneNumber}>{profile.phoneNumber}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => updateProfile({ lastSeen: !profile.lastSeen })}
        >
          <Text style={styles.settingText}>Last Seen</Text>
          <Ionicons
            name={profile.lastSeen ? 'checkbox' : 'square-outline'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => updateProfile({ readReceipts: !profile.readReceipts })}
        >
          <Text style={styles.settingText}>Read Receipts</Text>
          <Ionicons
            name={profile.readReceipts ? 'checkbox' : 'square-outline'}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.primary,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  phoneNumber: {
    fontSize: 16,
    color: colors.text.primary,
    padding: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
