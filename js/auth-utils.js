import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

export async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('로그아웃 중 에러 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
} 