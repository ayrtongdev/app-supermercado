// CartInfo.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useCartStore from '../../zustand/store';
import { useNavigation } from '@react-navigation/native';
import useThemeStore from '../../zustand/themeStore';

const CartInfo = ({ customStyle = {} }) => {
    const cartInfo = useCartStore(state => state.cartInfo);
    const navigation = useNavigation();
    const { darkMode } = useThemeStore();

    if (cartInfo.itemCount === 0) {
        return null;
    }

    const dynamicStyles = {
        container: {
            ...styles.container,
            backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
        },
        buttonText: {
            ...styles.buttonText,
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        
    };

    return (
        <View style={[dynamicStyles.container, customStyle]}>
            <View>
                <Text style={styles.totalText}>Total</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>
                    R$ {typeof cartInfo.totalValue === 'number' ? cartInfo.totalValue.toFixed(2) : '0.00'} |
                </Text>
                <Text style={styles.textItem}> {cartInfo.itemCount} itens </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cart')}>
                <Text style={dynamicStyles.buttonText}>Ver carrinho</Text>
            </TouchableOpacity>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0BB3D9',
        padding: 10,
        borderRadius: 5,
        position: 'absolute',
        bottom: 85,
        alignSelf: 'center',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: 280,
    },
    text: {
        color: '#EEEEEE',
        fontWeight: 'bold',
        marginBottom: 5,
        fontSize: 12,
    },
    textItem: {
        color: '#EEEEEE',
        marginBottom: 5,
        fontSize: 12,
    },
    totalText: {
        color: '#EEEEEE',
        fontSize: 12,
        marginBottom: 0,
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    button: {
        backgroundColor: '#EEEEEE',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginLeft: 150,
        marginTop: -35
    },

    buttonText: {
        color: '#0BB3D9',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default CartInfo;
