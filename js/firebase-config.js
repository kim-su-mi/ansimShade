// Firebase SDK 임포트
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBy-RJGNxixlLJC19kFaODWvB5yxh-d6BQ",
    authDomain: "ahnsimshade-dfeef.firebaseapp.com",
    projectId: "ahnsimshade-dfeef",
    storageBucket: "ahnsimshade-dfeef.firebasestorage.app",
    messagingSenderId: "769551436852",
    appId: "1:769551436852:web:bc1d36c4aac0e072778e61",
    measurementId: "G-P2H1HSJXZ3"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 외부에서 사용할 수 있도록 내보내기
export { app, auth, db }; 