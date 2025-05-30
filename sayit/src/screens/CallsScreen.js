import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { db, auth } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

export default function CallsScreen({ navigation }) {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    const callsRef = collection(db, 'calls');
    const q = query(
      callsRef,
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const callsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalls(callsList);
    });

    return () => unsubscribe();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (type, status) => {
    const color = status === 'missed' ? 'red' : colors.primary;
    return (
      <Ionicons
        name={type === 'video' ? 'videocam' : 'call'}
        size={24}
        color={color}
        style={styles.callTypeIcon}
      />
    );
  };

  const handleCall = (contact, type) => {
    // Navigate to call screen with WebRTC implementation
    navigation.navigate('Call', {
      contactId: contact.id,
      contactName: contact.name,
      callType: type,
    });
  };

  const renderCallItem = ({ item }) => (
    <View style={styles.callItem}>
      <View style={styles.avatarContainer}>
        <Image
          style={styles.avatar}
          source={{ uri: item.contactAvatar || 'https://via.placeholder.com/50' }}
        />
      </View>

      <View style={styles.callInfo}>
        <Text style={styles.contactName}>{item.contactName}</Text>
        <View style={styles.callDetails}>
          {getCallIcon(item.type, item.status)}
          <Text style={[
            styles.callStatus,
            item.status === 'missed' && styles.missedCall
          ]}>
            {item.status === 'missed' ? 'Missed' : 'Outgoing'} call
          </Text>
          <Text style={styles.callTime}>
            {item.timestamp?.toDate().toLocaleString()}
          </Text>
          {item.duration > 0 && (
            <Text style={styles.duration}>
              {formatDuration(item.duration)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCall(item, 'voice')}
        >
          <Ionicons name="call" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCall(item, 'video')}
        >
          <Ionicons name="videocam" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={calls}
        renderItem={renderCallItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 10,
  },
  callItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  callInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTypeIcon: {
    marginRight: 8,
  },
  callStatus: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: 8,
  },
  missedCall: {
    color: 'red',
  },
  callTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  duration: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
});
