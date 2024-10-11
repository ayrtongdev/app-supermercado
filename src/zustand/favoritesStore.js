// favoriteStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useFavoriteStore = create((set, get) => ({
  favorites: {},
  favoritesLoaded: false, 
  setFavorites: (favorites) => set({ favorites }),
  
  addFavorite: (productId) => set((state) => ({
    favorites: { ...state.favorites, [productId]: true }
  })),
  
  removeFavorite: (productId) => set((state) => {
    const { [productId]: _, ...rest } = state.favorites;
    return { favorites: rest };
  }),
  
  fetchFavorites: async () => {
    const { favoritesLoaded } = get();
    
    // Evita requisição desnecessária se os favoritos já estiverem carregados
    if (!favoritesLoaded) {
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (userToken) {
        try {
          const response = await fetch('http://192.168.18.56:3000/users/favorites', {
            headers: {
              'Authorization': `Bearer ${userToken}`,
            },
          });
          
          if (response.ok) {
            const favoritesData = await response.json();
            const favoritesMap = {};
            
            favoritesData.forEach(product => {
              favoritesMap[product._id] = true;
            });
            
            set({ favorites: favoritesMap, favoritesLoaded: true });  // Atualiza flag
          }
        } catch (error) {
          console.error('Erro ao buscar favoritos:', error);
        }
      }
    }
  },
}));

export default useFavoriteStore;
