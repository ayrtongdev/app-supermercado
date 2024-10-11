//ProfileScreen.ja
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import CilindricalMenu from '../../menu/CilindricalMenu';
import CartInfo from '../../cartinfo/CartInfo';
import useCartStore from '../../../zustand/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataCard from './DataCard';
import useKeyboard from '../../hooks/useKeyboard';
import RootToast from 'react-native-root-toast';

const ProfileScreen = () => {
  const isKeyboardVisible = useKeyboard();
  const [user, setUser] = useState(null);
  const fetchCartInfo = useCartStore(state => state.fetchCartInfo);
  const navigation = useNavigation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "542496326043-m8daitk47j1qncovhco325ajp28edicg.apps.googleusercontent.com",
      androidClientId: "542496326043-lt1feq58jfs3rbn36otheq87ftv4uoeb.apps.googleusercontent.com",
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCartInfo();
      fetchUserData();
    }, [])
  );

  const navigateToChatbot = () => {
    navigation.navigate('Chatbot');
  };

  const logout = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('userToken');
      navigation.navigate('Signup');
    } catch (error) {
      console.error('Erro ao fazer logout: ', error);
    }
  };

  const fetchUserData = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    try {
      const response = await axios.get('http://192.168.18.56:3000/users/user', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const onSave = async (updatedUserData) => {
    const userToken = await AsyncStorage.getItem('userToken');

    const dataToSend = {};
    let fieldsUpdated = false; // Flag para verificar se houve alguma alteração

    // Verificar se o nome foi alterado
    if (updatedUserData.givenName !== user.givenName) {
        dataToSend.givenName = updatedUserData.givenName;
        RootToast.show('Nome alterado com sucesso!', { // Exibir pop-up específico para o nome
            duration: 1500,
            position: 50,
            backgroundColor: '#4CAF50', // Verde
            textColor: '#ffffff',
            shadow: true,
        });
        fieldsUpdated = true; // Marca que houve uma alteração
    }

    // Verificar se o sobrenome foi alterado
    if (updatedUserData.familyName !== user.familyName) {
        dataToSend.familyName = updatedUserData.familyName;
        RootToast.show('Sobrenome alterado com sucesso!', { // Exibir pop-up específico para o sobrenome
            duration: 1500,
            position: 50,
            backgroundColor: '#4CAF50', // Verde
            textColor: '#ffffff',
            shadow: true,
        });
        fieldsUpdated = true; 
    }

    // Verificar se o CPF foi alterado
    if (updatedUserData.cpf !== user.cpf) {
        dataToSend.cpf = updatedUserData.cpf;
        RootToast.show('CPF alterado com sucesso!', { // Exibir pop-up específico para o CPF
            duration: 1500,
            position: 50,
            backgroundColor: '#4CAF50', // Verde
            textColor: '#ffffff',
            shadow: true,
        });
        fieldsUpdated = true; 
    }

    // Verificar se o número de telefone foi alterado
    if (updatedUserData.number !== user.number) {
        dataToSend.number = updatedUserData.number;
        RootToast.show('Telefone alterado com sucesso!', { // Exibir pop-up específico para o telefone
            duration: 1500,
            position: 50,
            backgroundColor: '#4CAF50', // Verde
            textColor: '#ffffff',
            shadow: true,
        });
        fieldsUpdated = true; 
    }

    // Se nenhum campo foi alterado, não fazer a requisição
    if (!fieldsUpdated) {
        return;
    }

    try {
        const response = await axios.put('http://192.168.18.56:3000/users/update', dataToSend, {
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });

        setUser(response.data.user); // Atualizar os dados do usuário no estado

    } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
    }
};




  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {user && (
          <View style={styles.profileContainer}>
            <Image source={{ uri: user.photoUrl }} style={styles.profileImage} />
            <Text style={styles.userName}>{user.givenName} {user.familyName}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        )}

        <DataCard user={user} onSave={onSave} />

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
        <View><Text> </Text></View>
        <View><Text> </Text></View>
        <View><Text> </Text></View>

      </ScrollView>


      <TouchableOpacity style={styles.faleButton} onPress={navigateToChatbot}>
        <View style={styles.buttonContent}>
          <Icon name="headset-outline" size={24} color="#ffffff" />
        </View>
      </TouchableOpacity>


      {!isKeyboardVisible && <CilindricalMenu navigation={navigation} />}
      {!isKeyboardVisible && <CartInfo />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  scrollContainer: {
    paddingVertical: 120,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'gray',
  },
  logoutButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 30,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'red',
  },
  faleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#0BB3D9',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileScreen;
