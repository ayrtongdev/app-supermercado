//HomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CilindricalMenu from '../../menu/CilindricalMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwiperFlatList from 'react-native-swiper-flatlist';
import CartInfo from '../../cartinfo/CartInfo';
import useCartStore from '../../../zustand/store';
import SearchBar from '../search/SeachBar';
import Department from './department';
import RootToast from 'react-native-root-toast';
import CartItemCount from '../../cartinfo/CartItemCount';
import LottieView from 'lottie-react-native';
import useKeyboard from '../../hooks/useKeyboard';
import useFavoriteStore from '../../../zustand/favoritesStore';
import axios from 'axios';


const fetchProducts = async (category) => {
  try {
    const response = await fetch(`http://192.168.18.56:3000/products/?category=${category}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    const productsWithSubdepartment = data.map(product => ({
      ...product,
      subdepartment: product.subdepartment || 'Outros'
    }));

    return productsWithSubdepartment;
  } catch (error) {
    console.error('Erro ao buscar os produtos:', error);
    return [];
  }
};



const HomeScreen = ({ navigation }) => {
  const isKeyboardVisible = useKeyboard();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState({ popularProducts: [], forYouProducts: [] });
  const [opacity, setOpacity] = useState(1);
  const [interactive, setInteractive] = useState(true);
  const [banners, setBanners] = useState([]);
  const [greeting, setGreeting] = useState('Olá');

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);


  const fetchCartInfo = useCartStore(state => state.fetchCartInfo);
  const favorites = useFavoriteStore(state => state.favorites);
  const fetchFavorites = useFavoriteStore(state => state.fetchFavorites);
  const addFavorite = useFavoriteStore(state => state.addFavorite);
  const removeFavorite = useFavoriteStore(state => state.removeFavorite);

  useFocusEffect(
    React.useCallback(() => {
      fetchCartInfo();
      fetchFavorites();
      fetchUserData();
      determineGreeting();
    }, [])
  );

  // Função para definir a saudação com base na hora atual
  const determineGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Bom dia');
    } else if (currentHour >= 12 && currentHour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch('http://192.168.18.56:3000/users/banners');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar os banners:', error);
      return [];
    }
  };

  const fetchUserData = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    try {
      const response = await axios.get('http://192.168.18.56:3000/users/user', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };


  const handleFavoritePress = async (productId) => {
    try {

      const userToken = await AsyncStorage.getItem('userToken');

      const apiUrl = `http://192.168.18.56:3000/users/favorites/${productId}`;
      const method = favorites[productId] ? 'DELETE' : 'PUT';
      const body = JSON.stringify({ productId });

      const fetchPromise = fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out'));
        }, 2000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        RootToast.show('Tivemos um problema por aqui', {
          duration: 1650,
          position: 80,
          backgroundColor: '#FF4747',
          textColor: '#ffffff',
          shadow: true,
        });
        return;
      }

      if (favorites[productId]) {
        removeFavorite(productId);
      } else {
        addFavorite(productId);
      }
    } catch (error) {
      RootToast.show('Tivemos um problema por aqui', {
        duration: 1650,
        position: 80,
        backgroundColor: '#FF4747',
        textColor: '#ffffff',
        shadow: true,
      });
    }
  };



  useEffect(() => {
    const fetchProductsAndSetState = async () => {
      const popularProducts = await fetchProducts('popular');
      const forYouProducts = await fetchProducts('para você');
      setProducts({ popularProducts, forYouProducts });
    };

    fetchProductsAndSetState();
  }, []);

  useEffect(() => {
    const fetchBannersAndSetState = async () => {
      const banners = await fetchBanners();
      setBanners(banners);
    };

    fetchBannersAndSetState();
  }, []);

  if (!products || (products.popularProducts.length === 0 && products.forYouProducts.length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView
          source={require('../../../../assets/loading.json')}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const newOpacity = Math.max(1 - yOffset / 100);
    setOpacity(newOpacity);

    if (newOpacity <= 0.2) {
      setInteractive(false);
    } else {
      setInteractive(true);
    }

  };

  const renderBannerItem = ({ item }) => (
    <View style={{ marginHorizontal: 6 }}>
      <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} />
    </View>
  );

  const renderProductItem = ({ item }) => (

    <View style={styles.carouselItem}>
      <TouchableOpacity
        style={styles.iconButton1}
        onPress={() => handleFavoritePress(item._id)}
      >
        <Image
          source={favorites[item._id] ? require('../../../../assets/love.png') : require('../../../../assets/love1.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Text style={styles.name} numberOfLines={3}>{item.name}</Text>
      <Text style={styles.description} >{item.description}</Text>
      <Text style={styles.price}>R$ {item.price}</Text>
      <TouchableOpacity style={styles.customButton1}
        onPress={() => navigation.navigate('DetailProduct', { product: item, subdepartment: item.subdepartment })}
      >
        <Image source={require('../../../../assets/add.png')} style={styles.buttonIcon1} />
      </TouchableOpacity>
    </View>

  );

  const renderProductItemForYou = ({ item }) => (
    <View style={styles.carouselItemForYou}>
      <TouchableOpacity
        style={styles.iconButton1}
        onPress={() => handleFavoritePress(item._id)}
      >
        <Image
          source={favorites[item._id] ? require('../../../../assets/love.png') : require('../../../../assets/love1.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage2} />
      <Text style={styles.nameBox3}>{item.name}</Text>
      <Text style={styles.descriptionBox3}>{item.description}</Text>
      <Text style={styles.priceBox3}>R$ {item.price}</Text>
      <TouchableOpacity style={styles.customButton}
        onPress={() => navigation.navigate('DetailProduct', { product: item })}
      >
        <Image source={require('../../../../assets/add.png')} style={styles.buttonIcon1} />
      </TouchableOpacity>

    </View>
  );


  return (
    <View style={styles.container}>

      <View style={[styles.cylindricalContainer, { opacity, pointerEvents: interactive ? 'auto' : 'none' }]}>

        <View style={styles.menuButtonContainer}>

          <TouchableOpacity style={styles.menuCircle} onPress={() => navigation.navigate('Profile')} activeOpacity={interactive ? 1 : 0.5}>
            {user && (
              <Image source={{ uri: user.photoUrl }} style={styles.userIcon} />
            )}
          </TouchableOpacity>

          <View style={styles.textContainer}>
            {user && (
              <Text style={styles.greetingText}>{greeting},<Text style={styles.bold}> {user.givenName}</Text> </Text>
            )}
            <Text style={styles.exploreText}>Encontre tudo o que precisa aqui.</Text>
          </View>

        </View>

        <View style={styles.menuButtonContainer}>

          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Cart')} activeOpacity={interactive ? 1 : 0.5} >
            <Image source={require('../../../../assets/menu.png')} style={styles.menuIcon} />
            <CartItemCount />
          </TouchableOpacity>

        </View>

      </View>

      <ScrollView onScroll={handleScroll} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.searchBar}>
          <SearchBar />
        </View>

        <View style={styles.carouselContainerBanner}>
          <SwiperFlatList
            data={banners}
            renderItem={renderBannerItem}
            keyExtractor={(item) => item._id}
            showPagination={true}
            paginationStyle={{ bottom: -35 }}
            paginationStyleItem={{ width: 5, height: 5, borderRadius: 5 }}
            paginationActiveColor="#0BB3D9"
            snapToInterval={15}
          />
        </View>

        <Department selectedDepartment={selectedDepartmentId} navigation={navigation} />

        <Text style={styles.headerText}>Populares</Text>

        <View style={styles.carouselContainer}>
          <SwiperFlatList
            data={products.popularProducts}
            renderItem={renderProductItem}
            onSwipeLeft={(item) => (`Swiped left: ${item.name}`)}
            onSwipeRight={(item) => (`Swiped right: ${item.name}`)}
            keyExtractor={(item) => item._id}
            snapToInterval={15}
          />
        </View>

        <Text style={styles.suggestionText}>Recomendados</Text>

        <View style={styles.carouselContainerForYou}>
          <SwiperFlatList
            data={products.forYouProducts}
            renderItem={renderProductItemForYou}
            onSwipeLeft={(item) => (`Swiped left: ${item.name}`)}
            onSwipeRight={(item) => (`Swiped right: ${item.name}`)}
            keyExtractor={(item) => item._id}
            snapToInterval={15}
          />
        </View>
      </ScrollView>

      {!isKeyboardVisible && <CilindricalMenu navigation={navigation} />}
      {!isKeyboardVisible && <CartInfo />}

    </View>
  );
};

const styles = StyleSheet.create({
  bannerImage: {
    width: 340,
    height: 150,
    borderRadius: 10,
    marginLeft: 5
  },

  bold: {
    fontWeight: 'bold',
  },

  carouselContainer: {
    marginTop: 80,
    marginLeft: 10,
  },


  carouselContainerBanner: {
    marginTop: 65,
    width: Dimensions.get('window').width,
  },

  carouselContainerForYou: {
    marginTop: 80,
    marginLeft: 10,
  },

  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    left: 20,
    position: 'absolute',
    top: 620,
  },

  carouselItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 200,
    margin: 10,
    padding: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  suggestionText: {
    fontSize: 16,
    fontWeight: 'bold',
    left: 20,
    position: 'absolute',
    top: 920,
  },

  carouselItemForYou: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 160,
    margin: 10,
    padding: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  Box3: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 160,
    left: 20,
    position: 'absolute',
    top: 460,
    width: 320,
  },

  boxIcon: {
    height: 30,
    marginLeft: 110,
    marginTop: 20,
    width: 30,
  },

  boxText: {
    bottom: 80,
    left: 10,
    position: 'absolute',
  },

  container: {
    backgroundColor: '#F2F2F2',
    flex: 1,
  },

  customButton: {
    backgroundColor: '#0BB3D9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 0,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 0,
  },

  customButton1: {
    backgroundColor: '#0BB3D9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    bottom: 0,
  },

  buttonIcon: {
    width: 30,
    height: 30,
  },

  buttonIcon1: {
    width: 20,
    height: 20,
  },

  cylindricalContainer: {
    alignItems: 'center',
    backgroundColor: '#0BB3D9',
    borderRadius: 30,
    elevation: 5,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    left: 20,
    overflow: 'hidden',
    paddingHorizontal: 5,
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    top: 40,
    zIndex: 10,
  },

  description: {
    color: 'gray',
    fontSize: 12,
    marginTop: 0,
    marginLeft: 10,
    height: 20,
  },

  descriptionBox3: {
    color: 'gray',
    fontSize: 14,
    marginLeft: 150,
    marginTop: 5
  },

  exploreText: {
    color: '#FFFFFF',
    fontSize: 12,
  },

  greetingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'thin',
  },



  iconButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
  },

  iconButton1: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
  },

  icon: {
    width: 30,
    height: 30,
  },

  menuButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 15,
  },

  menuCircle: {
    alignItems: 'center',
    backgroundColor: '#0BB3D9',
    borderColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 2,
    height: 52,
    justifyContent: 'center',
    padding: 8,
    width: 52,
  },

  menuIcon: {
    height: 28,
    width: 28,
  },

  name: {
    color: '#0D0D0D',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 0,
    marginLeft: 10,
    width: 120,
    height: 20,
  },

  searchBar: {
    top: 20
  },

  scrollViewContent: {
    paddingBottom: 180, // Espaçamento inferior desejado
  },

  nameBox3: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 150,
    width: 150,
    marginTop: -90
  },

  price: {
    color: '#0BB3D9',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 3,
    marginLeft: 10,
    height: 20,
  },

  priceBox3: {
    color: '#0BB3D9',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 150,
    marginTop: 5
  },

  progressBar: {
    bottom: 20,
    height: 10,
    left: 10,
    position: 'absolute',
    width: '80%',
  },

  productImage: {
    height: 95,
    resizeMode: 'contain',
    borderRadius: 50,
    width: 95,
    marginLeft: 20,
    marginTop: 22,
  },

  productImage2: {
    height: 105,
    width: 105,
    marginLeft: 25,
    marginTop: 15
  },


  textContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 10,
  },

  userIcon: {
    borderRadius: 50,
    height: 50,
    width: 50,
  },
});


export default HomeScreen;
