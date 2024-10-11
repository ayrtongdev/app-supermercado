import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SearchBar = () => {
  const navigation = useNavigation();

  const handleSearchPress = () => {
    navigation.navigate('Search'); // Direciona o usuário para a tela de pesquisa
  };

  return (
    <TouchableOpacity onPress={handleSearchPress} style={styles.container}>
      <Icon name="search" size={24} color="#000" style={styles.iconStyle} />
      <TextInput
        editable={false} // Impede que o usuário edite, já que é apenas um botão agora
        placeholder="Busque por ovos, frutas e mais..."
        style={styles.input}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 45,
    width: '90%',
    alignSelf: 'center',
    marginTop: 120,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
  },
  iconStyle: {
    paddingRight: 0,
  },
});

export default SearchBar;
