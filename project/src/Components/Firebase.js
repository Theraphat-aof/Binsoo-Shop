// src/firebase.js

// นำเข้าฟังก์ชันที่จำเป็นจาก Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // สำหรับ Firebase Authentication

// การตั้งค่า Firebase ของคุณ
// (ส่วนที่คุณคัดลอกมาจาก Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyBf26c_Sir-BDn5potQNiHoh3rwsUXxRhw",
    authDomain: "mywebsiteauth-aof.firebaseapp.com",
    projectId: "mywebsiteauth-aof",
    storageBucket: "mywebsiteauth-aof.firebasestorage.app",
    messagingSenderId: "400451587997",
    appId: "1:400451587997:web:7caa309ee8029773692974"
};

// เริ่มต้น Firebase app
const app = initializeApp(firebaseConfig);

// รับ instance ของ Auth
export const auth = getAuth(app); // ส่งออก (export) auth เพื่อให้ Component อื่นๆ นำไปใช้

// หากคุณจะใช้บริการ Firebase อื่นๆ เช่น Firestore, Storage
// ก็จะนำเข้าและ export เพิ่มเติมจากที่นี่ได้
// import { getFirestore } from 'firebase/firestore';
// export const db = getFirestore(app);