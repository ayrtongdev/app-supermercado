//StoreScreen.js

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import CilindricalMenu from '../../menu/CilindricalMenu';
import SearchBarStore from '../../screens/store/SearchBarStore';
import CartInfo from '../../cartinfo/CartInfo';
import Department from './departmentStore';
import useKeyboard from '../../hooks/useKeyboard';
import useCartStore from '../../../zustand/store';
import { useFocusEffect } from '@react-navigation/native';
import useThemeStore from '../../../zustand/themeStore';


const StoreScreen = ({ route, navigation }) => {
    const isKeyboardVisible = useKeyboard();
    const fetchCartInfo = useCartStore(state => state.fetchCartInfo); 
    const { departmentId } = route.params || {};
    const [departments, setDepartments] = React.useState([]);
    const { darkMode } = useThemeStore();

    const dynamicStyles = {
        container: {
          ...styles.container,
          backgroundColor: darkMode ? '#212121' : '#F2F2F2',
        },
    
      };

    useFocusEffect(
        React.useCallback(() => {
            fetchCartInfo();
        }, [])
    );

    useEffect(() => {
        if (!departmentId && departments.length > 0) {
            navigation.setParams({ departmentId: departments[0]._id });
        }
    }, [departmentId, departments]);

    
    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://192.168.18.48:3000/users/department');
            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error('Erro ao buscar departamentos:', error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);


    return (
        <View style={dynamicStyles.container}>
            <View contentContainerStyle={styles.contentContainer}>
                <SearchBarStore/>
                <Department selectedDepartment={departmentId} navigation={navigation} />
            </View>
            {!isKeyboardVisible && <CilindricalMenu navigation={navigation} />}
            {!isKeyboardVisible && <CartInfo />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    contentContainer: {
        paddingBottom: 250,
    },
});

export default StoreScreen;
