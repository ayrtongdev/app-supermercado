import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      
      
        <Image source={require('../../../assets/fundo_welcome_screen.png')} style={styles.backgroundImage} />
     

      <Text style={styles.titleTextBold}>As melhores ofertas!</Text>
      <Text style={styles.titleTextNormal}>Produtos frescos e do dia.</Text>

      <View style={styles.contentContainer}>


        <TouchableOpacity style={[styles.button, { backgroundColor: '#0BB3D9', marginBottom: 27 }]} onPress={() => navigation.navigate('Signup')}>
          <View style={styles.textContainer}>
            <Text style={[styles.buttonText, { textAlign: 'center' }]}>Começar</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  backgroundContainer: {
    position: 'absolute',
    backgroundColor: '#F2F2F2'
  },

  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },

  titleTextBold: {
    alignSelf: 'center',
    color: '#0D0D0D',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 20,
  },

  titleTextNormal: {
    alignSelf: 'center',
    color: 'gray',
    fontSize: 16,
    marginTop: 10,
  },

  backgroundImage: {
    alignSelf: 'center',
    width: 300,
    height: 300,
    marginTop:140
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10
  },

  button: {
    backgroundColor:'#0BB3D9',
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  buttonText: {
    color: '#F4FFE5',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 35
  },

  iconContainer: { marginLeft: 10 },

  textContainer: { flex: 1, alignItems: 'center', },
});

export default WelcomeScreen;
