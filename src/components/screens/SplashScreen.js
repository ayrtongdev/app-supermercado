import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Se o token existir, navegue para a Home
          navigation.navigate('Home');
        } else {
          // Caso contrário, vá para a tela de Bem-vindo
          navigation.navigate('Welcome');
        }
      } catch (error) {
        console.error('Erro ao verificar token', error);
        navigation.navigate('Welcome'); // Em caso de erro, continue o fluxo normal
      }
    };

    setTimeout(checkUserLoggedIn, 3000); // Aguarda a animação de splash antes de verificar
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F2' }}>
      <View style={{ alignItems: 'center' }}>
        <Image source={require('../../../assets/logo.png')} style={{ width: 150, height: 150 }} />
      </View>
    </View>
  );
};

export default SplashScreen;
