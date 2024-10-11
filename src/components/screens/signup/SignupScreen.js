import React, { useState, useRef } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking
} from 'react-native';
import axios from 'axios';
import GoogleSign from './GoogleSign';


const SignupScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [codes, setCodes] = useState(Array(6).fill(''));
  const [waitingForCode, setWaitingForCode] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);
  const [resendCodeDisabled, setResendCodeDisabled] = useState(true);
  const [resendCodeTimer, setResendCodeTimer] = useState(60);
  const [timerColor, setTimerColor] = useState('#000000');

  

  const codeInput1 = useRef(null);
  const codeInput2 = useRef(null);
  const codeInput3 = useRef(null);
  const codeInput4 = useRef(null);
  const codeInput5 = useRef(null);
  const codeInput6 = useRef(null);

  const codeRefs = [codeInput1, codeInput2, codeInput3, codeInput4, codeInput5, codeInput6];

  const formatPhoneNumber = (input) => {
    const cleaned = ('' + input).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{1})(\d{4})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]} ${match[3]}-${match[4]}`;
    }
    return input;
  };

  const handleSendCode = async () => {
    try {
      const response = await axios.post('http://192.168.221.112:3000/auth/sendVerificationCode', { phoneNumber: '+55' + phoneNumber.replace(/\D/g, '') });
      console.log(response.data);
      setWaitingForCode(true);
      startResendCodeTimer();
    } catch (error) {
      console.log(error);
    }
  };

  const handleResendCode = async () => {
    setResendCodeDisabled(true);
    setResendCodeTimer(60);
    console.log('Código reenviado!');
    await handleSendCode();
    startResendCodeTimer();
  };

  const startResendCodeTimer = () => {
    const timer = setInterval(() => {
      setResendCodeTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(timer);
          setResendCodeDisabled(false);
          return 0;
        } else {
          if (prevTimer <= 10) {
            setTimerColor('red');
          }
          return prevTimer - 1;
        }
      });
    }, 1000);
  };

  const handleVerifyCode = async () => {
    try {
      const fullCode = codes.join('');
      const response = await axios.post('http://192.168.221.112:3000/auth/verifyPhoneNumber', { phoneNumber: '+55' + phoneNumber.replace(/\D/g, ''), code: fullCode });
      console.log(response.data);
      if (response.data.isVerified) {
        navigation.navigate('NomeScreen');
      } else {
        setInvalidCode(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCodeInputChange = (index, text) => {
    const newCodes = [...codes];
    newCodes[index] = text;

    if (text.length === 1) {
      if (index < 5) {
        codeRefs[index + 1].current.focus();
      }
    } else if (text.length === 0) {
      if (index > 0) {
        codeRefs[index - 1].current.focus();
      }
    }

    setCodes(newCodes);
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/logo.png')}
          style={{ width: 58, height: 58, marginTop: 30 }}
        />
      </View>
      <View style={styles.contentContainer}>
        {!waitingForCode ? (
          <>
            <Text style={styles.label}>Digite seu número de celular</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View style={styles.flagContainer}>
                <Image source={require('../../../../assets/bandeira.png')} style={{ width: 24, height: 24 }} />
                <Text style={styles.prefix}>+55</Text>
              </View>
              <TextInput
                style={[styles.input, { flexGrow: 1 }]}
                keyboardType="phone-pad"
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                value={phoneNumber}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#9FC248' }]}
              onPress={handleSendCode}
            >
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 20,
              }}
            >
              <View style={styles.separatorLine} />
              <Text style={styles.orText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

                 

            <GoogleSign
            onLoginSuccess={(userInfo) => console.log('Login bem-sucedido', userInfo)}
            onLoginError={(errorMessage) => console.log('Erro no login', errorMessage)}
            navigation={navigation}
          />     



            <View style={styles.termsAndPolicy}>
              <Text style={styles.regularText}>Ao continuar, você concorda com nossa </Text>
              <Text
                style={[styles.link, { color: 'black' }]}
                onPress={() => Linking.openURL('https://www.google.com.br')}>
                Política de Privacidade
              </Text>
              <Text style={styles.regularText}> e os </Text>
              <Text
                style={[styles.link, { color: 'black' }]}
                onPress={() => Linking.openURL('https://www.vivo.com.br')}>
                Termos de Uso
              </Text>
              <Text>.</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>
              Digite o código de quatro dígitos enviado ao número de celular:{' '}
              {phoneNumber}
            </Text>
            <View style={styles.codeInputContainer}>
              {codeRefs.map((_, index) => (
                <TextInput
                  key={index}
                  ref={codeRefs[index]}
                  style={styles.codeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleCodeInputChange(index, text)}
                  value={codes[index]}
                />
              ))}
            </View>
            {invalidCode && (
              <Text style={styles.invalidCodeText}>Código inválido</Text>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#487CC2' }]}
              onPress={handleVerifyCode}
            >
              <Text style={styles.buttonText}>Verificar</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 0 }}>
              <TouchableOpacity
                style={styles.resendCodeButton}
                disabled={resendCodeDisabled}
                onPress={handleResendCode}
              >
                <Text style={[
                  styles.resendCodeButtonText,
                  resendCodeDisabled ? styles.greyText : styles.blackText
                ]}>
                  Não recebi o código
                </Text>

              </TouchableOpacity>

              {resendCodeDisabled && (
                <Text style={[styles.resendCodeTimerText, { color: timerColor }]}>{` (${resendCodeTimer})`}</Text>
              )}
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FFE5',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '15%',
  },
  textBlack: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonSocial: {
    backgroundColor: '#e6e6e6',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 10,
    paddingLeft: 15,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  prefix: {
    fontSize: 16,
    marginLeft: 4,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  codeInput: {
    width: '15%', // Reduz a largura de cada campo
    textAlign: 'center',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 5
  },
  invalidCodeText: {
    fontSize: 14,
    color: '#FF0000',
    marginBottom: 10,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    fontSize: 14,
    marginHorizontal: 10,

  },
  termsAndPolicy: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  regularText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  resendCodeButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginTop: 30,
  },
  resendCodeButtonText: {
    color: '181A15',
  },
  greyText: {
    color: 'grey',
  },
  blackText: {
    color: 'red',
  },
  resendCodeTimerText: {
    marginLeft: 5,
    fontSize: 16,
    marginTop: 30,
  },
  normalWeight: {
    fontWeight: 'normal',
  },
  boldWeight: {
    fontWeight: 'bold',
  },

});

export default SignupScreen;


