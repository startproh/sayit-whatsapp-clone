import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { db, auth } from '../config/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';

export default function ChatScreen({ route, navigation }) {
  const { chatId, name } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const typingTimeoutRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesList);
      setLoading(false);
    });

    // Update user's typing status
    const typingRef = doc(db, 'chats', chatId);
    return () => {
      unsubscribe();
      updateDoc(typingRef, {
        [`${auth.currentUser.uid}_typing`]: false,
      });
    };
  }, [chatId]);

  const handleTyping = () => {
    const typingRef = doc(db, 'chats', chatId);
    updateDoc(typingRef, {
      [`${auth.currentUser.uid}_typing`]: true,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(typingRef, {
        [`${auth.currentUser.uid}_typing`]: false,
      });
    }, 3000);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const message = {
      text: inputText.trim(),
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
      status: 'sent',
    };

    try {
      await addDoc(messagesRef, message);
      setInputText('');
      
      // Update last message in chat
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: message.text,
        lastMessageTime: message.timestamp,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId === auth.currentUser.uid;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {item.timestamp?.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
            {isOwnMessage && (
              <Ionicons
                name={item.status === 'read' ? 'checkmark-done' : 'checkmark'}
                size={16}
                color={item.status === 'read' ? colors.primary : colors.text.secondary}
                style={styles.messageStatus}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            handleTyping();
          }}
          multiline
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
  },
  ownBubble: {
    backgroundColor: colors.message.sent,
  },
  otherBubble: {
    backgroundColor: colors.message.received,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  ownMessageText: {
    color: colors.text.primary,
  },
  otherMessageText: {
    color: colors.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 4,
  },
  messageStatus: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: colors.background,
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    padding: 10,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
