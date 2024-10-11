import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const EmptyCartScreen = ({ navigation }) => {
 return (
    <View style={styles.container}>
      <Image source={require('../../../../assets/emptycart.png')} style={styles.image} />
      <Text style={styles.text}>Seu carrinho está vazio</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Comece aqui</Text>
      </TouchableOpacity>
    </View>
 );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
 },
 image: {
    width: 200, 
    height: 200, 
    marginBottom: 20,
 },
 text: {
    fontSize: 18,
    marginBottom: 20,
 },
 button: {
    backgroundColor: '#0BB3D9', 
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 30,
 },
 buttonText: {
    color: 'white',
    fontSize: 16,
 },
});

export default EmptyCartScreen;
