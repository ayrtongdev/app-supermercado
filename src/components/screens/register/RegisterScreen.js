import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = ({ navigation }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [invalidEmail, setInvalidEmail] = useState(false);

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const handleNext = async () => {

        if (validateEmail(email)) {
            setInvalidEmail(false);
            navigation.navigate('Login');
        } else {
            setInvalidEmail(true);
        }

        if (!password || !confirmPassword) {
            setErrorMessage('Por favor crie uma senha');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('As senhas não coincidem');
            return;
        }
        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
            setErrorMessage('A senha deve ter no mínimo 8 caracteres, incluindo números, uma letra e um caractere especial');
            return;
        }
        setErrorMessage('');
        // Adicione a lógica de navegação ou próximo passo aqui
        const userData = {
            fullName,
            email,
            password,
        };

        try {
            // Envie os dados para o backend
            const response = await fetch('http://192.168.18.48:3000/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });



            if (response.ok) {
                navigation.navigate('Login');
            } else {
               
                const errorResponseText = await response.text();
                console.error('Conteúdo da resposta de erro:', errorResponseText);

                const errorData = await response.json();
                setErrorMessage(errorData.error);
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            setErrorMessage('Erro de conexão com o servidor');
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.label}>Cadastro</Text>
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nome completo"
                />

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

                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Senha"
                    secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
                    <MaterialIcons name={passwordVisible ? 'visibility' : 'visibility-off'} size={24} />
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirme a Senha"
                    secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
                    <MaterialIcons name={passwordVisible ? 'visibility' : 'visibility-off'} size={24} />
                </TouchableOpacity>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.buttonText}>Avançar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        width: '80%',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: -160,
        left: -12,
        right: -12,
    },

    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center', 
        marginTop: -10, 
    },

    backButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#D9C5AD',
        justifyContent: 'center',
        alignItems: 'center',
    },

    nextButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',

    },

    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },

    icon: {
        position: 'absolute',
        right: 10,
        bottom: 83
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    invalidInput: {
        borderColor: '#FF0000',
    },
    invalidEmailText: {
        fontSize: 14,
        color: '#FF0000',
        marginBottom: 10,
    },
});

export default RegisterScreen;
