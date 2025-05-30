import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { colors } from '../theme/colors';
import { db, auth } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Cannot access contacts');
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        // Format phone numbers and create a list of numbers to query
        const phoneNumbers = data
          .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map(contact => {
            const number = contact.phoneNumbers[0].number;
            return number.replace(/[^0-9+]/g, '');
          });

        // Query Firestore for users with these phone numbers
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phoneNumber', 'in', phoneNumbers));
        const querySnapshot = await getDocs(q);

        // Create a map of phone numbers to user data
        const userMap = new Map();
        querySnapshot.forEach(doc => {
          const userData = doc.data();
          userMap.set(userData.phoneNumber, {
            id: doc.id,
            ...userData,
          });
        });

        // Combine contact info with user data
        const appContacts = data
          .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map(contact => {
            const phoneNumber = contact.phoneNumbers[0].number.replace(/[^0-9+]/g, '');
            const userData = userMap.get(phoneNumber);
            if (userData) {
              return {
                id: userData.id,
                name: contact.name,
                phoneNumber,
                ...userData,
              };
            }
            return null;
          })
          .filter(contact => contact !== null);

        setContacts(appContacts);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (contact) => {
    try {
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      let existingChat = null;
      querySnapshot.forEach(doc => {
        const chatData = doc.data();
        if (chatData.participants.includes(contact.id)) {
          existingChat = { id: doc.id, ...chatData };
        }
      });

      if (existingChat) {
        navigation.navigate('Chat', {
          chatId: existingChat.id,
          name: contact.name,
        });
      } else {
        // Create new chat
        const newChat = await addDoc(chatsRef, {
          participants: [auth.currentUser.uid, contact.id],
          createdAt: serverTimestamp(),
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
        });

        navigation.navigate('Chat', {
          chatId: newChat.id,
          name: contact.name,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat');
      console.error(error);
    }
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => startChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image
          style={styles.avatar}
          source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  contactItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.status.online,
    borderWidth: 2,
    borderColor: colors.background,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
