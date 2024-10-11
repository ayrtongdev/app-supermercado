import React, { useState, useRef } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCarousel from './productCarouselFavorites';
import CartInfo from '../../cartinfo/CartInfo';
import CilindricalMenu from '../../../components/menu/CilindricalMenu';
import useCartStore from '../../../zustand/store';

const FavoriteScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [favoriteDepartments, setFavoriteDepartments] = useState([]);
  const [productsBySubdepartment, setProductsBySubdepartment] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [previousIndex, setPreviousIndex] = useState(0); 
  const flatListRef = useRef(null); 
  const fetchCartInfo = useCartStore(state => state.fetchCartInfo);



  const fetchDepartmentAndFavorites = async () => {
    try {
      const departmentsResponse = await fetch('http://192.168.18.56:3000/users/department');
      const departmentsData = await departmentsResponse.json();
      setDepartments(departmentsData);

      const userToken = await AsyncStorage.getItem('userToken');
      const favoritesResponse = await fetch('http://192.168.18.56:3000/users/favorites', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        const departmentsMap = {};

        favoritesData.forEach(product => {
          const { department, subdepartment } = product;

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
          const exists = departmentsData.some(department => department.department === dept.departmentName);
          return exists;
        });

        setFavoriteDepartments(departmentsArray);
        setProductsBySubdepartment(departmentsMap);
      } else {
        console.error('Error fetching favorites data:', favoritesResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching department or favorites:', error);
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      fetchDepartmentAndFavorites();
      fetchCartInfo();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
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
        <Text style={styles.subdepartmentTitle}>{departmentData.subdepartments[subdeptId].subdepartmentName}</Text>
        <ProductCarousel
          products={departmentData.subdepartments[subdeptId].products.map(product => ({
            ...product,
          }))}
          navigation={navigation}
        />
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef} 
        data={favoriteDepartments}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.departmentContainer}
            onPress={() => handleDepartmentPress(item.departmentName, index)} 
          >
            <Text
              style={[
                styles.departmentTitle,
                selectedDepartment === item.departmentName && styles.selectedDepartmentTitle
              ]}
            >
              {item.departmentName}
            </Text>
            {selectedDepartment === item.departmentName && <View style={styles.underline} />}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `${item.departmentName}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
      />


      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderSubdepartmentCarousels()}
      </ScrollView>
      <CartInfo />
      <CilindricalMenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F2',
    flex: 1,
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
    marginTop: 40,
    marginHorizontal: 20,
    paddingVertical: 15,
  },
  departmentTitle: {
    fontSize: 14,
    color: 'gray',
    fontWeight: 'bold',
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
