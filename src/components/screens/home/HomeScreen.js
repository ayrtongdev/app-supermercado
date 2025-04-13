import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, Text, ScrollView, StyleSheet, Dimensions, BackHandler  } from 'react-native';
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
import useFavoriteStore from '../../../zustand/favoritesStore';
import axios from 'axios';
import useThemeStore from '../../../zustand/themeStore';

const fetchProducts = async (department) => {
  try {
    const response = await fetch(`http://192.168.18.48:3000/products/?department=${department}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao buscar os produtos do departamento ${department}:`, error);
    return [];
  }
};

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState({ popularProducts: [], forYouProducts: [] });
  const [opacity, setOpacity] = useState(1);
  const [interactive, setInteractive] = useState(true);
  const [banners, setBanners] = useState([]);
  const [greeting, setGreeting] = useState('Olá');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const { darkMode } = useThemeStore();

  const fetchCartInfo = useCartStore(state => state.fetchCartInfo);
  const favorites = useFavoriteStore(state => state.favorites);
  const fetchFavorites = useFavoriteStore(state => state.fetchFavorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

  useEffect(() => {
    const fetchProductsAndSetState = async () => {
      const allProducts = await fetchProducts();
      const popularProductsData = allProducts.filter(product => product.department.includes('Popular'));
      const forYouProductsData = allProducts.filter(product => product.department.includes('Para Você'));
      setProducts({
        popularProducts: popularProductsData,
        forYouProducts: forYouProductsData
      });
    };

    fetchProductsAndSetState();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp(); 
        return true; 
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );


  useFocusEffect(
    React.useCallback(() => {
      fetchCartInfo();
      fetchFavorites();
      fetchUserData();
    }, [])
  );

  useEffect(() => {
    determineGreeting();
  }, []);

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

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: darkMode ? '#212121' : '#F2F2F2',
    },
    headerText: {
      ...styles.headerText,
      color: darkMode ? '#E0E0E0' : '#000000',
    },
    suggestionText: {
      ...styles.suggestionText,
      color: darkMode ? '#E0E0E0' : '#000000',
    },
    carouselItem: {
      ...styles.carouselItem,
      backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
    },
    name: {
      ...styles.name,
      color: darkMode ? '#E0E0E0' : '#000000',
    },
    description: {
      ...styles.description,
      color: darkMode ? '#a3a3a3' : 'gray',
    },
    carouselItemForYou: {
      ...styles.carouselItemForYou,
      backgroundColor: darkMode ? '#2A2A2A' : '#FFFFFF',
    },
    nameBox3: {
      ...styles.nameBox3,
      color: darkMode ? '#E0E0E0' : '#0D0D0D',
    },
    descriptionBox3: {
      ...styles.descriptionBox3,
      color: darkMode ? '#A3A3A3' : 'gray',
    },
    cylindricalContainer: {
      ...styles.cylindricalContainer,
      backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
    },
    greetingText: {
      ...styles.greetingText,
      color: darkMode ? '#E0E0E0' : '#FFFFFF',
    },
    exploreText: {
      ...styles.exploreText,
      color: darkMode ? '#E0E0E0' : '#FFFFFF',
    },
    bold: {
      ...styles.bold,
      color: darkMode ? '#E0E0E0' : '#FFFFFF',
    },
    customButton1: {
      ...styles.customButton1,
      backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
    },
    customButton: {
      ...styles.customButton,
      backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
    },
    price: {
      ...styles.price,
      color: darkMode ? '#0288D1' : '#0BB3D9',
    },
    priceBox3: {
      ...styles.priceBox3,
      color: darkMode ? '#0288D1' : '#0BB3D9',
    },
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch('http://192.168.18.48:3000/users/banners');
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
      const response = await axios.get('http://192.168.18.48:3000/users/user', {
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
      const apiUrl = `http://192.168.18.48:3000/users/favorites/${productId}`;
      const method = favorites[productId] ? 'DELETE' : 'PUT';

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ productId }),
      });

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

      toggleFavorite(productId);
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
    const fetchBannersAndSetState = async () => {
      const banners = await fetchBanners();
      setBanners(banners);
    };

    fetchBannersAndSetState();
  }, []);

  if (products.popularProducts.length === 0 && products.forYouProducts.length === 0) {
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
    <View style={dynamicStyles.carouselItem}>
      <TouchableOpacity
        style={styles.iconButton1}
        onPress={() => handleFavoritePress(item._id)}
      >
        <Image
          source={
            favorites[item._id]
              ? darkMode
                ? require('../../../../assets/love-dm1.png') // Favoritado no Modo Escuro
                : require('../../../../assets/love.png') // Favoritado no Modo Claro
              : darkMode
              ? require('../../../../assets/love-dmi.png') // Não favoritado no Modo Escuro
              : require('../../../../assets/love1.png') // Não favoritado no Modo Claro
          }
          style={styles.icon}
        />
      </TouchableOpacity>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <Text style={dynamicStyles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={dynamicStyles.description}>{item.description}</Text>
      <Text style={dynamicStyles.price}>R$ {item.price}</Text>
      <TouchableOpacity
        style={dynamicStyles.customButton1}
        onPress={() =>
          navigation.navigate('DetailProduct', {
            product: item,
            subdepartment: item.subdepartment,
          })
        }
      >
        <Image
          source={require('../../../../assets/add.png')}
          style={styles.buttonIcon1}
        />
      </TouchableOpacity>
    </View>
  );
  
  

  const renderProductItemForYou = ({ item }) => (
    <View style={dynamicStyles.carouselItemForYou}>
      <TouchableOpacity
        style={styles.iconButton1}
        onPress={() => handleFavoritePress(item._id)}
      >
        <Image
          source={
            favorites[item._id]
              ? darkMode
                ? require('../../../../assets/love-dm1.png') // Favoritado no Modo Escuro
                : require('../../../../assets/love.png') // Favoritado no Modo Claro
              : darkMode
              ? require('../../../../assets/love-dmi.png') // Não favoritado no Modo Escuro
              : require('../../../../assets/love1.png') // Não favoritado no Modo Claro
          }
          style={styles.icon}
        />
      </TouchableOpacity>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage2} />
      <Text style={dynamicStyles.nameBox3}>{item.name}</Text>
      <Text style={dynamicStyles.descriptionBox3}>{item.description}</Text>
      <Text style={dynamicStyles.priceBox3}>R$ {item.price}</Text>
      <TouchableOpacity style={dynamicStyles.customButton}
        onPress={() => navigation.navigate('DetailProduct', { product: item })}
      >
        <Image source={require('../../../../assets/add.png')} style={styles.buttonIcon1} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={dynamicStyles.container}>
      <View style={[dynamicStyles.cylindricalContainer, { opacity, pointerEvents: interactive ? 'auto' : 'none' }]}>
        <View style={styles.menuButtonContainer}>
          <TouchableOpacity style={styles.menuCircle} onPress={() => navigation.navigate('Profile')} activeOpacity={interactive ? 1 : 0.5}>
            {user && (
              <Image source={{ uri: user.photoUrl }} style={styles.userIcon} />
            )}
          </TouchableOpacity>

          <View style={styles.textContainer}>
            {user && (
              <Text style={dynamicStyles.greetingText}>{greeting},<Text style={dynamicStyles.bold}> {user.givenName}</Text> </Text>
            )}
            <Text style={dynamicStyles.exploreText}>Encontre tudo o que precisa aqui.</Text>
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
            paginationActiveColor={darkMode ? '#0288D1' : '#0BB3D9'}
            snapToInterval={15}
          />
        </View>

        <Department selectedDepartment={selectedDepartmentId} navigation={navigation} />

        <Text style={dynamicStyles.headerText}>Populares</Text>
        <View style={styles.carouselContainer}>
          <SwiperFlatList
            data={products.popularProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            snapToInterval={15}
          />
        </View>

        <Text style={dynamicStyles.suggestionText}>Recomendados</Text>
        <View style={styles.carouselContainerForYou}>
          <SwiperFlatList
            data={products.forYouProducts}
            renderItem={renderProductItemForYou}
            keyExtractor={(item) => item._id}
            snapToInterval={15}
          />
        </View>
      </ScrollView>

      <CilindricalMenu navigation={navigation} />
      <CartInfo />
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
    elevation: 3,
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
    elevation: 3,
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
