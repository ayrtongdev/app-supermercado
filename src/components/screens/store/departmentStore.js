import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import ProductCarousel from './productCarousel';
import useThemeStore from '../../../zustand/themeStore';

const Department = ({ selectedDepartment, navigation }) => {
    const [departments, setDepartments] = useState([]);
    const [subdepartments, setSubdepartments] = useState([]);
    const [productsBySubdepartment, setProductsBySubdepartment] = useState({});
    const [loadingSubdepartments, setLoadingSubdepartments] = useState(true);
    const flatListRef = useRef(null);
    const { darkMode } = useThemeStore();

    const dynamicStyles = {
        departmentName: {
            ...styles.departmentName,
            color: darkMode ? '#E0E0E0' : '#121212',
        },
        selectedDepartmentName: {
            ...styles.departmentName,
            color: darkMode ? '#0288D1' : '#0BB3D9',
        },
        subdepartmentTitle: {
            ...styles.subdepartmentTitle,
            color: darkMode ? '#E0E0E0' : '#121212',
        },
        underline: {
            ...styles.underline,
            backgroundColor: darkMode ? '#0288D1' : '#0BB3D9',
        },

    };


    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://192.168.18.48:3000/users/department');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Erro ao buscar departamentos:', error);
            }
        };

        fetchDepartments();
    }, []);


    useEffect(() => {
        if (selectedDepartment && departments.length > 0) {
            const selectedIndex = departments.findIndex(dept => dept._id === selectedDepartment);
            if (selectedIndex !== -1) {
                navigation.setParams({ departmentId: selectedDepartment });
                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                        index: selectedIndex,
                        animated: true,
                        viewPosition: 0.5,
                    });
                }
            }
        }
    }, [selectedDepartment, departments]);

    const getItemLayout = (data, index) => ({
        length: 100,
        offset: 100 * index,
        index,
    });

    useEffect(() => {
        if (selectedDepartment) {
            const fetchSubdepartmentsAndProducts = async () => {
                setLoadingSubdepartments(true);
                try {
                    const response = await fetch(`http://192.168.18.48:3000/users/subdepartments?department=${selectedDepartment}`);
                    const subdepartmentsData = await response.json();
                    setSubdepartments(subdepartmentsData);

                    const productsData = {};
                    for (const subdept of subdepartmentsData) {
                        const response = await fetch(`http://192.168.18.48:3000/products?department=${selectedDepartment}&subdepartment=${subdept.name}`);
                        const products = await response.json();
                        productsData[subdept._id] = products;
                    }
                    setProductsBySubdepartment(productsData);
                } catch (error) {
                    console.error('Erro ao buscar subdepartamentos e produtos:', error);
                } finally {
                    setLoadingSubdepartments(false);
                }
            };

            fetchSubdepartmentsAndProducts();
        }
    }, [selectedDepartment]);



    const handleDepartmentPress = (departmentId, initialIndex) => {
        navigation.setParams({ departmentId });

        if (flatListRef.current) {
            let newScrollIndex = initialIndex;
            if (newScrollIndex >= departments.length) {
                newScrollIndex = departments.length - 1;
            }

            flatListRef.current.scrollToIndex({
                index: newScrollIndex,
                animated: true,
                viewPosition: 0.5,
            });
        }
    };


    const renderDepartmentItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.departmentItem}
            onPress={() => handleDepartmentPress(item._id, index)}
        >
            <Text
                style={[
                    dynamicStyles.departmentName,
                    selectedDepartment === item._id && dynamicStyles.selectedDepartmentName
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {item.department}
            </Text>
            {selectedDepartment === item._id && <View style={dynamicStyles.underline} />}
        </TouchableOpacity>
    );

    const renderSubdepartmentCarousels = () => {
        return subdepartments
            .filter(subdept => productsBySubdepartment[subdept._id] && productsBySubdepartment[subdept._id].length > 0)
            .map((subdept) => (
                <View key={subdept._id} style={styles.subdepartmentContainer}>
                    <Text style={dynamicStyles.subdepartmentTitle}>{subdept.name}</Text>
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
                        getItemLayout={getItemLayout}
                    />
                    {loadingSubdepartments ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 180 }}>
                            <LottieView
                                source={require('../../../../assets/loading.json')}
                                autoPlay
                                loop
                                style={{ width: 150, height: 150 }}
                            />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.scrollViewContent}>
                            {renderSubdepartmentCarousels()}
                        </ScrollView>
                    )}
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
