// favoriteStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useFavoriteStore = create((set, get) => ({
  favorites: {},
  favoritesLoaded: false,
  
  // Define o estado inicial dos favoritos
  setFavorites: (favorites) => set({ favorites }),

  // Nova função toggleFavorite para alternar o estado de um favorito
  toggleFavorite: async (productId) => {
    const { favorites } = get();
    const updatedFavorites = { ...favorites };

    if (updatedFavorites[productId]) {
      // Remove dos favoritos se já estiver presente
      delete updatedFavorites[productId];
    } else {
      // Adiciona aos favoritos se ainda não estiver presente
      updatedFavorites[productId] = true;
    }

    // Atualiza o estado no Zustand e armazena no AsyncStorage
    set({ favorites: updatedFavorites });
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  },

  // Função fetchFavorites para carregar os favoritos do servidor e do AsyncStorage
  fetchFavorites: async () => {
    const { favoritesLoaded } = get();
    
    if (!favoritesLoaded) {
      const userToken = await AsyncStorage.getItem('userToken');

      if (userToken) {
        try {
          const response = await fetch('http://192.168.18.48:3000/users/favorites', {
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

            set({ favorites: favoritesMap, favoritesLoaded: true });
            await AsyncStorage.setItem('favorites', JSON.stringify(favoritesMap)); 
          }
        } catch (error) {
          console.error('Erro ao buscar favoritos:', error);
        }
      }
    }
  },

  // Limpa todos os favoritos do estado e reseta o AsyncStorage
  clearFavorites: () => {
    set({ favorites: {}, favoritesLoaded: false });
  },
}));

export default useFavoriteStore;
