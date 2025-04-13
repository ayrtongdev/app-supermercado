import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Image, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CartInfo from '../../cartinfo/CartInfo';
import useCartStore from '../../../zustand/store';
import useKeyboard from '../../hooks/useKeyboard';
import LottieView from 'lottie-react-native';
import useThemeStore from '../../../zustand/themeStore';
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
    const { darkMode } = useThemeStore();
    const isKeyboardVisible = useKeyboard();
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [lastClickedProducts, setLastClickedProducts] = useState([]);
    const [isEditing, setIsEditing] = useState(true);
    const [showNoResultsAnimation, setShowNoResultsAnimation] = useState(false);
    const inputRef = useRef(null);
    const fetchCartInfo = useCartStore(state => state.fetchCartInfo);

    const dynamicStyles = {
        cancelButtonText: {
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        searchContainer: {
            ...styles.searchContainer,
            backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
        },
        carouselTitle: {
            ...styles.carouselTitle,
            color: darkMode ? '#E0E0E0' : '#121212',
        },
        lastClickedContainer: {
            ...styles.lastClickedContainer,
            backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
        },
        imageWrapperLastClicked: {
            ...styles.imageWrapperLastClicked,
            backgroundColor: darkMode ? '#1E1E1E' : '#F2F2F2',
        },
        lastClickedText: {
            ...styles.lastClickedText,
            color: darkMode ? '#E0E0E0' : '#121212',
        },
        iconColor: darkMode ? '#E0E0E0' : '#000000',

        productContainer: {
            ...styles.productContainer,
            backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
        },
        imageWrapper: {
            ...styles.imageWrapper,
            backgroundColor: darkMode ? '#1E1E1E' : '#F2F2F2',
        },
        productName: {
            ...styles.productName,
            color: darkMode ? '#E0E0E0' : '#000000',
        },
        description: {
            ...styles.description,
            color: darkMode ? '#A3A3A3' : '#666666',
        },
        noResultsText: {
            ...styles.noResultsText,
            color: darkMode ? '#A3A3A3' : '#666666',
        },
        productPrice: {
            ...styles.productPrice,
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        input: {
            ...styles.input,
            color: darkMode ? '#FFFFFF' : '#000000', // Texto branco no Modo Escuro
        },
    };

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


    useEffect(() => {
        const loadLastClickedProducts = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');

                const response = await fetch('http://192.168.18.48:3000/users/recent-searches', {
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
                    const response = await fetch(`http://192.168.18.48:3000/users/search?query=${searchText}`, {
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
                    setShowNoResultsAnimation(data.length === 0);
                } catch (error) {
                    console.error('Erro ao buscar resultados:', error);
                }
            } else {
                setSearchResults([]);
                setShowNoResultsAnimation(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchSearchResults();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    useEffect(() => {
        if (searchText.length > 0 && searchResults.length === 0) {
            const timer = setTimeout(() => {
                setShowNoResultsAnimation(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [searchText, searchResults]);

    const handleProductClick = async (item) => {
        navigation.navigate('DetailProduct', { product: item });

        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await fetch(`http://192.168.18.48:3000/users/recent-searches/${item._id}`, {
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
        setShowNoResultsAnimation(false);
        Keyboard.dismiss();
        navigation.goBack();
    };

    const handleRemoveItem = async (item) => {
        const updatedProducts = lastClickedProducts.filter(p => p._id !== item._id);
        setLastClickedProducts(updatedProducts);

        try {
            const userToken = await AsyncStorage.getItem('userToken');

            await fetch(`http://192.168.18.48:3000/users/recent-searches/${item._id}`, {
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
        <TouchableOpacity onPress={() => handleProductClick(item)} style={dynamicStyles.productContainer}>
            <View style={dynamicStyles.imageWrapper}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            </View>
            <View>
                <Text style={dynamicStyles.productName}>{formatProductName(item.name, 5, 3)}</Text>
                <Text style={dynamicStyles.description}>{item.description}</Text>
                <Text style={dynamicStyles.productPrice}>R$ {item.price.toFixed(2)}</Text>

            </View>
        </TouchableOpacity>
    );

    const renderLastClickedItem = ({ item }) => (
        <View style={dynamicStyles.lastClickedContainer}>
            <TouchableOpacity onPress={() => handleProductClick(item)} style={styles.lastClickedContent}>
                <View style={dynamicStyles.imageWrapperLastClicked}>
                    <Image source={{ uri: item.imageUrl }} style={styles.lastClickedImage} />
                </View>
                <Text style={dynamicStyles.lastClickedText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveItem(item)} style={styles.removeButton}>
                <Icon name="close" size={24} color="#DB4437" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: darkMode ? '#212121' : '#FFFFFF', }}>
            <View style={[dynamicStyles.searchContainer, isEditing && styles.editedContainer]}>
                <Icon name="search" size={24} color={dynamicStyles.iconColor} style={styles.iconStyle} />
                <TextInput
                    ref={inputRef}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Busque por ovos, frutas e mais..."
                    placeholderTextColor={darkMode ? '#A3A3A3' : '#666666'}
                    style={dynamicStyles.input}
                    onFocus={() => setIsEditing(true)}
                />
                {isEditing && (
                    <TouchableOpacity onPress={handleCancelPress} style={styles.cancelButton}>
                        <Text style={dynamicStyles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>



            {lastClickedProducts.length > 0 && (
                <View style={styles.carouselContainer}>
                    <Text style={dynamicStyles.carouselTitle}>Últimas pesquisas</Text>
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

            {searchResults.length > 0 ? (
                <FlatList
                    data={searchResults}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 70 }}
                />
            ) : searchText.length > 0 && showNoResultsAnimation ? (
                <View style={[styles.animationContainer, { marginBottom: isKeyboardVisible ? 50 : 200 }]}>
                    <LottieView
                        source={require('../../../../assets/search-no-results.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                    <Text style={dynamicStyles.noResultsText}>Nenhum resultado <Text style={styles.boldText}>encontrado</Text></Text>
                </View>
            ) : (
                <View style={[styles.animationContainer, { marginBottom: isKeyboardVisible ? 50 : 200 }]}>
                    <LottieView
                        source={require('../../../../assets/search-animation2.json')}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                    <Text style={dynamicStyles.noResultsText}>Busque em <Text style={styles.boldText}>Toda</Text> a <Text style={styles.boldText}>Loja</Text></Text>
                </View>
            )}
            {!isKeyboardVisible && <CartInfo customStyle={{ bottom: 5 }} />}
        </View>

    );
};

const styles = StyleSheet.create({
    boldText: {
        fontWeight: 'bold',
    },
    noResultsText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    animationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: 180,
        height: 180,
    },
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
        color: '#0BB3D9',
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
        marginBottom: 20,
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
