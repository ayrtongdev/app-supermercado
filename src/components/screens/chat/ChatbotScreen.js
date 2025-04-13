import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useThemeStore from '../../../zustand/themeStore';


const loadingMessages = [
  "Pensando...",
  "Analisando as informações...",
  "Buscando dados..."
];

const ChatbotScreen = ({ navigation }) => {
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [typingBotText, setTypingBotText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [actionSuggestions, setActionSuggestions] = useState([]);
  const { darkMode } = useThemeStore();
  const inputRef = useRef('');

  const loadingIndex = useRef(0);
  const loadingInterval = useRef(null);
  const typingIntervalRef = useRef(null);
  const scrollViewRef = useRef();

  const dynamicStyles = {
    messageContainer: {
      ...styles.container,
      backgroundColor: darkMode ? '#212121' : '#F2F2F2',
    },
    container: {
      ...styles.container,
      backgroundColor: darkMode ? '#212121' : '#F2F2F2',
    },
    buttonText: {
      ...styles.buttonText,
      color: darkMode ? '#717171' : '#333',
    },
    emptyChatText: {
      ...styles.emptyChatText,
      color: darkMode ? '#F5F5F5' : '#1A0616',
    },
    background: {
      ...styles.background,
      backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
    },
    inputContainer: {
      ...styles.inputContainer,
      backgroundColor: darkMode ? '#333333' : '#FFFFFF',
    },

  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const filteredSuggestions = actionSuggestions.filter(suggestion => {
    if (userMessage.trim() === '') return false;
    return suggestion.toLowerCase().startsWith(userMessage.toLowerCase());
  });;


  const startLoadingAnimation = () => {
    setIsLoading(true);
    loadingIndex.current = 0;
    setLoadingText(loadingMessages[loadingIndex.current]);
    loadingInterval.current = setInterval(() => {
      loadingIndex.current = (loadingIndex.current + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[loadingIndex.current]);
    }, 3000);
  };


  const stopResponseGeneration = () => {
    setIsLoading(false);
    setLoadingText('');
  };


  const simulateTyping = (fullText) => {
    let index = 0;
    setTypingBotText('');

    typingIntervalRef.current = setInterval(() => {
      setTypingBotText((prev) => prev + fullText[index]);
      index++;
      if (index === fullText.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;

        const botMessage = {
          text: fullText,
          type: 'bot',
          time: getCurrentTime(),
        };
        setChatMessages((prev) => [...prev, botMessage]);
        setTypingBotText('');
        stopResponseGeneration();
      }
    }, 70);
  };

  const cancelTyping = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    if (typingBotText.trim() !== '') {
      const botMessage = {
        text: typingBotText,
        type: 'bot',
        time: getCurrentTime(),
      };
      setChatMessages(prev => [...prev, botMessage]);
    }
    setTypingBotText('');
    stopResponseGeneration();
  };

  // Mapeamento de ações e suas respectivas sugestões
  const actionSuggestionsMapping = {
    plan: {
      defaultText: "Faça um plano",
      suggestions: [
        "Faça um plano para obter uma promoção",
        "Faça um plano de compras personalizado ",
        "Faça um plano para comprar melhor os itens essenciais",
      ],
    },
    surprise: {
      defaultText: "Surpreenda-me",
      suggestions: [
        "Surpreenda-me com ofertas exclusivas",
        "Surpreenda-me com novos produtos",
        "Surpreenda-me com descontos especiais",
      ],
    },
    payment: {
      defaultText: "Quais são",
      suggestions: [
        "Quais são as opções de pagamento com cartão?",
        "Quais são as promoções para pagamento à vista?",
        "Quais são as condições para parcelamento?",
      ],
    },
    delivery: {
      defaultText: "Me fale sobre",
      suggestions: [
        "Me fale sobre como funciona a entrega em domicílio.",
        "Me fale sobre quais são as áreas atendidas pelo delivery",
        "Me fale sobre quais são as taxas de entrega e prazos?",
      ],
    },
    hours: {
      defaultText: "Me forneça",
      suggestions: [
        "Me forneça os horários de funcionamento do supermercado?",
        "Me forneça os horarios de funcionamento em feriados?",
        "Me forneça os horários de atendimento nos finais de semana?",
      ],
    },
  };

  const handleActionButton = (actionKey) => {
    const actionData = actionSuggestionsMapping[actionKey];
    if (actionData) {
      setUserMessage(actionData.defaultText);
      setActionSuggestions(actionData.suggestions);
    }
  };


  const handleSendMessage = async (customMessage) => {
    const messageToSend = String(customMessage || inputRef.current || '');
    if (messageToSend.trim() === '') return;

    const userToken = await AsyncStorage.getItem('userToken');

    const newMessage = {
      text: messageToSend,
      type: 'user',
      time: getCurrentTime(),
    };

    setChatMessages(prevMessages => [...prevMessages, newMessage]);
    startLoadingAnimation();

    try {
      const response = await fetch('http://192.168.18.48:3000/users/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ message: messageToSend })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.text) {
        if (loadingInterval.current) clearInterval(loadingInterval.current);
        setLoadingText("Gerando resposta");
        simulateTyping(data.text);
      } else {
        console.error('Resposta inesperada do backend:', data);
        if (loadingInterval.current) clearInterval(loadingInterval.current);
        stopResponseGeneration();
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      if (loadingInterval.current) clearInterval(loadingInterval.current);
      stopResponseGeneration();
    }

    // Limpa o input e as sugestões após o envio
    setUserMessage('');
    setActionSuggestions([]);
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.messageContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {chatMessages.length === 0 && !typingBotText && (
            <View style={styles.emptyChatContainer}>
              <Text style={dynamicStyles.emptyChatText}>Como posso ajudar?</Text>
              <View style={styles.predefinedButtonsContainer}>
                <TouchableOpacity
                  style={styles.predefinedButton}
                  onPress={() => handleActionButton("surprise")}>
                  <Image
                    source={require('../../../../assets/promotion.png')}
                    style={styles.buttonIcon}
                  />
                  <Text style={dynamicStyles.buttonText}>Promoção</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.predefinedButton}
                  onPress={() => handleActionButton("payment")}>
                  <Image
                    source={require('../../../../assets/cash.png')}
                    style={styles.buttonIcon}
                  />
                  <Text style={dynamicStyles.buttonText}>Pagamento</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.predefinedButton}
                  onPress={() => handleActionButton("delivery")}>
                  <Image
                    source={require('../../../../assets/delivery.png')}
                    style={styles.buttonIcon}
                  />
                  <Text style={dynamicStyles.buttonText}>Delivery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.predefinedButton}
                  onPress={() => handleActionButton("hours")}>
                  <Image
                    source={require('../../../../assets/wall-clock.png')}
                    style={styles.buttonIcon}
                  />
                  <Text style={dynamicStyles.buttonText}>Horário</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.predefinedButton}
                  onPress={() => handleActionButton("plan")}>
                  <Image
                    source={require('../../../../assets/product-return.png')}
                    style={styles.buttonIcon}
                  />
                  <Text style={dynamicStyles.buttonText}>Fazer um plano</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {chatMessages.map((message, index) => (
            <View
              key={index}
              style={
                message.type === 'user'
                  ? {
                    ...styles.userMessage,
                    alignSelf: 'flex-end',
                    backgroundColor: darkMode ? '#1565C0' : '#E0F2F7'
                  }
                  : {
                    ...styles.botMessage,
                    alignSelf: 'flex-start',
                    backgroundColor: darkMode ? '#2E7D32' : '#E8F5E9'
                  }
              }
            >
              <Text style={{ color: darkMode ? '#F5F5F5' : '#000000' }}>{message.text}</Text>
              <Text style={[styles.messageTime, { color: darkMode ? '#F5F5F5' : 'gray' }]}>{message.time}</Text>
            </View>
          ))}
          {typingBotText !== '' && (
            <View
              style={{
                ...styles.botMessage,
                alignSelf: 'flex-start',
                backgroundColor: darkMode ? '#2E7D32' : '#E8F5E9'
              }}
            >
              <Text style={{ color: darkMode ? '#F5F5F5' : '#000000' }}>{typingBotText}</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {filteredSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: darkMode ? '#333333' : '#FFFFFF' }]}>
          {filteredSuggestions.map((suggestion, index) => {
            const matchLength = userMessage.length;
            const prefixText = suggestion.substring(0, matchLength);
            const remainingText = suggestion.substring(matchLength);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setActionSuggestions([]);
                  handleSendMessage(suggestion);
                }}
                style={styles.suggestionButton}
              >
                <Text style={styles.suggestionText}>
                  {prefixText ? (
                    <Text style={{ color: darkMode ? '#0288D1' : '#0BB3D9' }}>{prefixText}</Text>
                  ) : null}
                  <Text style={{ color: darkMode ? '#717171' : '#333333' }}>{remainingText}</Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={dynamicStyles.background}>
        <View style={dynamicStyles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                { color: darkMode ? '#FFFFFF' : '#000000' },
                isLoading && { textAlign: 'center' }
              ]}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={darkMode ? '#FFFFFF' : '#000000'}
              value={isLoading ? loadingText : userMessage}
              onChangeText={(text) => {
                setUserMessage(text);
                inputRef.current = text;
              }}
              editable={!isLoading}
              multiline
            />
            {isLoading ? (
              loadingText === "Gerando resposta" ? (
                <TouchableOpacity onPress={cancelTyping}>
                  <LottieView
                    source={require('../../../../assets/stop-animation.json')}
                    autoPlay
                    loop
                    style={styles.sendButton}
                  />
                </TouchableOpacity>
              ) : (
                <LottieView
                  source={require('../../../../assets/loading-ia.json')}
                  autoPlay
                  loop
                  style={styles.sendButton}
                />
              )
            ) : (
              <TouchableOpacity style={styles.sendButton} onPress={() => handleSendMessage()}>

                <Image
                  source={darkMode ? require('../../../../assets/up-arrowdm.png') : require('../../../../assets/up-arrow.png')}
                  style={styles.sendButtonIcon}
                />

              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomBar}></View>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Icon name="close-outline" size={40} color={darkMode ? "#F5F5F5" : "#000"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    position: 'relative',
  },
  predefinedButtonsContainer: {
    marginTop: 20,
  },
  predefinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 5,
    backgroundColor: 'transparent',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  sendButtonIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain',
  },

  buttonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatText: {
    fontSize: 26,
    color: '1A0616',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 999,
    elevation: 10,
  },
  messageContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F2F2F2',
  },
  userMessage: {
    borderTopRightRadius: 5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 25,
    marginHorizontal: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  botMessage: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: 15,
    maxWidth: '70%',
    padding: 10,
    marginBottom: 25,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
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
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
    marginLeft: 5,
  },
  suggestionsContainer: {
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 20,

    borderRadius: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionButton: {
    paddingVertical: 5,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
