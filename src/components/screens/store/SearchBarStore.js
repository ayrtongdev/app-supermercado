import React from 'react';
import { TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import useThemeStore from '../../../zustand/themeStore';

const SearchBar = () => {
  const navigation = useNavigation();
  const { darkMode } = useThemeStore();

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
    },
    iconColor: darkMode ? '#E0E0E0' : '#000000',
  };

  const handleSearchPress = () => {
    navigation.navigate('Search'); 
  };

  return (
    <TouchableOpacity onPress={handleSearchPress} style={dynamicStyles.container}>
      <Icon name="search" size={24} color={dynamicStyles.iconColor} style={styles.iconStyle} />
      <TextInput
        editable={false} 
        placeholder="Busque por ovos, frutas e mais..."
        placeholderTextColor={darkMode ? '#E0E0E0' : '#000000'}
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
    marginTop: 60,
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
