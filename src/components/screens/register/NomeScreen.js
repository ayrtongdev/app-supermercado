import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const NomeScreen = ({ navigation }) => {
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [segundoNome, setSegundoNome] = useState('');
  const [invalidPrimeiroNome, setInvalidPrimeiroNome] = useState(false);
  const [invalidSegundoNome, setInvalidSegundoNome] = useState(false);

  const validateNome = (nome) => {
    if (nome.trim() === '') {
      return false;
    }
    const re = /^[A-Za-z\s]+$/;
    return re.test(nome);
  };

  const handleNext = () => {
    const isValidPrimeiroNome = validateNome(primeiroNome);
    const isValidSegundoNome = validateNome(segundoNome);

    setInvalidPrimeiroNome(!isValidPrimeiroNome);
    setInvalidSegundoNome(!isValidSegundoNome);

    if (isValidPrimeiroNome && isValidSegundoNome) {
      navigation.navigate('Home');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={[styles.label, { marginTop: 50 }]}>
          Qual é o seu nome?
        </Text>
        <Text style={styles.subLabel}>
          Informe como você quer ser chamado
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              invalidPrimeiroNome ? styles.invalidInput : null,
            ]}
            onChangeText={(text) => setPrimeiroNome(text)}
            value={primeiroNome}
            placeholder="Informe seu primeiro nome"
            placeholderTextColor="#777"
          />
        </View>
        {invalidPrimeiroNome && (
          <Text style={styles.invalidText}>
            Não é permitido número ou caracteres especiais.
          </Text>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              invalidSegundoNome ? styles.invalidInput : null,
            ]}
            onChangeText={(text) => setSegundoNome(text)}
            value={segundoNome}
            placeholder="Informe seu segundo nome"
            placeholderTextColor="#777"
          />
        </View>
        {invalidSegundoNome && (
          <Text style={styles.invalidText}>
            Não é permitido número ou caracteres especiais.
          </Text>
        )}

<View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color="#0BB3D9"
            />
          </TouchableOpacity>
          <TouchableOpacity
  style={[styles.button, { backgroundColor: '#0BB3D9' }]}
  onPress={handleNext}
>
  <Text style={styles.buttonText}>Avançar</Text>
  <View style={[styles.iconContainer, { marginRight: -5 }]}>
    <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
  </View>
</TouchableOpacity>

        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#D9C5AD',
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
    subLabel: {
      fontSize: 16,
      color: '#555',
      marginBottom: 16,
    },
    inputContainer: {
      backgroundColor: '#F0F0F0',
      borderRadius: 5,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingHorizontal: 10,
      marginBottom: 12,
    },
    input: {
      fontSize: 16,
      padding: 5,
    },
    invalidInput: {
      borderColor: '#FF0000',
    },
    invalidText: {
      fontSize: 14,
      color: '#FF0000',
      marginBottom: 10,
    },
    buttonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f2f2f2',
      borderRadius: 25,
      width: 50,
      height: 50,
      padding: 10,
    },
    button: {
      borderRadius: 25,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#FFFFFF',
    },
    iconContainer: {
      marginLeft: 10,
    },
  });
  
  
  export default NomeScreen;
  

