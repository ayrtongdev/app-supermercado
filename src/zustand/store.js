// store.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create((set) => ({
    cartInfo: { itemCount: 0, totalValue: 0 },
    setCartInfo: (data) => set({ cartInfo: data }),
    fetchCartInfo: async () => {
        const userToken = await AsyncStorage.getItem('userToken');
        try {
            const response = await fetch('http://192.168.18.56:3000/users/cart/info', {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            const data = await response.json();
            set({ cartInfo: data });
        } catch (error) {
            console.error('Erro ao buscar informações do carrinho:', error);
        }
    },
}));

export default useCartStore;
