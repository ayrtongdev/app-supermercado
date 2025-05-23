import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFavoriteStore from '../../../zustand/favoritesStore';
import RootToast from 'react-native-root-toast';
import useThemeStore from '../../../zustand/themeStore';

const truncateName = (name) => {
    const words = name.split(' ');
    if (words.length > 4) {
        return words.slice(0, 4).join(' ');
    }
    return name;
};

const ProductCard = ({ product, navigation }) => {
    const favorites = useFavoriteStore(state => state.favorites);
    const fetchFavorites = useFavoriteStore(state => state.fetchFavorites);
    const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
    const { darkMode } = useThemeStore();

    useFocusEffect(
        React.useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const handleFavoritePress = async (productId) => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const apiUrl = `http://192.168.18.48:3000/users/favorites/${productId}`;
            const method = favorites[productId] ? 'DELETE' : 'PUT';

            const response = await fetch(apiUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ productId }),
            });

            if (!response.ok) {
                RootToast.show('Tivemos um problema por aqui', {
                    duration: 1650,
                    position: 80,
                    backgroundColor: '#FF4747',
                    textColor: '#ffffff',
                    shadow: true,
                });
                return;
            }

            // Alterna o estado de favorito após a sincronização bem-sucedida
            toggleFavorite(productId);
        } catch (error) {
            RootToast.show('Tivemos um problema por aqui', {
                duration: 1650,
                position: 80,
                backgroundColor: '#FF4747',
                textColor: '#ffffff',
                shadow: true,
            });
        }
    };

    const dynamicStyles = {
        card: {
            ...styles.card,
            backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
        },
        name: {
            ...styles.name,
            color: darkMode ? '#E0E0E0' : '#000000',
        },
        description: {
            ...styles.description,
            color: darkMode ? '#a3a3a3' : 'gray',
        },
        price: {
            ...styles.price,
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        customButton1: {
            ...styles.customButton1,
            backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
        },
        
    };
    
    return (
        <View style={dynamicStyles.card}>
            <TouchableOpacity
                style={styles.iconButton1}
                onPress={() => handleFavoritePress(product._id)}
            >
               <Image
                    source={
                        favorites[product._id]
                            ? darkMode
                                ? require('../../../../assets/love-dm1.png') 
                                : require('../../../../assets/love.png')
                            : darkMode
                                ? require('../../../../assets/love-dmi.png') 
                                : require('../../../../assets/love1.png') 
                    }
                    style={styles.icon}
                />
            </TouchableOpacity>
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
            <Text style={dynamicStyles.name}>{truncateName(product.name)}</Text>
            <Text style={dynamicStyles.description} >{product.description}</Text>
            <Text style={dynamicStyles.price}>R${product.price}</Text>
            <TouchableOpacity style={dynamicStyles.customButton1}
                onPress={() => navigation.navigate('DetailProduct', { product: product, subdepartment: product.subdepartment })}
            >
                <Image source={require('../../../../assets/add.png')} style={styles.buttonIcon1} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 200,
        margin: 10,
        padding: 10,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    customButton1: {
        backgroundColor: '#0BB3D9',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 0,
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        bottom: 0,
    },

    buttonIcon1: {
        width: 25,
        height: 25,
    },

    description: {
        color: 'gray',
        fontSize: 12,
        marginTop: -10,
        marginLeft: 10,
        height: 20,
    },

    iconButton1: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 10,
    },

    icon: {
        width: 31,
        height: 31,
    },

    image: {
        height: 95,
        resizeMode: 'contain',
        width: 95,
        marginLeft: 20,
        marginTop: 22,
    },
    name: {
        color: '#0D0D0D',
        fontSize: 12,
        marginLeft: 10,
        width: 120,
        height: 40,
    },
    price: {
        color: '#0BB3D9',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: -4,
        marginLeft: 10,
        height: 20,
    },
});

export default ProductCard;