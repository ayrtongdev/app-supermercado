// DataCard.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import RootToast from 'react-native-root-toast';

const DataCard = ({ user, onSave }) => {
    const [expandedSection, setExpandedSection] = useState(null);
    const [editableValues, setEditableValues] = useState({});
    const [editingField, setEditingField] = useState(null);
    const inputRefs = useRef({});


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
        // Remove tudo que não é número
        cpf = cpf.replace(/\D/g, '');

        // Adiciona a formatação: XXX.XXX.XXX-XX
        if (cpf.length <= 11) {
            cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
            cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
            cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return cpf;
    };

    const validateCpf = (cpf) => {
        cpf = cpf.replace(/\D/g, '');  // Remove todos os não-números

        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;  // Checa se todos os números são iguais

        let soma = 0, resto;

        // Cálculo do primeiro dígito verificador
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;

        // Cálculo do segundo dígito verificador
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    };

    // Função para formatar o telefone
    const formatPhone = (phone) => {
        phone = phone.replace(/\D/g, '');  // Remove tudo que não é número

        // Formatar telefone fixo e celular
        if (phone.length <= 10) {
            phone = phone.replace(/^(\d{2})(\d)/g, '($1) $2');  // Formato DDD
            phone = phone.replace(/(\d{4})(\d{4})$/, '$1-$2');   // Formato Fixo
        } else if (phone.length === 11) {
            phone = phone.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');  // Formato Celular
        }
        return phone;
    };

    // Função para validar telefone
    const validatePhone = (phone) => {
        const numericPhone = phone.replace(/\D/g, '');  // Remove tudo que não é número
        // Telefone fixo tem 10 dígitos e celular tem 11 dígitos (com o nono dígito iniciando com '9')
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
                    RootToast.show('CPF inválido', {
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
        // Verificar se o campo "Nome" está em branco
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

        // Verificar se o campo "Sobrenome" está em branco
        if (!editableValues.familyName) {
            RootToast.show('Não é possível deixar o sobrenome em branco', {
                duration: 1500,
                position: 50,
                backgroundColor: '#FF4747',
                textColor: '#ffffff',
                shadow: true,
            });
            return;
        }


        // Verificar se o CPF é válido antes de salvar
        if (editableValues.cpf && !validateCpf(editableValues.cpf)) {
            RootToast.show('CPF inválido. Revise o seu CPF.', {
                duration: 1500,
                position: 50,
                backgroundColor: '#FF4747',
                textColor: '#ffffff',
                shadow: true,
            });
            return;
        }

        // Verificar se o telefone é válido antes de salvar
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

        // Se todos os campos forem válidos, salvar as mudanças
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
            <Text style={styles.label}>{label}:</Text>
            <View style={styles.editableField}>
                {editingField === field ? (
                    <TextInput
                        ref={(input) => (inputRefs.current[field] = input)}
                        style={styles.input}
                        value={editableValues[field] || ""}
                        onChangeText={(text) => handleInputChange(field, text)}
                        autoFocus={true}
                        keyboardType={field === 'cpf' || field === 'number' ? 'numeric' : 'default'}
                    />
                ) : (
                    <Text
                        style={styles.value}
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
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
    



    const renderSection = (title, iconSource, content) => (
        <View style={styles.container}>
            <View style={styles.card}>

                <View style={styles.iconLeftContainer}>
                    <Image source={iconSource} style={styles.iconLeft} />
                </View>

                <Text style={styles.title}>{title}</Text>

                <TouchableOpacity onPress={() => toggleExpand(title)}>
                    <Image
                        source={
                            expandedSection === title
                                ? require('../../../../assets/arrowup.png')
                                : require('../../../../assets/arrowdown.png')
                        }
                        style={styles.iconRight}
                    />
                </TouchableOpacity>
            </View>

            {expandedSection === title && (
                <View style={styles.expandedContent}>
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
                <>
                    {renderEditableField('Nome', 'givenName')}
                    {renderEditableField('Sobrenome', 'familyName')}
                    {renderEditableField('CPF', 'cpf', 'Cadastre aqui seu CPF')}
                </>
            )}

            {renderSection(
                'Informações de Contato',
                require('../../../../assets/phone-call.png'),
                <>
                    {renderEditableField('Telefone', 'number', 'Cadastre aqui seu telefone')}
                    <View style={styles.emailLabelContainer}>
                        <Text style={styles.label}>Email</Text>
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
                <>
                    <Text style={styles.label}>Pedido #1:</Text>
                    <Text style={styles.value}>Compra de supermercado em 01/10/2024</Text>
                    <Text style={styles.label}>Pedido #2:</Text>
                    <Text style={styles.value}>Compra de supermercado em 15/09/2024</Text>
                </>
            )}

            {renderSection(
                'Endereços',
                require('../../../../assets/home-local-alt.png'),
                <>
                    <Text style={styles.label}>Endereço Principal:</Text>
                    <Text style={styles.value}>Rua Exemplo, 123</Text>
                    <Text style={styles.label}>Endereço Secundário:</Text>
                    <Text style={styles.value}>Av. Teste, 456</Text>
                </>
            )}

            {renderSection(
                'Configurações',
                require('../../../../assets/setting.png'),
                <>
                    <Text style={styles.label}>Notificações:</Text>
                    <Text style={styles.value}>Ativadas</Text>
                    <Text style={styles.label}>Modo Escuro:</Text>
                    <Text style={styles.value}>Desativado</Text>
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
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
        marginTop: 15,
        backgroundColor: '#F2F2F2',
        borderRadius: 20,
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
        color: '#0BB3D9',
        fontSize: 14,
        marginLeft: 15,
        textDecorationLine: 'underline'
    },
    emailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Alinha o texto e o ícone lado a lado
        marginTop: 15,
    },
    emailWarningContainer: {
        flexDirection: 'row', // Alinha o ícone e o texto na horizontal
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
        color: '#FF4747',
        
    },
});

export default DataCard;
