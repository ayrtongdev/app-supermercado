import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import app from '../../../../fbConfig.js';


const ChatbotScreen = ({ navigation }) => {
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const scrollViewRef = useRef();

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const db = getDatabase(app);
  const messagesRef = ref(db, 'messages');

  useEffect(() => {
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages = snapshot.val();
      if (Array.isArray(messages)) {
        setChatMessages(messages);
      } else if (typeof messages === 'object' && messages !== null) {
        setChatMessages(Object.values(messages));
      } else {
        console.error('snapshot.val() não retornou um array ou um objeto:', messages);
      }
    });

    return unsubscribe;
  }, []);


  const handleSendMessage = () => {
    if (userMessage.trim() === '') return;

    const newMessage = {
      text: userMessage,
      type: 'user',
      time: getCurrentTime(),
    };

    push(messagesRef, newMessage);
    setUserMessage('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => {
        console.log('Close button pressed');
        navigation.goBack();
      }}>
        <Icon name="close-outline" size={40} color="#000" />
      </TouchableOpacity>

      <View style={styles.messageContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          ref={scrollViewRef} 
          onContentSizeChange={() => {
            scrollViewRef.current.scrollToEnd({ animated: true }); 
          }}
        >
          {Array.isArray(chatMessages) && chatMessages.map((message, index) => (
            <View
              key={index}
              style={
                message.type === 'user'
                  ? { ...styles.userMessage, alignSelf: 'flex-end' }
                  : { ...styles.botMessage, alignSelf: 'flex-start' }
              }
            >
              <Text>{message.text}</Text>
              <Text style={styles.messageTime}>{message.time}</Text>
            </View>
          ))}
        </ScrollView>
      </View>


      <View style={styles.background}>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua mensagem..."
              value={userMessage}
              onChangeText={(text) => setUserMessage(text)}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Icon name="send-outline" size={24} color="#0BB3D9" />
            </TouchableOpacity>
          </View>
        </View>

      </View>

      <View style={styles.bottomBar}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  messageContainer: {
    flex: 1,
    padding: 10,
  },
  userMessage: {
    backgroundColor: '#C8D9A3',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  botMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    maxWidth: '70%',
    padding: 10,
    marginVertical: 5,
    marginBottom: 5,
  },

  background: {
    backgroundColor: '#0BB3D9',
    paddingVertical: 10,
  },

  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 60,
    borderColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  sendIcon: {
    marginRight: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
    marginLeft: 5
  },

});

export default ChatbotScreen;