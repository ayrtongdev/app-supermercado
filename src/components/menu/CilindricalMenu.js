import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import useThemeStore from '../../zustand/themeStore';

const CilindricalMenu = () => {
  const navigation = useNavigation();
  const currentRoute = useNavigationState((state) => state.routes[state.index].name);
  const { darkMode } = useThemeStore();

  // Função para determinar o ícone correto
  const getIcon = (routeName, isActive) => {
    const darkIcons = {
      Home: isActive ? require('../../../assets/home-dm.png') : require('../../../assets/house1.png'),
      Favorite: isActive ? require('../../../assets/love-dm-menu.png') : require('../../../assets/love-dmi.png'),
      Store: isActive ? require('../../../assets/store-dm.png') : require('../../../assets/voucher1.png'),
      Profile: isActive ? require('../../../assets/user-dm.png') : require('../../../assets/user1.png'),
    };

    const lightIcons = {
      Home: isActive ? require('../../../assets/house.png') : require('../../../assets/house1.png'),
      Favorite: isActive ? require('../../../assets/love2.png') : require('../../../assets/love3.png'),
      Store: isActive ? require('../../../assets/voucher.png') : require('../../../assets/voucher1.png'),
      Profile: isActive ? require('../../../assets/user2.png') : require('../../../assets/user1.png'),
    };

    return darkMode ? darkIcons[routeName] : lightIcons[routeName];
  };

  // Função para criar estilos animados
  const createAnimatedStyle = (routeName) => {
    const isActive = currentRoute === routeName;
    const scale = isActive ? 1 : 0.7;
    const borderWidth = isActive ? 2 : 0;
    const backgroundColor = isActive
      ? darkMode
        ? '#E0E0E0'
        : '#EEEEEE'
      : darkMode
      ? '#0288D1'
      : '#0BB3D9';

    return useAnimatedStyle(() => ({
      transform: [{ scale: withTiming(scale, { duration: 200 }) }],
      borderWidth: withTiming(borderWidth, { duration: 200 }),
      backgroundColor: withTiming(backgroundColor, { duration: 200 }),
    }));
  };

  // Estilos dinâmicos com base no tema
  const dynamicStyles = {
    menuContainer: {
      ...styles.menuContainer,
      backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
    },
    iconCircle: {
      ...styles.iconCircle,
      borderColor: darkMode ? '#E0E0E0' : '#F2F2F2',
    },
  };

  // Renderização
  return (
    <View style={dynamicStyles.menuContainer}>
      {['Home', 'Favorite', 'Store', 'Profile'].map((routeName) => (
        <TouchableOpacity key={routeName} onPress={() => navigation.navigate(routeName)}>
          <Animated.View
            style={[dynamicStyles.iconCircle, createAnimatedStyle(routeName), styles.glassEffect]}
          >
            <Image
              source={getIcon(routeName, currentRoute === routeName)}
              style={{ width: 30, height: 30 }}
            />
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  glassEffect: {
    backgroundColor: '#0BB3D9',
    overflow: 'hidden',
    borderRadius: 50,
    padding: 10,
  },
  iconCircle: {
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    borderColor: '#F2F2F2',
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0BB3D9',
    borderRadius: 50,
    height: 60,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
});

export default CilindricalMenu;
