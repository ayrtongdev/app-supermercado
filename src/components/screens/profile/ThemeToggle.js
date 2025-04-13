import React, { useRef, useEffect } from 'react';
import { Animated, PanResponder, StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import useThemeStore from '../../../zustand/themeStore';

const ThemeToggle = ({ userId }) => {
  const { darkMode, toggleTheme } = useThemeStore();
  const animation = useRef(new Animated.Value(darkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: darkMode ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [darkMode]);

  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newPosition = Math.max(0, Math.min(1, gestureState.dx / 34));
        animation.setValue(newPosition);
      },
      onPanResponderRelease: (e, gestureState) => {
        const shouldToggleOn = gestureState.dx > 0;
        if (darkMode !== shouldToggleOn) toggleTheme(); 
        Animated.spring(animation, {
          toValue: shouldToggleOn ? 1 : 0,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Configura o toque único para alternar o tema
  const handleTogglePress = () => {
    toggleTheme(userId); 
    Animated.spring(animation, {
      toValue: darkMode ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const iconPosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-19, 20],
  });

  return (
    <TouchableWithoutFeedback onPress={handleTogglePress}> 
      <View
        style={[
          styles.container,
          darkMode && styles.neonBorder, 
        ]}
      >
        <Animated.Image
          source={require('../../../../assets/ceudia.png')}
          style={[styles.backgroundImage, { opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
          resizeMode="cover"
        />
        <Animated.Image
          source={require('../../../../assets/ceunoite.png')}
          style={[styles.backgroundImage, { opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]}
          resizeMode="cover"
        />
        <Animated.View
          style={[styles.icon, { transform: [{ translateX: iconPosition }] }]}
          {...panResponder.panHandlers} 
        >
          <Animated.Image
            source={darkMode ? require('../../../../assets/full-moon.png') : require('../../../../assets/sun.png')}
            style={styles.iconImage}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 30,
    borderRadius: 20,
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
    left: 210,
    top: -27,
  },
  neonBorder: {
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: 'white',
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 13,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 25,
    height: 25,
    borderRadius: 13,
  },
});

export default ThemeToggle;
