import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import SplashScreen from '../components/screens/SplashScreen';
import WelcomeScreen from '../components/screens/WelcomeScreen';
import SignupScreen from '../components/screens/signup/SignupScreen';
import HomeScreen from '../components/screens/home/HomeScreen';
import EmailScreen from '../components/screens/register/EmailScreen';
import FavoriteScreen from '../components/screens/favorite/FavoriteScreen';
import StoreScreen from '../components/screens/store/StoreScreen';
import ProfileScreen from '../components/screens/profile/ProfileScreen';
import NomeScreen from '../components/screens/register/NomeScreen';
import ChatbotScreen from '../components/screens/chat/ChatbotScreen';
import RegisterScreen from '../components/screens/register/RegisterScreen';
import LoginScreen from '../components/screens/LoginScreen'
import CartScreen from '../components/screens/cart/CartScreen'
import DetailsProductScreen from '../components/screens/detailProduct/DetailProductScreen'
import EmptyCartScreen from '../components/screens/cart/EmptyCartScreen'
import SearchScreen from '../components/screens/search/SearchScreen'



const Stack = createStackNavigator();


const forVerticalSlide = ({ current, layouts }) => {
  return {
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.height, 0],
          }),
        },
      ],
    },
  };
};

const forHorizontalSlide = ({ current, layouts }) => {
  return {
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
    },
  };
};



const noTransition = () => {
  return {
    cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
  };
};

const AppNavigation = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Home" component={HomeScreen} options={noTransition} />
        <Stack.Screen name="DetailProduct" component={DetailsProductScreen} options={{cardStyleInterpolator: forHorizontalSlide,}}/>
        <Stack.Screen name="EmailScreen" component={EmailScreen}/>
        <Stack.Screen name="Register" component={RegisterScreen}/>
        <Stack.Screen name="Favorite" component={FavoriteScreen} options={noTransition}/>
        <Stack.Screen name="Store" component={StoreScreen} options={noTransition}/>
        <Stack.Screen name="NomeScreen" component={NomeScreen}/>
        <Stack.Screen name="Profile" component={ProfileScreen} options={noTransition}/>
        <Stack.Screen name="Cart" component={CartScreen} options={{cardStyleInterpolator: forVerticalSlide,}}/>
        <Stack.Screen name="EmptyCart" component={EmptyCartScreen} options={noTransition}/>
        <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{cardStyleInterpolator: forVerticalSlide,}}/>
        <Stack.Screen name="Search" component={SearchScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
