import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const CilindricalMenu = () => {
  const navigation = useNavigation();
  const currentRoute = useNavigationState((state) => state.routes[state.index].name);

  const createAnimatedStyle = (routeName) => {
    const isActive = currentRoute === routeName;
    const scale = isActive ? 1 : 0.7;
    const borderWidth = isActive ? 2 : 0;
    const backgroundColor = isActive ? '#EEEEEE' : '#0BB3D9';

    return useAnimatedStyle(() => ({
      transform: [{ scale: withTiming(scale, { duration: 200 }) }],
      borderWidth: withTiming(borderWidth, { duration: 200 }),
      backgroundColor: withTiming(backgroundColor, { duration: 200 }),
    }));
  };

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Animated.View style={[styles.iconCircle, createAnimatedStyle('Home'), styles.glassEffect]}>
          <Image
            source={currentRoute === 'Home' ? require('../../../assets/house.png') : require('../../../assets/house1.png')}
            style={{ width: 30, height: 30 }}
          />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Favorite')}>
        <Animated.View style={[styles.iconCircle, createAnimatedStyle('Favorite'), styles.glassEffect]}>
          <Image
            source={currentRoute === 'Favorite' ? require('../../../assets/love2.png') : require('../../../assets/love3.png')}
            style={{ width: 30, height: 30 }}
          />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Store')}>
        <Animated.View style={[styles.iconCircle, createAnimatedStyle('Store'), styles.glassEffect]}>
          <Image
            source={currentRoute === 'Store' ? require('../../../assets/voucher.png') : require('../../../assets/voucher1.png')}
            style={{ width: 30, height: 30 }}
          />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Animated.View style={[styles.iconCircle, createAnimatedStyle('Profile'), styles.glassEffect]}>
          <Image
            source={currentRoute === 'Profile' ? require('../../../assets/user2.png') : require('../../../assets/user1.png')}
            style={{ width: 30, height: 30 }}
          />
        </Animated.View>
      </TouchableOpacity>
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
    backgroundColor: '#F2F3F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 15,
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
    elevation: 5,
    overflow: 'hidden',
  },
});

export default CilindricalMenu;