// DataCard.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import RootToast from 'react-native-root-toast';
import Toggle from './ThemeToggle'
import useThemeStore from '../../../zustand/themeStore';

const DataCard = ({ user, onSave }) => {
    const { darkMode } = useThemeStore();
    const [expandedSection, setExpandedSection] = useState(null);
    const [editableValues, setEditableValues] = useState({});
    const [editingField, setEditingField] = useState(null);
    const inputRefs = useRef({});

    const dynamicStyles = {
        card: {
            ...styles.card,
            backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
        },
        label: {
            ...styles.label,
            color: darkMode ? '#E0E0E0' : '#000000',
        },
        value: {
            ...styles.value,
            color: darkMode ? '#E0E0E0' : '#000000',
        },
        title: {
            ...styles.title,
            color: darkMode ? '#FFFFFF' : '#000000',
        },
        expandedContent: {
            ...styles.expandedContent,
            backgroundColor: darkMode ? '#212121' : '#F2F2F2',
        },
        container: {
            ...styles.container,
            backgroundColor: darkMode ? '#212121' : '#F2F2F2',
        },
        editButtonText: {
            ...styles.editButtonText,
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        input: {
            ...styles.input,
            color: darkMode ? '#E0E0E0' : '#000000',
        },
    };


    useEffect(() => {
        if (user) {
            setEditableValues({ ...user });
        }
    }, [user])


    useEffect(() => {
        if (user) {
            setEditableValues({ ...user });
        } else {
            setEditableValues({
                givenName: "",
                familyName: "",
                cpf: "",
                email: ""
            });
        }
    }, [user]);

    const formatCpf = (cpf) => {

        cpf = cpf.replace(/\D/g, '');


        if (cpf.length <= 11) {
            cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
            cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
            cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return cpf;
    };

    const validateCpf = (cpf) => {
        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0, resto;


        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;


        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    };



    const formatPhone = (phone) => {
        phone = phone.replace(/\D/g, '');


        if (phone.length <= 10) {
            phone = phone.replace(/^(\d{2})(\d)/g, '($1) $2');
            phone = phone.replace(/(\d{4})(\d{4})$/, '$1-$2');
        } else if (phone.length === 11) {
            phone = phone.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
        }
        return phone;
    };


    const validatePhone = (phone) => {
        const numericPhone = phone.replace(/\D/g, '');

        return numericPhone.length === 10 || (numericPhone.length === 11 && numericPhone[2] === '9');
    };



    const toggleExpand = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleInputChange = (field, value) => {
        if (value === "") {
            setEditableValues(prevState => ({ ...prevState, [field]: value }));
            return;
        }

        if (field === 'givenName') {
            const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
            if (nameRegex.test(value) && value.length <= 15) {
                setEditableValues(prevState => ({ ...prevState, [field]: value }));
            }
        } else if (field === 'familyName') {
            const surnameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
            if (surnameRegex.test(value) && value.length <= 15) {
                setEditableValues(prevState => ({ ...prevState, [field]: value }));
            }
        } else if (field === 'cpf') {
            const numericCpf = value.replace(/\D/g, '');
            if (numericCpf.length <= 11) {
                const formattedCpf = formatCpf(numericCpf);
                setEditableValues(prevState => ({ ...prevState, [field]: formattedCpf }));

                if (numericCpf.length === 11 && !validateCpf(numericCpf)) {
                    RootToast.show('CPF inválido, Revise o seu CPF', {
                        duration: 1500,
                        position: 50,
                        backgroundColor: '#FF4747',
                        textColor: '#ffffff',
                        shadow: true,
                    });
                }
            }
        } else if (field === 'number') {
            const numericPhone = value.replace(/\D/g, '');
            if (numericPhone.length <= 11) {
                const formattedPhone = formatPhone(numericPhone);
                setEditableValues(prevState => ({ ...prevState, [field]: formattedPhone }));
            }
        }
    };




    const saveChanges = () => {

        if (!editableValues.givenName) {
            RootToast.show('Não é possível deixar o nome em branco', {
                duration: 1500,
                position: 50,
                backgroundColor: '#FF4747',
                textColor: '#ffffff',
                shadow: true,
            });
            return;
        }


        const numericPhone = editableValues.number.replace(/\D/g, '');
        if (numericPhone.length > 0 && !validatePhone(numericPhone)) {
            RootToast.show('Número de telefone inválido. Não foi possível salvar', {
                duration: 1500,
                position: 50,
                backgroundColor: '#FF4747',
                textColor: '#ffffff',
                shadow: true,
            });
            return;
        }


        onSave(editableValues);

        setEditingField(null);
    };


    const cancelEditing = () => {
        setEditableValues({ ...user });
        setEditingField(null);
    };

    const startEditing = (field) => {
        setEditingField(field);
        setTimeout(() => {
            inputRefs.current[field]?.focus();
        }, 100);
    };


    const renderEditableField = (label, field, placeholder) => (
        <View style={styles.editableFieldContainer}>
            <Text style={dynamicStyles.label}>{label}:</Text>
            <View style={styles.editableField}>
                {editingField === field ? (
                    <TextInput
                        ref={(input) => (inputRefs.current[field] = input)}
                        style={[dynamicStyles.input, dynamicStyles.text]}
                        value={editableValues[field] || ""}
                        onChangeText={(text) => handleInputChange(field, text)}
                        autoFocus={true}
                        keyboardType={field === 'cpf' || field === 'number' ? 'numeric' : 'default'}
                    />
                ) : (
                    <Text
                        style={[
                            dynamicStyles.value,
                            !editableValues[field] && styles.placeholderText
                        ]}
                        onPress={() => startEditing(field)}
                    >
                        {editableValues[field] ? editableValues[field] : placeholder}
                    </Text>
                )}

                <View style={styles.iconButtonContainer}>
                    {editingField === field ? (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={cancelEditing}>
                                <Image
                                    source={require('../../../../assets/cross-circle.png')}
                                    style={styles.iconButton}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveChanges}>
                                <Image
                                    source={require('../../../../assets/check-circle.png')}
                                    style={styles.iconButton}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => startEditing(field)}>
                            <Text style={dynamicStyles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );




    const renderSection = (title, iconSourceLight, iconSourceDark, content) => (
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.card}>
                <View style={styles.iconLeftContainer}>
                    <Image
                        source={darkMode ? iconSourceDark : iconSourceLight}
                        style={styles.iconLeft}
                    />
                </View>

                <Text style={dynamicStyles.title}>{title}</Text>

                <TouchableOpacity onPress={() => toggleExpand(title)}>
                    <Image
                        source={
                            expandedSection === title
                                ? darkMode
                                    ? require('../../../../assets/arrowup-dm.png')
                                    : require('../../../../assets/arrowup.png')
                                : darkMode
                                    ? require('../../../../assets/arrowdown-dm.png')
                                    : require('../../../../assets/arrowdown.png')
                        }
                        style={styles.iconRight}
                    />
                </TouchableOpacity>
            </View>

            {expandedSection === title && (
                <View style={dynamicStyles.expandedContent}>
                    {content}
                </View>
            )}
        </View>
    );


    return (
        <>
            {renderSection(
                'Dados Pessoais',
                require('../../../../assets/caneta-do-usuario.png'),
                require('../../../../assets/caneta-do-usuario1.png'),
                <>
                    {renderEditableField('Nome', 'givenName')}
                    {renderEditableField('Sobrenome', 'familyName', 'Cadastre seu sobrenome')}
                    {renderEditableField('CPF', 'cpf', 'cadastre seu CPF')}
                </>
            )}

            {renderSection(
                'Informações de Contato',
                require('../../../../assets/phone-call.png'),
                require('../../../../assets/phone-call1.png'),
                <>
                    {renderEditableField('Telefone', 'number', 'Cadastre seu telefone com DDD')}
                    <View style={styles.emailLabelContainer}>
                        <Text style={dynamicStyles.label}>Email</Text>
                        <View style={styles.emailWarningContainer}>
                            <Image
                                source={require('../../../../assets/alerta.png')}
                                style={styles.emailIcon}
                            />
                            <Text style={styles.emailWarning}>Não é possível alterar o e-mail</Text>
                        </View>
                    </View>
                    <Text style={styles.valueEmail}>{user?.email}</Text>
                </>
            )}

            {renderSection(
                'Histórico de Pedidos',
                require('../../../../assets/historico-de-pedidos.png'),
                require('../../../../assets/historico-de-pedidos1.png'),
                <>
                    <Text style={dynamicStyles.label}>Pedido #1:</Text>
                    <Text style={dynamicStyles.value}>Compra de supermercado em 01/10/2024</Text>
                    <Text style={dynamicStyles.label}>Pedido #2:</Text>
                    <Text style={dynamicStyles.value}>Compra de supermercado em 15/09/2024</Text>
                </>
            )}

            {renderSection(
                'Endereços',
                require('../../../../assets/home-local-alt.png'),
                require('../../../../assets/home-local-alt1.png'),
                <>
                    <Text style={dynamicStyles.label}>Endereço Principal:</Text>
                    <Text style={dynamicStyles.value}>Rua Exemplo, 123</Text>
                    <Text style={dynamicStyles.label}>Endereço Secundário:</Text>
                    <Text style={dynamicStyles.value}>Av. Teste, 456</Text>
                </>
            )}

            {renderSection(
                'Configurações',
                require('../../../../assets/setting.png'),
                require('../../../../assets/setting1.png'),
                <>
                    <Text style={dynamicStyles.label}>Notificações:</Text>
                    <Text style={dynamicStyles.value}>Ativadas</Text>

                    <Text style={dynamicStyles.label}>Modo Escuro</Text>
                    <Text style={dynamicStyles.value}>{darkMode ? 'Ativado' : 'Desativado'}</Text>

                    <Toggle
                        isActive={darkMode}
                        onToggle={() => setDarkMode(prev => !prev)}
                    />


                </>
            )}
        </>
    );
};

const styles = StyleSheet.create({



    container: {
        marginTop: 10,
        backgroundColor: '#F2F2F2',
    },
    card: {
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        alignSelf: 'center',
    },
    iconLeftContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    iconLeft: {
        width: 20,
        height: 20,
    },
    title: {
        fontSize: 15,
        flex: 1,
        textAlign: 'center',
    },
    iconRight: {
        width: 20,
        height: 20,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
    expandedContent: {
        marginTop: 1,
        backgroundColor: '#F2F2F2',
        borderRadius: 0,
        padding: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10
    },
    value: {
        fontSize: 14,
        marginTop: 10,

    },
    valueEmail: {
        fontSize: 14,
        marginTop: 10,
        color: '#ADAAAB'

    },
    editableFieldContainer: {
        marginBottom: 10,
    },
    editableField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fieldContainer: {
        flex: 1,
        marginRight: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    iconButton: {
        width: 25,
        height: 25,
        marginLeft: 20,
    },
    editButtonText: {
        fontSize: 14,
        marginLeft: 15,
        textDecorationLine: 'underline'
    },
    emailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    emailWarningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 45,
        marginTop: 10
    },
    emailIcon: {
        width: 14,
        height: 14,
        marginRight: 10, // Ajuste o espaçamento entre o ícone e o texto
    },
    emailWarning: {
        fontSize: 12,
        color: '#d9310b',
        textShadowColor: '#000',

    },
    placeholderText: {
        color: '#808080',
    },
});

export default DataCard;
