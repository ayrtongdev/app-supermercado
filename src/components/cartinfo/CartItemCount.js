// CartItemCount.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useCartStore from '../../zustand/store';

const CartItemCount = React.memo(() => {
    const itemCount = useCartStore(state => state.cartInfo.itemCount);

    if (itemCount === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{itemCount}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: -8,
        top: -5,
        backgroundColor: 'red',
        borderRadius: 12,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
});

export default CartItemCount;