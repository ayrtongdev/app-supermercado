import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Image, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartInfo from '../../cartinfo/CartInfo';
import useCartStore from '../../../zustand/store';
import useKeyboard from '../../hooks/useKeyboard';

const formatProductName = (name, wordLimit, breakAtWord) => {
    const words = name.split(' ');
    if (words.length > wordLimit) {
        words.splice(wordLimit);
    }


    if (words.length > breakAtWord) {
        words[breakAtWord - 1] = words[breakAtWord - 1] + '\n';
    }

    return words.join(' ');
};

const SearchScreen = () => {
    const isKeyboardVisible = useKeyboard();
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [lastClickedProducts, setLastClickedProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(true);
    const inputRef = useRef(null);
    const fetchCartInfo = useCartStore(state => state.fetchCartInfo);

    useFocusEffect(
        React.useCallback(() => {
            fetchCartInfo();
        }, [])
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, []);

    // Função para carregar os últimos produtos clicados
    useEffect(() => {
        const loadLastClickedProducts = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');

                const response = await fetch('http://192.168.18.56:3000/users/recent-searches', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Erro na resposta do servidor');
                }
                const data = await response.json();
                setLastClickedProducts(data);
            } catch (error) {
                console.error('Erro ao carregar últimas pesquisas:', error);
            }
        };

        loadLastClickedProducts();
    }, []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchText.length > 0) {
                try {
                    const userToken = await AsyncStorage.getItem('userToken');
                    const response = await fetch(`http://192.168.18.56:3000/users/search?query=${searchText}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userToken}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Erro na resposta do servidor');
                    }

                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        throw new Error('Resposta inválida');
                    }

                    const data = await response.json();
                    setSearchResults(data);
                } catch (error) {
                    console.error('Erro ao buscar resultados:', error);
                }
            } else {
                setSearchResults([]);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchSearchResults();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    const handleProductClick = async (item) => {
        navigation.navigate('DetailProduct', { product: item });

        // Adicionar o item às últimas pesquisas
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await fetch(`http://192.168.18.56:3000/users/recent-searches/${item._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao adicionar produto às últimas pesquisas');
            }
            const updatedProducts = [item, ...lastClickedProducts.filter(p => p._id !== item._id)].slice(0, 10);
            setLastClickedProducts(updatedProducts);
        } catch (error) {
            console.error('Erro ao adicionar produto às últimas pesquisas:', error);
        }
    };

    const handleCancelPress = () => {
        setIsEditing(false);
        setSearchText('');
        setSearchResults([]);
        Keyboard.dismiss();
        navigation.goBack();
    };

    const handleRemoveItem = async (item) => {
        const updatedProducts = lastClickedProducts.filter(p => p._id !== item._id);
        setLastClickedProducts(updatedProducts);

        try {
            const userToken = await AsyncStorage.getItem('userToken');

            await fetch(`http://192.168.18.56:3000/users/recent-searches/${item._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            });
        } catch (error) {
            console.error('Erro ao remover produto das últimas pesquisas:', error);
        }
    };


    const renderProductItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleProductClick(item)} style={styles.productContainer}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            </View>
            <View>
                <Text style={styles.productName}>{formatProductName(item.name, 5, 3)}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>

            </View>
        </TouchableOpacity>
    );

    const renderLastClickedItem = ({ item }) => (
        <View style={styles.lastClickedContainer}>
            <TouchableOpacity onPress={() => handleProductClick(item)} style={styles.lastClickedContent}>
                <View style={styles.imageWrapperLastClicked}>
                    <Image source={{ uri: item.imageUrl }} style={styles.lastClickedImage} />
                </View>
                <Text style={styles.lastClickedText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveItem(item)} style={styles.removeButton}>
                <Icon name="close" size={24} color="#DB4437" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.searchContainer, isEditing && styles.editedContainer]}>
                <Icon name="search" size={24} color="#000" style={styles.iconStyle} />
                <TextInput
                    ref={inputRef}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Busque por ovos, frutas e mais..."
                    style={styles.input}
                    onFocus={() => setIsEditing(true)}
                />
                {isEditing && (
                    <TouchableOpacity onPress={handleCancelPress} style={styles.cancelButton}>
                        <Text style={{ color: '#0BB3D9' }}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>

            {lastClickedProducts.length > 0 && (
                <View style={styles.carouselContainer}>
                    <Text style={styles.carouselTitle}>Últimas pesquisas</Text>
                    <FlatList
                        data={lastClickedProducts}
                        renderItem={renderLastClickedItem}
                        keyExtractor={(item) => item._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselList}
                    />
                </View>
            )}

            <FlatList
                data={searchResults}
                renderItem={renderProductItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 70 }}
            />
            {!isKeyboardVisible && <CartInfo customStyle={{ bottom: 5 }} />}
        </View>

    );
};

const styles = StyleSheet.create({
    lastClickedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginHorizontal: 10,
    },
    imageWrapperLastClicked: {
        backgroundColor: '#F2F2F2',
        borderRadius: 50,
        padding: 2,
        marginRight: 10,
        height: 40,
        width: 40,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    description: {
        fontSize: 13,
        color: '#666',
        marginTop: 5,
    },
    lastClickedImage: {
        height: 36,
        width: 36,
    },
    lastClickedText: {
        fontSize: 14,
        fontWeight: '500',
    },
    searchContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 45,
        margin: 10,
        marginTop: 50,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    editedContainer: {
        marginTop: 60,
    },
    input: {
        flex: 1,
        paddingLeft: 10,
    },
    iconStyle: {
        paddingRight: 5,
    },
    cancelButton: {
        marginLeft: 5,
        backgroundColor: '#FFFFFF',
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginHorizontal: 10,
    },
    imageWrapper: {
        backgroundColor: '#F2F2F2',
        borderRadius: 8,
        padding: 5,
        marginRight: 10,
        height: 80,
        width: 80,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    productImage: {
        height: '100%',
        width: '100%',
        borderRadius: 8,
    },
    productPrice: {
        color: '#333333',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 13,
    },
    productName: {
        color: '#333333',
        fontSize: 13,
        fontWeight: 'bold',
    },
    carouselContainer: {
        marginTop: 10,
        paddingHorizontal: 10,
        marginBottom: 20
    },
    carouselTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    lastClickedContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeButton: {
        marginLeft: 10,
        marginRight: 5,
    },
    carouselList: {
        paddingLeft: 10,
    },
});

export default SearchScreen;
