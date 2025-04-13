// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useThemeStore from '../../zustand/themeStore';

const SplashScreen = ({ navigation }) => {
  const darkMode = useThemeStore((state) => state.darkMode);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  useEffect(() => {
    
    loadTheme();
  }, []);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          navigation.navigate('Home');
        } else {
          navigation.navigate('Welcome');
        }
      } catch (error) {
        console.error('Erro ao verificar token', error);
        navigation.navigate('Welcome');
      }
    };

    setTimeout(checkUserLoggedIn, 3000);
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: darkMode ? '#000' : '#F2F2F2',
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: 150, height: 150 }}
        />
      </View>
    </View>
  );
};

export default SplashScreen;
