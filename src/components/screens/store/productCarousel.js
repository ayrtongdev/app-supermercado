import React from 'react';
import { View, StyleSheet } from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import ProductCard from './productCard'; 

const ProductCarousel = ({ products, navigation }) => {
    return (
        <View style={styles.carouselConteiner}>
        <SwiperFlatList
            data={products}
            renderItem={({ item }) => <ProductCard product={item} navigation={navigation} />}
            keyExtractor={(item) => item._id}
            onSwipeLeft={(item) => (`Swiped left: ${item.name}`)}
            onSwipeRight={(item) => (`Swiped right: ${item.name}`)}
            snapToInterval={15}
        />
        </View>
    );
};

const styles = StyleSheet.create({
    carouselConteiner: {
        paddingLeft: 10,
    },
});

export default ProductCarousel;
