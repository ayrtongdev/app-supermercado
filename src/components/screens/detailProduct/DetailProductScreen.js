import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootToast from 'react-native-root-toast';
import CartItemCount from '../../cartinfo/CartItemCount';
import useCartStore from '../../../zustand/store';
import LottieView from 'lottie-react-native';
import useFavoriteStore from '../../../zustand/favoritesStore';
import { useFocusEffect } from '@react-navigation/native';
import useThemeStore from '../../../zustand/themeStore';




const fetchSimilarProducts = async (subdepartment) => {
    try {
        const url = `http://192.168.18.48:3000/products/?subdepartment=${subdepartment}`;
        const response = await fetch(url);
        const similarProducts = await response.json();
        return similarProducts;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const formatProductName = (name) => {
    const words = name.split(' ');
    if (words.length <= 4) {
        return name;
    }
    return words.slice(0, 4).join(' ') + '\n' + words.slice(4).join(' ');
};

const DetailsProductScreen = ({ route, navigation }) => {
    const { darkMode } = useThemeStore();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(product ? product.price : 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [excludedProductIds, setExcludedProductIds] = useState([]);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const setCartInfo = useCartStore(state => state.setCartInfo);
    const fetchCartInfo = useCartStore(state => state.fetchCartInfo);
    const favorites = useFavoriteStore(state => state.favorites);
    const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

    const dynamicStyles = {
        container: {
            ...styles.container,
            backgroundColor: darkMode ? '#212121' : '#F2F2F2',
        },
        title: {
            ...styles.title,
            color: darkMode ? '#E0E0E0' : '#0D0D0D',
        },
        descriptionText: {
            ...styles.descriptionText,
            color: darkMode ? '#E0E0E0' : '#333',
        },
        descriptionText1: {
            ...styles.descriptionText1,
            color: darkMode ? '#E0E0E0' : 'gray',
        },
        toggleText: {
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        similarProductsHeader: {
            ...styles.similarProductsHeader,
            color: darkMode ? '#E0E0E0' : '#0D0D0D',
        },
        name: {
            ...styles.name,
            color: darkMode ? '#E0E0E0' : '#000000',
        },
        description: {
            ...styles.description,
            color: darkMode ? '#a3a3a3' : 'gray',
        },
        price1: {
            ...styles.price1,
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        customButton1: {
            ...styles.customButton1,
            backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
        },
        favoriteButton: {
            ...styles.favoriteButton,
            backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
        },
        similarProductItem: {
            ...styles.similarProductItem,
            backgroundColor: darkMode ? '#2A2A2A' : '#fff',
        },
        bottomSection: {
            ...styles.bottomSection,
            backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
        },
        buttonText: {
            ...styles.buttonText,
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        totalValue: {
            ...styles.totalValue,
            color: darkMode ? '#E0E0E0' : '#ffffff',
        },
        price: {
            ...styles.price,
            color: darkMode ? '#E0E0E0' : '#ffffff',
        },
        button: {
            ...styles.button,
            backgroundColor: darkMode ? '#E0E0E0' : '#ffffff',
        },
        quantityContainer: {
            ...styles.quantityContainer,
            backgroundColor: darkMode ? '#2A2A2A' : '#ffffff',
        },
        quantityText: {
            ...styles.quantityText,
            color: darkMode ? '#E0E0E0' : '#0D0D0D',
        },
        subtractButton: {
            ...styles.subtractButton,
            backgroundColor: darkMode ? '#E0AC00' : '#FFC300',
        },
        addButton: {
            ...styles.addButton,
            backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
        },

    };


    const handleAddToCart = async (productId, quantity) => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const fetchPromise = fetch(`http://192.168.18.48:3000/users/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({ productId, quantity }),
            });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, 3000);
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error data:', errorData);
                throw new Error(errorData.message || 'Failed to add product to cart');
            }

            const cartInfo = await response.json();
            setCartInfo(cartInfo);


            const updatedCartResponse = await fetch('http://192.168.18.48:3000/users/cart/info', {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            const updatedCartInfo = await updatedCartResponse.json();
            setCartInfo(updatedCartInfo);


            RootToast.show('Item adicionado ao carrinho', {
                duration: 1500,
                position: 80,
                backgroundColor: '#1FA65A',
                textColor: '#ffffff',
                shadow: true,
            });

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

    useEffect(() => {
        if (route.params && route.params.product) {
            setProduct(route.params.product);
            if (product) {
                setTotalPrice(product.price);
                setExcludedProductIds([product._id]);
            }
        }
    }, [route.params, product]);


    useEffect(() => {
        if (product && product.subdepartment) {
            const fetchSimilarProductsAsync = async () => {
                const similarProducts = await fetchSimilarProducts(product.subdepartment);
                setSimilarProducts(similarProducts);
            };
            fetchSimilarProductsAsync();
        }
    }, [product]);

    useEffect(() => {
        setQuantity(1);
    }, [product]);

    useEffect(() => {

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 15,
            useNativeDriver: true,
        }).start();
    }, [product]);

    const navigateWithFade = (product, subdepartment) => {
        fadeAnim.setValue(0);
        navigation.navigate('DetailProduct', { product, subdepartment });
    };


    const renderSimilarProduct = ({ item }) => {
        if (excludedProductIds.includes(item._id)) {
            return null;
        }

        return (
            <View key={item._id} style={dynamicStyles.similarProductItem}>
                <TouchableOpacity
                    style={styles.iconButton1}
                    onPress={() => handleFavoritePress(item._id)}
                >
                    <Image
                        source={
                            favorites[item._id]
                                ? darkMode
                                    ? require('../../../../assets/love-dm1.png')
                                    : require('../../../../assets/love.png')
                                : darkMode
                                    ? require('../../../../assets/love-dmi.png')
                                    : require('../../../../assets/love1.png')
                        }
                        style={styles.iconFavorite}
                    />
                </TouchableOpacity>

                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                <Text style={dynamicStyles.name} numberOfLines={3}>{item.name}</Text>
                <Text style={dynamicStyles.description}>{item.description}</Text>
                <Text style={dynamicStyles.price1}>R$ {item.price}</Text>
                <TouchableOpacity style={dynamicStyles.customButton1}
                    onPress={() => navigateWithFade(item, item.subdepartment)}
                >
                    <Image source={require('../../../../assets/add.png')} style={styles.buttonIcon1} />
                </TouchableOpacity>
            </View>
        );
    };

    const filteredSimilarProducts = similarProducts.filter(
        item => !excludedProductIds.includes(item._id)
    );

    // Incremento da Quantidade
    const increaseQuantity = () => {
        setQuantity(quantity + 1);
        setTotalPrice(product.price * (quantity + 1));
    };

    // Decremento da Quantidade
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
            setTotalPrice(product.price * (quantity - 1));
        }
    };

    // Atualiza a quantidade de itens no carrinho sempre que a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            fetchCartInfo();
        }, [fetchCartInfo])
    );

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LottieView
                    source={require('../../../../assets/loading.json')}
                    autoPlay
                    loop
                    style={{ width: 150, height: 150 }}
                />
            </View>
        );
    }

    return (
        <View style={dynamicStyles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={
                            darkMode
                                ? require('../../../../assets/back-dm.png')
                                : require('../../../../assets/back.png')
                        }
                        style={[styles.icon, { height: 20, width: 20 }]}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                    <Image
                        source={
                            darkMode
                                ? require('../../../../assets/cart-dm.png')
                                : require('../../../../assets/cart.png')
                        }
                        style={[styles.icon, { height: 28, width: 28, marginTop: -5 }]}
                    />
                    <CartItemCount />
                </TouchableOpacity>
            </View>


            <View style={styles.contentContainer}>
                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    <ScrollView>
                        <Image source={{ uri: product.imageUrl }} style={styles.image} />

                        <TouchableOpacity
                            style={dynamicStyles.favoriteButton}
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
                                style={styles.iconFavorite1}
                            />
                        </TouchableOpacity>

                        <Text style={dynamicStyles.title}>{formatProductName(product.name)}</Text>
                        <View style={styles.descriptionContainer}>
                            <Text style={dynamicStyles.descriptionText}>Descrição</Text>
                        </View>

                        <Text style={styles.descriptionText1}>{product.description}</Text>

                        <View style={dynamicStyles.quantityContainer}>
                            <TouchableOpacity onPress={decreaseQuantity}>
                                <View style={dynamicStyles.subtractButton}>
                                    <View style={styles.icon}>
                                        <Image source={require('../../../../assets/subtrair.png')} style={styles.icon} />
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.quantity}>
                                <Text style={dynamicStyles.quantityText}>{quantity}</Text>
                            </View>

                            <TouchableOpacity onPress={increaseQuantity}>
                                <View style={dynamicStyles.addButton}>
                                    <View style={styles.icon}>
                                        <Image source={require('../../../../assets/somar.png')} style={styles.icon} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.textAndButtonContainer}>
                            <Text style={styles.descriptionText2}
                                numberOfLines={isExpanded ? undefined : 2}
                                ellipsizeMode='tail'
                            >
                                {product.details}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setIsExpanded(!isExpanded)}
                                style={styles.toggleButton}
                            >
                                <Text style={dynamicStyles.toggleText}>
                                    {isExpanded ? 'Ver menos' : 'Ver mais'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {filteredSimilarProducts.length > 0 ? (
                            <View style={styles.similarProductsSection}>
                                <Text style={dynamicStyles.similarProductsHeader}>Produtos Similares</Text>
                                <View><Text> </Text></View>
                                <View><Text> </Text></View>
                                <SwiperFlatList
                                    data={filteredSimilarProducts}
                                    renderItem={renderSimilarProduct}
                                    keyExtractor={(item) => item._id}
                                    snapToInterval={15}
                                />
                            </View>
                        ) : (
                            null
                        )}
                        <View><Text> </Text></View>
                        <View><Text> </Text></View>
                    </ScrollView>
                </Animated.View>
            </View>

            <View style={dynamicStyles.bottomSection}>
                <TouchableOpacity style={dynamicStyles.button} onPress={() => handleAddToCart(product._id, quantity)}>
                    <Text style={dynamicStyles.buttonText}>Adicionar ao carrinho</Text>
                </TouchableOpacity>

                <Text style={dynamicStyles.totalValue}>Preço Total</Text>

                {product && (
                    <Text style={dynamicStyles.price}>R$ {totalPrice.toFixed(2)}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    favoriteButton: {
        position: 'absolute',
        top: 290,
        left: 15,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconFavorite1: {
        width: 30,
        height: 30,
    },
    cartInfoConteiner: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 10,

    },

    buttonIcon1: {
        width: 20,
        height: 20,
    },

    iconFavorite: {
        width: 30,
        height: 30,
    },

    description: {
        color: 'gray',
        fontSize: 12,
        marginTop: 0,
        marginLeft: 13,
        height: 20,
    },

    price1: {
        color: '#0BB3D9',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 13,
        height: 20,
    },

    name: {
        color: '#0D0D0D',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 5,
        marginLeft: 13,
        width: 120,
        height: 20,
    },

    productImage: {
        height: 95,
        resizeMode: 'contain',
        width: 95,
        marginLeft: 30,
        marginTop: 30,
    },

    customButton1: {
        backgroundColor: '#0BB3D9',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 0,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        bottom: 0,
    },

    iconButton1: {
        position: 'absolute',
        padding: 10,
    },

    similarProductsSection: {
        marginTop: 15,
        marginLeft: 20
    },

    similarProductsHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 30
    },

    similarProductItem: {
        width: 150,
        height: 200,
        borderRadius: 20,
        marginRight: 18,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 10,
        paddingBottom: 10,
    },

    similarProductImage: {
        width: 95,
        height: 95,
        marginLeft: 20,
        marginTop: 22,
        resizeMode: 'contain',
    },

    similarProductName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginLeft: 10,
    },

    noSimilarProducts: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginLeft: 20,
    },

    similarProductPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0BB3D9',
        marginTop: 5,
        marginLeft: 10,
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 45,
        paddingHorizontal: 20,
    },


    bottomButton: {
        alignItems: 'center',
        backgroundColor: '#0BB3D9',
        height: 50,
        justifyContent: 'center',
    },

    bottomSection: {
        alignItems: 'center',
        backgroundColor: '#0BB3D9',
        height: 100,
        justifyContent: 'center',
    },

    button: {
        alignSelf: 'flex-end',
        backgroundColor: 'white',
        borderRadius: 30,
        marginBottom: -55,
        marginRight: 20,
        paddingHorizontal: 25,
        paddingVertical: 15,
    },

    buttonText: {
        color: '#0BB3D9',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    container: {
        backgroundColor: '#F2F2F2',
        flex: 1,
    },

    contentContainer: {
        flex: 1,
    },

    descriptionContainer: {
        flex: 1,
        left: 20,
        position: 'absolute',
        top: 440,
    },

    descriptionText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 40
    },

    textAndButtonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        maxWidth: 400,
        marginTop: 30,
    },

    descriptionText1: {
        color: 'gray',
        fontSize: 14,
        marginLeft: 20,
        marginTop: 12,
    },

    toggleButton: {
        alignSelf: 'flex-start',
        marginLeft: 20,
    },

    descriptionText2: {
        color: 'gray',
        fontSize: 14,
        marginLeft: 20,
        marginTop: 2,
        lineHeight: 18,
        maxWidth: 320
    },

    icon: {
        height: 15,
        width: 15,
    },

    image: {
        height: 250,
        marginLeft: 50,
        marginTop: 40,
        width: 250,
    },

    price: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 230,
        top: 5,
    },

    quantity: {
        alignItems: 'center',
        borderRadius: 50,
        height: 30,
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 10,
        width: 30,
    },

    quantityContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        marginLeft: 205,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,

    },

    quantityText: {
        color: '#0D0D0D',
        fontSize: 16,
        fontWeight: 'bold',
    },

    addButton: {
        alignItems: 'center',
        backgroundColor: '#0BB3D9',
        borderRadius: 50,
        height: 30,
        justifyContent: 'center',
        marginLeft: 7,
        width: 30,
    },

    subtractButton: {
        alignItems: 'center',
        backgroundColor: '#FFC300',
        borderRadius: 50,
        height: 30,
        justifyContent: 'center',
        marginRight: 5,
        width: 30,
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
        marginTop: 70,
        width: 'auto',
    },

    totalValue: {
        color: 'white',
        fontSize: 16,
        marginRight: 230,
    },

    valueDescriptionContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
});

export default DetailsProductScreen;