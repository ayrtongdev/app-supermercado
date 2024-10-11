import React, { useState, useEffect } from 'react';
import { GoogleSignin, statusCodes, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function GoogleSign({ onLoginSuccess, onLoginError, navigation }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: "542496326043-m8daitk47j1qncovhco325ajp28edicg.apps.googleusercontent.com",
            androidClientId: "542496326043-lt1feq58jfs3rbn36otheq87ftv4uoeb.apps.googleusercontent.com",
        });
    }, []);

    const storeTokenAsync = async (token) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            console.log('Token stored successfully with AsyncStorage!');
            const storedToken = await AsyncStorage.getItem('userToken');
            console.log('Token retrieved:', storedToken);
        } catch (error) {
            console.error('Error with AsyncStorage:', error);
        }
    };

    const signIn = async () => {
        try { 
            setLoading(true);
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // Enviar as informações do usuário para o backend
            const response = await axios.post('http://192.168.18.56:3000/users/google-login', {
                googleId: userInfo.user.id,
                email: userInfo.user.email,
                name: userInfo.user.name,
                givenName: userInfo.user.givenName,
                familyName: userInfo.user.familyName,
                photoUrl: userInfo.user.photo
            });

            setLoading(false);

            if (response.status === 200) {
                const token = response.data.token;
                console.log('Token received from backend:', token);

                if (token) {
                    await storeTokenAsync(token);  // Armazena o token usando AsyncStorage
                    onLoginSuccess && onLoginSuccess(response.data);
                    // Redireciona o usuário após o login bem-sucedido
                    navigation.navigate('Home');
                } else {
                    console.error('No token received in the response:', response.data);
                }
            }
        } catch (error) {
            setLoading(false);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                onLoginError && onLoginError('Login cancelado pelo usuário');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                onLoginError && onLoginError('Login já em andamento');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                onLoginError && onLoginError('Serviços do Google Play não disponíveis');
            } else {
                console.error('Erro desconhecido:', error);
                onLoginError && onLoginError('Erro desconhecido: ' + error.message);
            }
        }
    };

    return (
        <View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <GoogleSigninButton
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Dark}
                    onPress={signIn}
                />
            )}
        </View>
    );
}
