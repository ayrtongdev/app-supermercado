import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import useThemeStore from '../../../zustand/themeStore';


const Department = ({ navigation }) => {
    const [departments, setDepartments] = useState([]);
    const { darkMode } = useThemeStore();


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://192.168.18.48:3000/users/department');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
            }
        };

        fetchCategories();
    }, []);


    const handleDepartmentPress = (departmentId, index) => {
        navigation.navigate('Store', { departmentId, initialIndex: index });
    };

    const dynamicStyles = {
        categoryName: {
            ...styles.categoryName,
            color: darkMode ? '#E0E0E0' : '#000000',
        },
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleDepartmentPress(item._id)} style={styles.categoryItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
            <Text style={dynamicStyles.categoryName} numberOfLines={2}>{item.department}</Text>
        </TouchableOpacity>
    );

    return (

        <View style={styles.container} >

            <SwiperFlatList
              data={departments}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              horizontal={true}
              decelerationRate="fast"
              snapToAlignment="start"
              snapToInterval={15} 
              contentContainerStyle={{ paddingLeft: 5}} 
            />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 70,
    },
    categoryItem: {
        width: 100,
        alignItems: 'center',
        marginRight: 10,
    },
    categoryImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    categoryName: {
        marginTop: 10,
        textAlign: 'center',
    },
});

export default Department;