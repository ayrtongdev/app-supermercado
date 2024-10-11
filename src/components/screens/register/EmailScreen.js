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


const EmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleNext = () => {
    if (validateEmail(email)) {
      setInvalidEmail(false);
      navigation.navigate('NomeScreen');
    } else {
      setInvalidEmail(true);
    }
  };

  const handleBack = () => {
    setShowModal(true);
  };

  const handleReset = () => {
    setShowModal(false);
    navigation.navigate('Signup');
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.contentContainer}>

        <Text style={[styles.label, { marginTop: 50 }]}>
          Qual é o seu endereço de e-mail?
        </Text>

        <TextInput
          style={[styles.input, invalidEmail ? styles.invalidInput : null]}
          keyboardType="email-address"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="nome@exemplo.com"
          placeholderTextColor="#ccc"
        />
        {invalidEmail && (
          <Text style={styles.invalidEmailText}>
            O e-mail informado não é válido.
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
              color="#401505"
            />
          </TouchableOpacity>

          <TouchableOpacity
          
            style={[styles.button, { backgroundColor: '#401505' }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Avançar</Text>

            <View style={[styles.iconContainer, { marginRight: -5 }]}>
              <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
            </View>

          </TouchableOpacity>
          
        </View>

      </View>

      <Modal
        visible={showModal}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Começar de novo?</Text>
            <View style={styles.modalLine} />
            <Text style={styles.modalText}>Quer mesmo começar de novo?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: '#401505' },
                ]}
                onPress={handleReset}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: '#FFFFFF' },
                  ]}
                >
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: '#ccc' },
                ]}
                onPress={closeModal}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: '#000' },
                  ]}
                >
                  Não
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9C5AD',
  },
  iconContainer: {
    marginLeft: 10,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginBottom: 10
  },
  invalidInput: {
    borderColor: '#FF0000',
  },
  invalidEmailText: {
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
    backgroundColor: '#D9C5AD',
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
  modalView: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    width: '48%',
    borderRadius: 5,
    paddingVertical: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EmailScreen;
