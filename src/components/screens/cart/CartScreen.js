//CartScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import RootToast from 'react-native-root-toast';



const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      cartItems.forEach(item => {
        total += item.productId.price * item.quantity;
      });
      setTotal(total);
    };

    calculateTotal();
  }, [cartItems]);


  useEffect(() => {

    const fetchCartData = async () => {
      const userToken = await AsyncStorage.getItem('userToken');

      const response = await fetch('http://192.168.18.56:3000/users/cart', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao buscar carrinho:', errorData.message);
        return;
      }

      const data = await response.json();

      if (!data.productIds || data.productIds.length === 0) {
        navigation.replace('EmptyCart');
        return;
      }

      setCartItems(data.productIds || []);

    };
    fetchCartData();
  }, []);


  const handleQuantityChange = async (item, newQuantity) => {

    const userToken = await AsyncStorage.getItem('userToken');
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`http://192.168.18.56:3000/users/cart/${item.productId._id}/quantity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      }).catch(error => console.error('Error making fetch request:', error));


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível atualizar a quantidade do item.');
      }


      const newCartItems = cartItems.map(cartItem => {
        if (cartItem.productId._id === item.productId._id) {
          return { ...cartItem, quantity: newQuantity };
        } else {
          return cartItem;
        }
      });


      setCartItems(newCartItems);


      if (newCartItems.length === 0) {
        navigation.replace('EmptyCart');
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCart = async () => {

    try {
      const userToken = await AsyncStorage.getItem('userToken');

      const response = await fetch('http://192.168.18.56:3000/users/cart/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao esvaziar o carrinho:', errorData.message);
        throw new Error('Erro ao esvaziar o carrinho');
      }

      setCartItems([]);

      navigation.replace('EmptyCart');

      RootToast.show('O carrinho foi esvaziado', {
        duration: 1650,
        position: 80,
        backgroundColor: '#FF4747',
        textColor: '#ffffff',
        shadow: true
      });
    } catch (error) {
      console.error('Erro ao esvaziar o carrinho:', error);
    }
  };

  const getQuantityContainerStyle = (quantity) => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
    };

    if (quantity >= 10) {
      return {
        ...baseStyle,
        marginHorizontal: -6,
      };
    }

    return baseStyle;
  };

  const getQuantityTextStyle = (quantity) => {
    const baseStyle = {
      fontSize: 16,
      marginHorizontal: 8,
    };

    if (quantity >= 10) {
      return {
        ...baseStyle,
        marginHorizontal: 4,
      };
    }

    return baseStyle;
  };

  const getButtonStyle = (quantity) => {
    const baseStyle = {
      alignItems: 'center',
      borderRadius: 50,
      height: 25,
      justifyContent: 'center',
      width: 25,
    };

    if (quantity >= 10) {
      return {
        ...baseStyle,
        marginHorizontal: 2,
      };
    }

    return baseStyle;
  };



  const renderItem = ({ item }) => {

    const handleRemoveItem = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');

        const response = await fetch(`http://192.168.18.56:3000/users/cart/${item.productId._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          RootToast.show('Falha ao remover o item do carrinho', {
            duration: 1650,
            position: 80,
            backgroundColor: '#FF4747',
            textColor: '#ffffff',
            shadow: true,
          });
        }


        const newCartItems = cartItems.filter(cartItem => cartItem.productId._id !== item.productId._id);


        setCartItems(newCartItems);


        if (newCartItems.length === 0) {
          navigation.replace('EmptyCart');
        }


        RootToast.show('O item foi removido do carrinho', {
          duration: 1500,
          position: 80,
          backgroundColor: '#1FA65A',
          textColor: '#ffffff',
          shadow: true
        });


      } catch (error) {
        console.error('Erro ao remover o item do carrinho:', error);
      }
    };



    const totalPrice = item.productId.price * item.quantity;

    return (
      <View style={styles.cartItem}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.productId.imageUrl }} style={styles.image} />
        </View>
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{item.productId.name}</Text>
          <Text style={styles.description}>{item.productId.description}</Text>
          <View style={styles.priceAndQuantityContainer}>
            <Text style={styles.totalPrice}>R${totalPrice.toFixed(2)}</Text>
            <View style={getQuantityContainerStyle(item.quantity)}>
              {item.quantity === 1 ? (
                <TouchableOpacity onPress={handleRemoveItem}>
                  <Image source={require('../../../../assets/delete.png')} style={styles.trashIcon} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleQuantityChange(item, item.quantity - 1)}>
                  <View style={[styles.subtractButton, getButtonStyle(item.quantity)]}>
                    <MaterialIcons name="remove" size={18} color="white" />
                  </View>
                </TouchableOpacity>
              )}
              <Text style={getQuantityTextStyle(item.quantity)}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => handleQuantityChange(item, item.quantity + 1)}>
                <View style={[styles.addButton, getButtonStyle(item.quantity)]}>
                  <MaterialIcons name="add" size={18} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>

        <TouchableOpacity onPress={() => navigation.goBack()} >
          <Image source={require('../../../../assets/down.png')} style={[styles.icon, { height: 25, width: 25 }]} />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold' }}>Carrinho</Text>
        <TouchableOpacity onPress={handleClearCart} style={{ fontSize: 14 }}>
          <Text style={{ color: '#0BB3D9' }}>Limpar</Text>
        </TouchableOpacity>

      </View>

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.productId._id}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
      <View style={styles.footer}>

        <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
        </TouchableOpacity>

        <Text style={styles.totalText}>Total</Text>

        <Text style={styles.price}>R$ {total.toFixed(2)}</Text>

      </View>


    </View>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  cartItem: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 20,
    marginBottom: 0,
  },
  imageContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 5,
    marginRight: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 85,
    height: 85,
    borderRadius: 5,
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 45,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  priceAndQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginHorizontal: -6,
    marginLeft: 0
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  quantityText: {
    fontSize: 15,
    marginHorizontal: 10,

  },
  subtractButton: {
    alignItems: 'center',
    backgroundColor: '#FFC300',
    borderRadius: 50,
    height: 25,
    justifyContent: 'center',
    marginRight: 5,
    width: 25,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#0BB3D9',
    borderRadius: 50,
    height: 25,
    justifyContent: 'center',
    marginLeft: 5,
    width: 25,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trashIcon: {
    width: 18,
    height: 18,
    marginRight: 8
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#0BB3D9',
    height: 100,
    justifyContent: 'center',
  },
  totalText: {
    color: 'white',
    fontSize: 16,
    marginRight: 210,
    paddingBottom: 5,
  },
  price: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 200,
    marginBottom: -10
  },
  checkoutButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    borderRadius: 30,
    marginBottom: -55,
    marginRight: 20,
    paddingHorizontal: 35,
    paddingVertical: 15,
  },
  checkoutButtonText: {
    color: '#0BB3D9',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CartScreen;
