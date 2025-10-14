// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 

const firebaseConfig = {
    apiKey: "AIzaSyBf26c_Sir-BDn5potQNiHoh3rwsUXxRhw",
    authDomain: "mywebsiteauth-aof.firebaseapp.com",
    projectId: "mywebsiteauth-aof",
    storageBucket: "mywebsiteauth-aof.firebasestorage.app",
    messagingSenderId: "400451587997",
    appId: "1:400451587997:web:7caa309ee8029773692974"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
