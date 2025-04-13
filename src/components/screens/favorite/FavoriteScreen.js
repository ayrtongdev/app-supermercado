import React, { useState, useRef } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCarousel from './productCarouselFavorites';
import CartInfo from '../../cartinfo/CartInfo';
import CilindricalMenu from '../../../components/menu/CilindricalMenu';
import useCartStore from '../../../zustand/store';
import useThemeStore from '../../../zustand/themeStore';
const FavoriteScreen = ({ navigation }) => {
  const { darkMode } = useThemeStore();
  const [departments, setDepartments] = useState([]);
  const [favoriteDepartments, setFavoriteDepartments] = useState([]);
  const [productsBySubdepartment, setProductsBySubdepartment] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const flatListRef = useRef(null);
  const fetchCartInfo = useCartStore(state => state.fetchCartInfo);

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: darkMode ? '#212121' : '#F2F2F2',
    },
    departmentTitle: (isSelected) => ({
      fontSize: 14,
      color: isSelected
        ? darkMode
          ? '#0288D1' // Selecionado no Modo Escuro
          : '#0BB3D9' // Selecionado no Modo Claro
        : darkMode
          ? '#A3A3A3' // Não selecionado no Modo Escuro
          : 'gray', // Não selecionado no Modo Claro
    }),
    underline: (isSelected) => ({
      height: 2,
      width: '100%',
      backgroundColor: isSelected
        ? darkMode
          ? '#0288D1' // Selecionado no Modo Escuro
          : '#0BB3D9' // Selecionado no Modo Claro
        : 'transparent', // Não aparece quando não selecionado
      marginTop: 8,
    }),
    subdepartmentTitle: {
      ...styles.subdepartmentTitle,
      color: darkMode ? '#E0E0E0' : '#121212',
    },
    

  };

  const fetchDepartmentAndFavorites = async () => {
    try {
      const departmentsResponse = await fetch('http://192.168.18.48:3000/users/department');
      const departmentsData = await departmentsResponse.json();
      setDepartments(departmentsData);

      const userToken = await AsyncStorage.getItem('userToken');
      const favoritesResponse = await fetch('http://192.168.18.48:3000/users/favorites', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
      });

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        const departmentsMap = {};

        favoritesData.forEach(product => {
          const department = Array.isArray(product.department) ? product.department[0] : product.department;
          const subdepartment = product.subdepartment;

          if (!departmentsMap[department]) {
            departmentsMap[department] = {
              departmentName: department,
              subdepartments: {},
            };
          }

          if (!departmentsMap[department].subdepartments[subdepartment]) {
            departmentsMap[department].subdepartments[subdepartment] = {
              subdepartmentName: subdepartment,
              products: [],
            };
          }

          departmentsMap[department].subdepartments[subdepartment].products.push(product);
        });

        const departmentsArray = Object.values(departmentsMap).filter(dept => {
          return departmentsData.some(department => department.department === dept.departmentName);
        });

        setFavoriteDepartments(departmentsArray);
        setProductsBySubdepartment(departmentsMap);
      } else {
        console.error('Error fetching favorites data:', favoritesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching department or favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };



  useFocusEffect(
    React.useCallback(() => {
      setLoadingFavorites(true);
      fetchDepartmentAndFavorites();
      fetchCartInfo();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      console.log('Favorite Departments:', favoriteDepartments);
      if (!selectedDepartment && favoriteDepartments.length > 0) {
        setSelectedDepartment(favoriteDepartments[0].departmentName);
      }
    }, [favoriteDepartments])
  );

  const handleDepartmentPress = (departmentName, index) => {
    setSelectedDepartment(departmentName);

    const scrollOffset = index - previousIndex;

    if (flatListRef.current) {
      let newScrollIndex = index;

      if (scrollOffset > 0) {
        newScrollIndex = Math.min(index + 0.1, favoriteDepartments.length - 1);
      }

      if (scrollOffset < 0) {
        newScrollIndex = Math.max(index - 0.1, 0);
      }

      flatListRef.current.scrollToIndex({
        index: newScrollIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }

    setPreviousIndex(index);
  };

  const renderSubdepartmentCarousels = () => {
    if (!selectedDepartment) return null;

    const departmentData = productsBySubdepartment[selectedDepartment];
    if (!departmentData) return null;

    return Object.keys(departmentData.subdepartments).map((subdeptId, index) => (
      <View key={`${subdeptId}-${index}`} style={styles.subdepartmentContainer}>
        <Text style={dynamicStyles.subdepartmentTitle}>{departmentData.subdepartments[subdeptId].subdepartmentName}</Text>
        <ProductCarousel
          products={departmentData.subdepartments[subdeptId].products}
          navigation={navigation}
        />
      </View>
    ));
  };

  return (
    <View style={dynamicStyles.container}>
      <FlatList
        ref={flatListRef}
        data={favoriteDepartments}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.departmentContainer}
            onPress={() => handleDepartmentPress(item.departmentName, index)}
          >
            <Text
              style={dynamicStyles.departmentTitle(selectedDepartment === item.departmentName)}
            >
              {item.departmentName}
            </Text>
            <View
              style={dynamicStyles.underline(selectedDepartment === item.departmentName)}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `${item.departmentName}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
      />


      {loadingFavorites ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LottieView
            source={require('../../../../assets/loading.json')}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>
      ) : favoriteDepartments.length === 0 ? (
        <View style={styles.emptyFavoritesContainer}>
          <LottieView
            source={require('../../../../assets/favorite.json')}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.emptyFavoritesText}>
            Comece a favoritar produtos para vê-los aqui!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {renderSubdepartmentCarousels()}
        </ScrollView>
      )}

      <CartInfo />
      <CilindricalMenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyFavoritesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 275,
  },
  emptyFavoritesText: {
    marginTop: 20,
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 150,
  },
  subdepartmentContainer: {
    marginVertical: 20,
  },
  subdepartmentTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
  },
  departmentContainer: {
    marginTop: 50,
    marginHorizontal: 20,
    paddingVertical: 15,
  },
  departmentTitle: {
    fontSize: 14,
    color: 'gray',
  },
  selectedDepartmentTitle: {
    color: '#0BB3D9',
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: '#0BB3D9',
    marginTop: 8,
  },
});

export default FavoriteScreen;