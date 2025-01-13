import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    setPersistence, 
    browserSessionPersistence 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 회원가입 섹션 표시/숨김 기능
    const signupBtn = document.getElementById('signupBtn');
    const signupSection = document.querySelector('.signup-section');
    const closeBtn = document.querySelector('.closebtn');
    
    // 초기에는 회원가입 섹션을 숨김
    // signupSection.style.display = 'none';
    
    // 회원가입 버튼 클릭 시 회원가입 섹션 표시
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupSection.style.display = 'block';
    });
    
    // 닫기 버튼 클릭 시 회원가입 섹션 숨김
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupSection.style.display = 'none';
    });

    // 회원가입 폼 제출 처리
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // 기본 제출 동작 막기
        
        // w-form의 에러/성공 메시지 요소
        const successMessage = document.querySelector('.w-form-done');
        const errorMessage = document.querySelector('.w-form-fail');
        
        // 메시지 초기화
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            // 폼 데이터 가져오기
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const name = document.getElementById('Name-Two-2').value;
            const organization = document.getElementById('Organization-Two-2').value;
            const phone = document.getElementById('Phone-Two-2').value;
            const term = document.getElementById('Terms-Two-2').checked;

            // 유효성 검사
            if (!term) {
                alert('개인정보 보호정책에 동의해주세요.');
                return;
            }

            // Firebase Authentication으로 사용자 생성
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // 생성된 사용자 정보
            const user = userCredential.user;
            
            // 2. 즉시 로그웃하여 자동 로그인 방지
            await signOut(auth);

            // 3. Firestore에 추가 사용자 정보 저장
            try {
                const userDoc = await addDoc(collection(db, 'ansim_collection'), {
                    uid: user.uid,
                    email: email,
                    name: name,
                    organization: organization,
                    phone: phone,
                    createdAt: new Date().toISOString()
                });
                
                console.log("사용자 정보가 성공적으로 저장되었습니다. Document ID:", userDoc.id);
                
                // 4. 회원가입 성공 처리
                alert('회원가입이 종료되었습니다. 로그인해주세요.');
                
                // 5. 회원가입 모달 닫기
                document.querySelector('.signup-section').style.display = 'none';
                
                // 6. 로그인 폼에 이메일 자동 입력
                document.getElementById('Email-4').value = email;
                document.getElementById('Password-4').value = '';
                
                // 7. 회원가입 폼 초기화
                signupForm.reset();

            } catch (firestoreError) {
                console.error("Firestore 저장 실패:", firestoreError);
                alert('추가 정보 저장에 실패했습니다. 관리자에게 문의해주세요.');
            }

        } catch (error) {
            console.error("회원가입 에러:", error);
            let errorMsg = "회원가입 중 오류가 발생했습니다.";
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMsg = "이미 사용 중인 이메일 주소입니다.";
                    break;
                case 'auth/invalid-email':
                    errorMsg = "유효하지 않은 이메일 주소입니다.";
                    break;
                case 'auth/operation-not-allowed':
                    errorMsg = "이메일/비밀번호 로그인이 비활성화되어 있습니다.";
                    break;
                case 'auth/weak-password':
                    errorMsg = "비밀번호는 최소 6자리 이상이어야 합니다.";
                    break;
            }
            
            const errorMessage = document.querySelector('.w-form-fail');
            errorMessage.querySelector('div').textContent = errorMsg;
            errorMessage.style.display = 'block';
        }
    });

    // 로그인 폼 처리 추가
    const loginForm = document.getElementById('wf-form-Sign-In-Form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('Email-4').value;
        const password = document.getElementById('Password-4').value;
        
        try {
            // 브라우저 세션 지속성 설정
            await setPersistence(auth, browserSessionPersistence);
            
            // 로그인 시도
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // 로그인 성공
            console.log('로그인 성공:', user.email);
            
            // main.html로 리다이렉트
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('로그인 에러:', error);
            let errorMessage = '로그인 중 오류가 발생했습니다.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = '유효하지 않은 이메일 주소입니다.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = '해당 사용자 계정이 비활성화되었습니다.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = '등록되지 않은 이메일입니다.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = '잘못된 비밀번호입니다.';
                    break;
            }
            
            // 에러 메시지 표시
            const errorElement = document.querySelector('.a-error-message');
            errorElement.querySelector('div').textContent = errorMessage;
            errorElement.style.display = 'block';
        }
    });

    // 로그인 상태 확인
    auth.onAuthStateChanged((user) => {
        if (user) {
            // 현재 URL이 index.html이고 회원가입 모달이 닫혀있을 때만 리다이렉트
            const isSignupModalClosed = document.querySelector('.signup-section').style.display === 'none';
            if (window.location.pathname.includes('index.html') && isSignupModalClosed) {
                console.log('현재 로그인된 사용자:', user.email);
                window.location.href = 'dashboard.html';
            }
        }
    });
});