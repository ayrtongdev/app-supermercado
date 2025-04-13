// themeStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useThemeStore = create((set, get) => ({
  darkMode: false,
  setDarkMode: async (value) => {
    await AsyncStorage.setItem('darkMode', JSON.stringify(value));
    set({ darkMode: value });
  },
  loadTheme: async () => {
    try {
      const storedValue = await AsyncStorage.getItem('darkMode');
      if (storedValue !== null) {
        set({ darkMode: JSON.parse(storedValue) });
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  },
  toggleTheme: async () => {
    const newValue = !get().darkMode;
    await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
    set({ darkMode: newValue });
  },
}));

export default useThemeStore;
