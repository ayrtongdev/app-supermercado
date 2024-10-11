import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';

import ProductCarousel from './productCarousel';

const Department = ({ selectedDepartment, navigation }) => {
    const [departments, setDepartments] = useState([]);
    const [subdepartments, setSubdepartments] = useState([]);
    const [productsBySubdepartment, setProductsBySubdepartment] = useState({});
    const [previousIndex, setPreviousIndex] = useState(0);
    const flatListRef = useRef(null);
    

    
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://192.168.18.56:3000/users/department');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Erro ao buscar departamentos:', error);
            }
        };
    
        fetchDepartments();
    }, []);
    

    useEffect(() => {
        if (selectedDepartment) {
            const fetchSubdepartmentsAndProducts = async () => {
                try {
                    const response = await fetch(`http://192.168.18.56:3000/users/subdepartments?department=${selectedDepartment}`);
                    const subdepartmentsData = await response.json();
                    setSubdepartments(subdepartmentsData);

                    const productsData = {};
                    for (const subdept of subdepartmentsData) {
                        const response = await fetch(`http://192.168.18.56:3000/products?department=${selectedDepartment}&subdepartment=${subdept.name}`);
                        const products = await response.json();
                        productsData[subdept._id] = products;
                    }
                    setProductsBySubdepartment(productsData);
                } catch (error) {
                    console.error('Erro ao buscar subdepartamentos e produtos:', error);
                }
            };

            fetchSubdepartmentsAndProducts();
        }
    }, [selectedDepartment]);

    const handleDepartmentPress = (departmentId, index) => {
        navigation.setParams({ departmentId });

        
        const scrollOffset = index - previousIndex;

        if (flatListRef.current) {
            
            let newScrollIndex = index;

           
            if (scrollOffset > 0) {
                newScrollIndex = Math.min(index + 0.1, departments.length - 1);
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

    

    const renderDepartmentItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.departmentItem}
            onPress={() => handleDepartmentPress(item._id, index)}
        >
            <Text
                style={[
                    styles.departmentName,
                    selectedDepartment === item._id && styles.selectedDepartmentName
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {item.department}
            </Text>
            {selectedDepartment === item._id && <View style={styles.underline} />}
        </TouchableOpacity>
    );

    const renderSubdepartmentCarousels = () => {
        return subdepartments.map((subdept) => (
            <View key={subdept._id} style={styles.subdepartmentContainer}>
                <Text style={styles.subdepartmentTitle}>{subdept.name}</Text>
                <ProductCarousel products={productsBySubdepartment[subdept._id] || []} navigation={navigation} />
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            {selectedDepartment && (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={departments}
                        renderItem={renderDepartmentItem}
                        keyExtractor={(item) => item._id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}

                    />
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        {renderSubdepartmentCarousels()}
                    </ScrollView>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    flatListContent: {
        paddingHorizontal: 10,
    },
    departmentItem: {
        width: 100,
        alignItems: 'center',
        paddingVertical: 10,
    },
    departmentName: {
        marginTop: 5,
        textAlign: 'center',
        color: 'gray',
        
    },
    selectedDepartmentName: {
        color: '#0BB3D9',
    },
    underline: {
        height: 2,
        width: '80%',
        backgroundColor: '#0BB3D9',
        marginTop: 10,
    },
    subdepartmentContainer: {
        marginVertical: 20,
    },
    subdepartmentTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 15,
        marginBottom: 10,
    },
    scrollViewContent: {
        paddingBottom: 500,
    },
});

export default Department;
