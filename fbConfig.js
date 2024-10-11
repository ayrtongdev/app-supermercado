import { initializeApp } from "firebase/app";
import {
    initializeAuth,
    getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwrE8bdBwdcl0m_n6Ky7IqdOUOhb3FH1Q",
    authDomain: "barbosao-23134.firebaseapp.com",
    projectId: "barbosao-23134",
    storageBucket: "barbosao-23134.appspot.com",
    messagingSenderId: "1034812625711",
    appId: "1:1034812625711:web:ecf59e7ea4fc0ad44b87da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export default app;

// android: 542496326043-792dbbq869g2cm9rd6b0rcrk71nac1g0.apps.googleusercontent.com