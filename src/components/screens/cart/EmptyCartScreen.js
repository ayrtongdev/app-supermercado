import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import useThemeStore from '../../../zustand/themeStore';

const EmptyCartScreen = ({ navigation }) => {
    const { darkMode } = useThemeStore();

   const dynamicStyles = {
      container: {
          ...styles.container,
          backgroundColor: darkMode ? '#212121' : '#F2F2F2',
      },
      button: {
          ...styles.button,
          backgroundColor: darkMode ? '#0288D1' : '#0BB3D9'
     },
     text:{
      ...styles.text,
      color: darkMode ? '#717171' : '#252525'
     },
  };

 return (
    <View style={dynamicStyles.container}>
      <Image source={require('../../../../assets/emptycart.png')} style={styles.image} />
      <Text style={dynamicStyles.text}>Seu carrinho está vazio</Text>
      <TouchableOpacity style={dynamicStyles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Voltar para o início</Text>
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
    color: '#F5F5F5',
    fontSize: 16,
 },
});

export default EmptyCartScreen;
