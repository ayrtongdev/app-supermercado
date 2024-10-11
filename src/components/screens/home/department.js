import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';

const Department = ({ navigation }) => {
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://192.168.18.56:3000/users/department');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
            }
        };

        fetchCategories();
    }, []);

    // Função para navegar para a página da loja com o departamento selecionado
    const handleDepartmentPress = (departmentId) => {
        console.log('Navigating to Store with departmentId:', departmentId);
        navigation.navigate('Store', { departmentId });
    };

    
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleDepartmentPress(item._id)} style={styles.categoryItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
            <Text style={styles.categoryName} numberOfLines={2}>{item.department}</Text>
        </TouchableOpacity>
    );

    return (
        
        <View style={styles.container}>
            
            <SwiperFlatList
                data={departments}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                snapToInterval={15}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 70,
    },
    categoryItem: {
        width: 100,
        alignItems: 'center',
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